import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { ActionSheetController, AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { TransferInLine } from 'src/app/modules/transactions/models/transfer-in';
import { TransferInService } from 'src/app/modules/transactions/services/transfer-in.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
   selector: 'app-transfer-in-item',
   templateUrl: './transfer-in-item.page.html',
   styleUrls: ['./transfer-in-item.page.scss'],
})
export class TransferInItemPage implements OnInit, ViewWillEnter {

   systemWideEAN13IgnoreCheckDigit: boolean = false;

   constructor(
      public objectService: TransferInService,
      private authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
   ) { }

   ionViewWillEnter(): void {

   }

   ngOnDestroy(): void {

   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   pickingQtyControl: string = "0";
   systemWideScanningMethod: string;
   configMobileScanItemContinuous: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
         }

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }
      })
   }

   /* #region barcode */

   async validateBarcode(barcode: string) {
      try {
         if (barcode) {
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
               if (found_barcode) {
                  let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
                  let outputData: TransferInLine = {
                     interTransferLineId: 0,
                     interTransferVariationId: 0,
                     interTransferId: this.objectService.objectHeader.interTransferId,
                     sequence: this.objectService.objectHeader.line.length,
                     itemId: found_item_master.id,
                     itemCode: found_item_master.code,
                     itemSku: found_barcode.sku,
                     itemDesc: found_item_master.itemDesc,
                     xId: found_barcode.xId,
                     xCd: found_barcode.xCd,
                     xDesc: found_barcode.xDesc,
                     yId: found_barcode.yId,
                     yCd: found_barcode.yCd,
                     yDesc: found_barcode.yDesc,
                     barcode: found_barcode.barcode,
                     qty: 0,
                     qtyReceive: 1,
                     isDeleted: false
                  }
                  return outputData;
               } else {
                  this.toastService.presentToast("", "Barcode not found", "top", "warning", 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (event) {
            event.forEach(async r => {
               let outputData: TransferInLine = {
                  interTransferLineId: 0,
                  interTransferVariationId: 0,
                  interTransferId: this.objectService.objectHeader.interTransferId,
                  sequence: this.objectService.objectHeader.line.length,
                  itemId: r.itemId,
                  itemCode: r.itemCode,
                  itemSku: r.itemSku,
                  itemDesc: r.description,
                  xId: r.itemVariationXId,
                  xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.code,
                  xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
                  yId: r.itemVariationYId,
                  yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.code,
                  yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
                  barcode: r.itemBarcode,
                  qty: 0,
                  qtyReceive: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  isDeleted: false
               }
               this.insertIntoLine(outputData);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   insertIntoLine(event: TransferInLine) {
      if (event) {
         if (this.objectService.objectHeader.line.findIndex(r => r.itemSku === event.itemSku) > -1) {
            let index = this.objectService.objectHeader.line.findIndex(r => r.itemSku === event.itemSku);
            this.objectService.objectHeader.line[index].qtyReceive = (this.objectService.objectHeader.line[index].qtyReceive ?? 0) + 1;
         } else {
            this.objectService.objectHeader.line.push(event);
         }
      }
   }

   async deleteLine(rowIndex: number, event: TransferInLine) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Are you sure to delete?",
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "danger",
               handler: async () => {
                  this.objectService.objectHeader.line.splice(rowIndex, 1);
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               handler: () => {

               }
            },
         ],
      });
      await alert.present();
   }

   /* #region camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      try {
         this.scanActive = event;
         if (this.scanActive) {
            document.body.style.background = "transparent";
         }
      } catch (e) {
         console.error(e);
      }
   }

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   async onDoneScanning(event) {
      try {
         if (event) {
            let itemFound = await this.validateBarcode(event);
            if (itemFound) {
               this.insertIntoLine(itemFound);
            } else {
               this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
            }
            if (this.configMobileScanItemContinuous) {
               await this.barcodescaninput.startScanning();
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region  misc */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #endregion */

   /* #region for web testing */

   itemSearchValue: string;
   handleKeyDown(event) {
      if (event.keyCode === 13) {
         this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
            this.itemSearchValue = null;
            if (response) {
               let outputData: TransferInLine = {
                  interTransferLineId: 0,
                  interTransferVariationId: 0,
                  interTransferId: this.objectService.objectHeader.interTransferId,
                  sequence: this.objectService.objectHeader.line.length,
                  itemId: response.itemId,
                  itemCode: response.itemCode,
                  itemSku: response.itemSku,
                  itemDesc: response.description,
                  xId: response.itemVariationLineXId,
                  xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === response.itemVariationLineXId)?.code,
                  xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === response.itemVariationLineXId)?.description,
                  yId: response.itemVariationLineYId,
                  yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === response.itemVariationLineYId)?.code,
                  yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === response.itemVariationLineYId)?.description,
                  barcode: response.itemBarcode,
                  qty: 0,
                  qtyReceive: 1,
                  isDeleted: false
               }
               this.insertIntoLine(outputData);
            }
         }, error => {
            console.error(error);
         })
         event.preventDefault();
      }
   }

   /* #endregion */

   /* #region steps */

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
            subHeader: "Changes made will be discard.",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
               },
               {
                  text: "No",
                  role: "cancel",
               }]
         });
         await actionSheet.present();

         const { role } = await actionSheet.onWillDismiss();

         if (role === "confirm") {
            this.objectService.resetVariables();
            this.navController.navigateBack("/transactions/transfer-in");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      const alert = await this.alertController.create({
         header: "Are you sure to proceed?",
         cssClass: "custom-action-sheet",
         buttons: [
            {
               text: "Yes",
               role: "confirm",
               cssClass: "success",
               handler: async () => {
                  this.updateObject();
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               handler: () => {

               }
            },
         ],
      });
      await alert.present();
   }

   updateObject() {
      this.objectService.updateObject(this.objectService.objectHeader).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("", "Inter Transfer updated", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.objectHeader.interTransferId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-in/transfer-in-detail", navigationExtras);
         }
      }, error => {
         console.error(error);
      })
   }

   /* #endregion */

}
