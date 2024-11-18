import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { ConsignmentSalesService } from '../../../services/consignment-sales.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { v4 as uuidv4 } from 'uuid';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
   selector: 'app-consignment-sales-detail',
   templateUrl: './consignment-sales-detail.page.html',
   styleUrls: ['./consignment-sales-detail.page.scss'],
})
export class ConsignmentSalesDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      public objectService: ConsignmentSalesService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) {
   }

   ionViewWillEnter(): void {
      this.route.queryParams.subscribe(async params => {
         this.objectId = params["objectId"];
         if (this.objectId) {
            await this.loadObject();
         }
      })
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   maxPrecision: number = 2;
   maxPrecisionTax: number = 2;
   consignmentSalesActivateMarginCalculation: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let activateMargin = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesActivateMarginCalculation");
            if (activateMargin && activateMargin.ctrlValue.toUpperCase() == "Y") {
               this.consignmentSalesActivateMarginCalculation = true;
            }
         })
         this.authService.precisionList$.subscribe(precision => {
            this.precisionSales = precision.find(x => x.precisionCode == "SALES");
            this.precisionTax = precision.find(x => x.precisionCode == "TAX");
            this.maxPrecision = this.precisionSales.localMax;
            this.maxPrecisionTax = this.precisionTax.localMax;
         })
      } catch (e) {
         console.error(e);
      }
   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         if (this.objectId) {
            this.objectService.getObjectById(this.objectId).subscribe(async response => {
               let objectRoot = response;
               objectRoot.header = this.commonService.convertObjectAllDateType(objectRoot.header);
               if (objectRoot.header.isHomeCurrency) {
                  objectRoot.header.maxPrecision = this.precisionSales.localMax;
                  objectRoot.header.maxPrecisionTax = this.precisionTax.localMax
               } else {
                  objectRoot.header.maxPrecision = this.precisionSales.foreignMax;
                  objectRoot.header.maxPrecisionTax = this.precisionTax.foreignMax;
               }
               objectRoot.details.forEach(r => {
                  r.guid = uuidv4();
               })
               await this.objectService.setHeader(objectRoot.header);
               await this.objectService.setLines(objectRoot.details);
               await this.loadingService.dismissLoading();
               await this.resetFilteredObj();
            }, async error => {
               await this.loadingService.dismissLoading();
               console.error(error);
            })
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   edit() {
      this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-item");
   }

   async toggleObjectAlert() {
      const alert = await this.alertController.create({
         header: "Are you sure to proceed?",
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
               text: "Cancel",
               role: "cancel",
               cssClass: "cancel",
            },
         ],
      });
      await alert.present();
   }

   completeObject() {
      if (this.objectService.objectHeader.isEntryCompleted) {
         this.objectService.unCompleteObject(this.objectId).subscribe(response => {
            if (response.status === 204) {
               this.toastService.presentToast("", "Consignment Sales updated", "top", "success", 1000);
               this.loadObject();
            }
         }, error => {
            console.error(error);
         })
      } else {
         this.objectService.completeObject(this.objectId).subscribe(response => {
            if (response.status === 204) {
               this.toastService.presentToast("", "Consignment Sales updated", "top", "success", 1000);
               this.loadObject();
            }
         }, error => {
            console.error(error);
         })
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
         this.objectService.downloadPdf("SMCS001", "pdf", this.objectService.objectHeader.consignmentSalesId, "Mobile Ticketing").subscribe(response => {
            let filename = this.objectService.objectHeader.consignmentSalesNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   previousStep() {
      this.objectService.resetVariables();
      this.navController.navigateRoot("/transactions/consignment-sales");
   }


   /* #region line search bar */

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: TransactionDetail[] = [];
   async search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(r =>
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.description?.toUpperCase().includes(searchText.toUpperCase())
            )));
            if (newSearch) {
               this.currentPage = 1;
            }
         } else {
            if (this.itemSearchText && this.itemSearchText.trim().length > 0 && this.itemSearchText.trim().length < 3) {
               this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
            }
            await this.resetFilteredObj();
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail));
   }

}
