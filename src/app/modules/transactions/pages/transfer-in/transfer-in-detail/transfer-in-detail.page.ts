import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferInService } from '../../../services/transfer-in.service';
import { TransferInHeader } from '../../../models/transfer-in';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-transfer-in-detail',
   templateUrl: './transfer-in-detail.page.html',
   styleUrls: ['./transfer-in-detail.page.scss'],
})
export class TransferInDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   object: TransferInHeader;

   constructor(
      private authService: AuthService,
      private route: ActivatedRoute,
      private navController: NavController,
      public objectService: TransferInService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private commonService: CommonService
   ) {
      try {
         this.route.queryParams.subscribe(params => {
            this.objectId = params["objectId"];
         })
      } catch (e) {
         console.error(e);
      }
   }

   ionViewWillEnter(): void {

   }

   ngOnInit() {
      if (this.objectId && this.objectId > 0) {
         this.loadObject();
      } else {
         this.toastService.presentToast("", "Invalid Transfer In.", "top", "warning", 1000);
         this.navController.navigateBack("/transactions/transfer-in");
      }
      this.loadModuleControl();
   }

   loadModuleControl() {
      try {

      } catch (e) {
         console.error(e);
         this.toastService.presentToast("Error loading module control", "", "top", "danger", 1000);
      }
   }

   loadObject() {
      try {
         this.objectService.getObjectById(this.objectId).subscribe(response => {
            this.object = response;
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
         this.toastService.presentToast("Error", "Transfer In", "top", "danger", 1000);
      }
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

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
         this.objectService.downloadPdf("WDWO003", "pdf", this.object.interTransferId, null).subscribe(response => {
            let filename = this.object.interTransferNum + ".pdf";
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
