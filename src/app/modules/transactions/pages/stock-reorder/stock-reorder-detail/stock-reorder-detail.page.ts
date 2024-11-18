import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, NavController, AlertController, IonPopover, ActionSheetController } from '@ionic/angular';
import { StockReorderLine, StockReorderRoot } from 'src/app/modules/transactions/models/stock-reorder';
import { StockReorderService } from 'src/app/modules/transactions/services/stock-reorder.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-stock-reorder-detail',
   templateUrl: './stock-reorder-detail.page.html',
   styleUrls: ['./stock-reorder-detail.page.scss'],
})
export class StockReorderDetailPage implements OnInit, ViewWillEnter {

   objectId: number;

   constructor(
      public objectService: StockReorderService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) {
      try {
         this.route.queryParams.subscribe(params => {
            this.objectId = params['objectId'];
         })
      } catch (e) {
         console.error(e);
      }
   }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
   }

   ngOnInit() {
      if (this.objectId && this.objectId > 0) {
         this.loadObject();
      } else {
         this.toastService.presentToast('', 'Invalid Stock Reorder.', 'top', 'warning', 1000);
         this.navController.navigateBack('/transactions/stock-reorder');
      }
      this.loadModuleControl();
   }

   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   loadModuleControl() {
      try {
         this.authService.precisionList$.subscribe(precision => {
            this.precisionSales = precision.find(x => x.precisionCode == "SALES");
            this.precisionTax = precision.find(x => x.precisionCode == "TAX");
         })
      } catch (e) {
         console.error(e);
         this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
      }
   }

   loadObject() {
      try {
         this.objectService.getObjectById(this.objectId).subscribe(response => {
            let object = response as StockReorderRoot;
            this.objectService.setObject(object);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
         this.toastService.presentToast('Error', 'Stock Reorder', 'top', 'danger', 1000);
      }
   }

   async completeObjectAlert() {
      const alert = await this.alertController.create({
         header: 'Are you sure to proceed?',
         cssClass: "custom-action-sheet",
         buttons: [
            {
               text: "Yes",
               role: "confirm",
               cssClass: "success",
               handler: async () => {
                  this.completeObject();
               },
            },
            {
               text: 'Cancel',
               role: 'cancel',
               cssClass: 'cancel',
            },
         ],
      });
      await alert.present();
   }

   editObject() {
      this.navController.navigateRoot("/transactions/stock-reorder/stock-reorder-header");
   }

   completeObject() {
      this.objectService.completeObject(this.objectId).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("", "Sales Order generated", "top", "success", 1000);
            this.loadObject();
         }
      }, error => {
         console.error(error);
      })
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   filter(details: StockReorderLine[]) {
      try {
         return details.filter(r => r.lineQty > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region download pdf */

   async presentAlertViewPdf() {
      try {
         const alert = await this.alertController.create({
            header: "Download PDF?",
            message: "",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.downloadPdf();
                  },
               },
               {
                  cssClass: "cancel",
                  text: "Cancel",
                  role: "cancel"
               },
            ]
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async downloadPdf() {
      try {
         await this.loadingService.showLoading();
         this.objectService.downloadPdf("SMSC002", "pdf", this.objectService.object.salesOrderId, "Sales Order").subscribe(response => {
            let filename = this.objectService.object.salesOrderNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

}
