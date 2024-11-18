import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { StockReorderLine, StockReorderRoot } from 'src/app/modules/transactions/models/stock-reorder';
import { StockReorderService } from 'src/app/modules/transactions/services/stock-reorder.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-stock-reorder-item',
   templateUrl: './stock-reorder-item.page.html',
   styleUrls: ['./stock-reorder-item.page.scss'],
})
export class StockReorderItemPage implements OnInit {

   constructor(
      public objectService: StockReorderService,
      public authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
   ) { }

   ngOnInit() {
   }

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (event) {
            event.forEach(async r => {
               let outputData: StockReorderLine = {
                  id: 0,
                  uuid: uuidv4(),
                  stockReorderId: this.objectService.object.stockReorderId,
                  sequence: 0,
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
                  lineQty: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  isDeleted: false
               }
               this.insertIntoLine(outputData);
            })
         }
      } catch (e) {
         console.error(e);
      }
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
            if (this.objectService.configMobileScanItemContinuous) {
               await this.barcodescaninput.startScanning();
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   async insertIntoLine(event: StockReorderLine) {
      if (event) {
         if (this.objectService.object.line === null || this.objectService.object.line === undefined) {
            this.objectService.object.line = [];
         }
         if (this.objectService.object.line !== null && this.objectService.object.line.length > 0) {
            if (this.objectService.object.line[0].itemSku === event.itemSku) {
               this.objectService.object.line[0].lineQty += event.lineQty;
            } else {
               this.objectService.object.line.unshift(event);
            }
         } else {
            this.objectService.object.line.unshift(event);
         }
         await this.checkOriginQtyBalance(false);
      }
   }

   async deleteLine(rowIndex: number, event: StockReorderLine) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Are you sure to delete?",
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "danger",
               handler: async () => {
                  this.objectService.object.line.splice(rowIndex, 1);
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

   /* #region barcode & check so */

   async validateBarcode(barcode: string) {
      try {
         if (barcode) {
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
               if (found_barcode) {
                  let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
                  let outputData: StockReorderLine = {
                     id: 0,
                     uuid: uuidv4(),
                     stockReorderId: this.objectService.object.stockReorderId,
                     sequence: 0,
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
                     lineQty: 1,
                     isDeleted: false
                  }
                  return outputData;
               } else {
                  this.toastService.presentToast("", "Barcode not found.", "top", "danger", 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   previousStep() {
      this.navController.navigateBack("/transactions/stock-reorder/stock-reorder-header");
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
                  if (await this.checkOriginQtyBalance() === true) {
                     if (this.objectService.object.stockReorderId === 0) {
                        this.insertObject();
                     } else {
                        this.updateObject();
                     }
                  }
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

   insertObject() {
      if (this.objectService.object.line !== null && this.objectService.object.line.length > 0) {
         this.objectService.insertObject(this.objectService.object).subscribe(response => {
            if (response.status === 201) {
               this.toastService.presentToast("", "Stock Reorder created", "top", "success", 1000);
               let objectId = (response.body as StockReorderRoot).stockReorderId;
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: objectId
                  }
               }
               this.navController.navigateRoot("/transactions/stock-reorder/stock-reorder-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         })
      } else {
         this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
      }
   }

   updateObject() {
      if (this.objectService.object.line !== null && this.objectService.object.line.length > 0) {
         this.objectService.updateObject(this.objectService.object).subscribe(response => {
            if (response.status === 201) {
               this.toastService.presentToast("", "Stock Reorder updated", "top", "success", 1000);
               let objectId = (response.body as StockReorderRoot).stockReorderId;
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: objectId
                  }
               }
               this.navController.navigateRoot("/transactions/stock-reorder/stock-reorder-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         })
      } else {
         this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
      }
   }

   async checkOriginQtyBalance(throwError: boolean = true): Promise<boolean> {
      return new Promise<boolean>(async (resolve) => {
         if (this.objectService.configStockReorderBlockCheckBalance) {
            // check balance qty
            this.objectService.object.line.filter(r => r.balanceQty).forEach(r => {
               if (throwError) {
                  if (r.lineQty > r.balanceQty) {
                     this.toastService.presentToast("", `Balance qty ${r.itemCode} is not enough`, "top", "warning", 1000);
                     resolve(false);
                     return;
                  }
               }
            });
            this.objectService.object.line.filter(r => r.balanceQty === null).forEach(async r => {
               let invInfo = await this.objectService.getInventoryQty(this.objectService.object.locationId, r.itemId);
               if (invInfo) {
                  r.balanceQty = invInfo.qty;
                  if (throwError) {
                     if (r.lineQty > r.balanceQty) {
                        this.toastService.presentToast("", `Balance qty ${r.itemCode} is not enough`, "top", "warning", 1000);
                        resolve(false);
                        return;
                     }
                  }
               }
            });
            resolve(true);
         } else {
            resolve(true);
         }
      });
   }

   sendForDebug() {
      let jsonObjectString = JSON.stringify(this.objectService.object);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
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

   balanceModal: boolean = false;
   viewBalance() {
      this.balanceModal = true;
   }

   hideBalanceModal() {
      this.balanceModal = false;
   }

}
