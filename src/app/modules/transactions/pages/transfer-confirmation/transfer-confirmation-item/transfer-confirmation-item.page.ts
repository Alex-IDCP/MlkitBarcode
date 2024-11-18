import { Component, OnInit, ViewChild } from '@angular/core';
import { TransferConfirmationService } from '../../../services/transfer-confirmation.service';
import { ActionSheetController, AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { TransferConfirmationLine, TransferConfirmationRoot } from '../../../models/inter-transfer';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
   selector: 'app-transfer-confirmation-item',
   templateUrl: './transfer-confirmation-item.page.html',
   styleUrls: ['./transfer-confirmation-item.page.scss'],
})
export class TransferConfirmationItemPage implements OnInit, ViewWillEnter {

   selectedObject: TransferConfirmationRoot;

   constructor(
      public objectService: TransferConfirmationService,
      private authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private alertController: AlertController
   ) { }

   ionViewWillEnter(): void {
      this.selectedObject = this.objectService.getSelectedObject();
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   configMobileScanItemContinuous: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
            }

            let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
            if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
               this.configMobileScanItemContinuous = true;
            } else {
               this.configMobileScanItemContinuous = false;
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   updateObject() {
      this.objectService.updateObject(this.selectedObject).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast('Update Complete', 'Transfer confirmation data has been updated.', 'top', 'success', 1000);
            this.navController.navigateRoot('transactions/transfer-confirmation');
         }
      }, error => {
         console.error(error);
      })
   }

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(r => {
            let newLine: TransferConfirmationLine = {
               interTransferLineId: 0,
               interTransferVariationId: 0,
               interTransferId: this.selectedObject.interTransferId,
               sequence: 0,
               itemId: r.itemId,
               itemCode: r.itemCode,
               itemSku: r.itemSku,
               itemDesc: r.description,
               xId: r.itemVariationXId,
               xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
               yId: r.itemVariationYId,
               yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
               barcode: r.itemBarcode,
               qty: 0,
               qtyReceive: 1,
               isDeleted: false,
            }
            this.selectedObject.line.forEach(r => (r.sequence ?? 0) + 1);
            this.selectedObject.line.unshift(newLine);
         })
      }
   }

   async deleteLine(rowIndex) {
      if (this.selectedObject.line[rowIndex].qty !== 0) {
         this.toastService.presentToast('System Error', 'Please contact Administrator.', 'top', 'danger', 1000);
      } else {
         const alert = await this.alertController.create({
            cssClass: 'custom-alert',
            header: 'Delete this Line?',
            message: 'This action cannot be undone.',
            buttons: [
               {
                  text: 'Delete Line',
                  cssClass: 'danger',
                  handler: async () => {
                     this.selectedObject.line.splice(rowIndex, 1);
                     this.toastService.presentToast('', 'Line removed', 'top', 'success', 1000);
                  }
               },
               {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'cancel',
                  handler: async () => {

                  }
               }
            ]
         });
         await alert.present();
      }
   }

   /* #region  barcode scanner */

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
            await this.validateBarcode(event);
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

   async validateBarcode(barcode: string) {
      try {
         if (barcode) {
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
               if (found_barcode) {
                  let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
                  let outputData: TransactionDetail = {
                     itemId: found_item_master.id,
                     itemCode: found_item_master.code,
                     description: found_item_master.itemDesc,
                     typeCode: found_item_master.typeCode,
                     variationTypeCode: found_item_master.varCd,
                     discountGroupCode: found_item_master.discCd,
                     discountExpression: (found_item_master.discPct ?? "0") + '%',
                     taxId: found_item_master.taxId,
                     taxCode: found_item_master.taxCd,
                     taxPct: found_item_master.taxPct,
                     qtyRequest: null,
                     itemPricing: {
                        itemId: found_item_master.id,
                        unitPrice: found_item_master.price,
                        discountGroupCode: found_item_master.discCd,
                        discountExpression: (found_item_master.discPct ?? "0") + '%',
                        discountPercent: found_item_master.discPct ?? 0,
                        discountGroupId: null,
                        unitPriceMin: null,
                        currencyId: null
                     },
                     itemVariationXId: found_barcode.xId,
                     itemVariationYId: found_barcode.yId,
                     itemSku: found_barcode.sku,
                     itemBarcode: found_barcode.barcode
                  }
                  this.onItemAdd([outputData]);
               } else {
                  this.toastService.presentToast('', 'Barcode not found.', 'top', 'danger', 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: 'Are you sure to cancel?',
            subHeader: 'Changes made will be discard.',
            cssClass: 'custom-action-sheet',
            buttons: [
               {
                  text: 'Yes',
                  role: 'confirm',
               },
               {
                  text: 'No',
                  role: 'cancel',
               }]
         });
         await actionSheet.present();
         const { role } = await actionSheet.onWillDismiss();
         if (role === 'confirm') {
            this.objectService.resetVariables();
            this.navController.back();
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         const alert = await this.alertController.create({
            header: 'Are you sure to proceed?',
            buttons: [
               {
                  text: 'OK',
                  cssClass: 'success',
                  role: 'confirm',
                  handler: async () => {
                     await this.updateObject();
                  },
               },
               {
                  text: 'Cancel',
                  cssClass: 'cancel',
                  role: 'cancel'
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
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

	sendForDebug() {
		let jsonObjectString = JSON.stringify(this.selectedObject);
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

}