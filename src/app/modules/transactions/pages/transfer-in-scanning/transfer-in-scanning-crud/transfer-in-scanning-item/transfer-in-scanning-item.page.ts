import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ActionSheetController, NavController, ViewWillEnter, IonPopover } from '@ionic/angular';
import { TransferInScanningLine, TransferInScanningRoot } from 'src/app/modules/transactions/models/transfer-in-scanning';
import { TransferInScanningService } from 'src/app/modules/transactions/services/transfer-in-scanning.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-transfer-in-scanning-item',
   templateUrl: './transfer-in-scanning-item.page.html',
   styleUrls: ['./transfer-in-scanning-item.page.scss'],
})
export class TransferInScanningItemPage implements OnInit, OnDestroy, ViewWillEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage

   constructor(
      public objectService: TransferInScanningService,
      public authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
   ) { }

   ionViewWillEnter(): void {
      
   }

   ngOnDestroy(): void {
      this.objectService.resetVariables();
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   systemWideEAN13IgnoreCheckDigit: boolean = false;
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
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
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

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (event) {
            event.forEach(async r => {
               let itemExistInLine = this.objectService.object.line.find(rr => rr.itemSku === r.itemSku);
               if (itemExistInLine) {
                  let outputData: TransferInScanningLine = {
                     id: 0,
                     uuid: uuidv4(),
                     transferInScanningId: 0,
                     interTransferLineId: itemExistInLine.interTransferLineId,
                     interTransferVariationId: itemExistInLine.interTransferVariationId,
                     interTransferId: itemExistInLine.interTransferId,
                     sequence: 0,
                     itemId: itemExistInLine.itemId,
                     itemCode: itemExistInLine.itemCode,
                     itemSku: itemExistInLine.itemSku,
                     itemDesc: itemExistInLine.itemDesc,
                     xId: itemExistInLine.xId,
                     xCd: itemExistInLine.xCd,
                     xDesc: itemExistInLine.xDesc,
                     yId: itemExistInLine.yId,
                     yCd: itemExistInLine.yCd,
                     yDesc: itemExistInLine.yDesc,
                     barcode: itemExistInLine.barcode,
                     lineQty: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                     qtyRequest: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                     qtyReceive: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                     isDeleted: itemExistInLine.isDeleted,
                     unitPrice: itemExistInLine?.unitPrice,
                     unitPriceExTax: itemExistInLine?.unitPrice,
                     discountGroupCode: itemExistInLine?.discountGroupCode,
                     discountExpression: itemExistInLine?.discountExpression
                  }
                  // await this.commonService.computeDiscTaxAmount(outputData, false, false, false, 2); // todo : use tax??
                  await this.insertIntoLine(outputData);
               } else {
                  let outputData: TransferInScanningLine = {
                     id: 0,
                     uuid: uuidv4(),
                     transferInScanningId: 0,
                     interTransferLineId: null,
                     interTransferVariationId: null,
                     interTransferId: null,
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
                     qtyRequest: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                     qtyReceive: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                     isDeleted: false,
                     unitPrice: r.itemPricing?.unitPrice,
                     unitPriceExTax: r.itemPricing?.unitPrice,
                     discountGroupCode: r.itemPricing?.discountGroupCode,
                     discountExpression: r.itemPricing?.discountExpression
                  }
                  // await this.commonService.computeDiscTaxAmount(outputData, false, false, false, 2); // todo : use tax??
                  await this.insertIntoLine(outputData);
               }
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async qtyInputBlur(event, rowIndex) {
      if (rowIndex === null || rowIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      } else {
         if (this.objectService.object.line[rowIndex].qtyRequest === null || this.objectService.object.line[rowIndex].qtyReceive === undefined) {
            this.objectService.object.line[rowIndex].qtyRequest = 0;
         }
         this.objectService.object.line[rowIndex].lineQty = this.objectService.object.line[rowIndex].qtyRequest;
         this.objectService.object.line[rowIndex].qtyReceive = this.objectService.object.line[rowIndex].qtyRequest;
         this.objectService.object.line[rowIndex].unitPriceExTax = this.objectService.object.line[rowIndex].unitPrice; // missing, not sure why
         this.objectService.object.line[rowIndex] = this.commonService.computeDiscTaxAmount(this.objectService.object.line[rowIndex], false, false, false, 2);
      }
   }

   async insertIntoLine(event: TransferInScanningLine) {
      if (event) {
         if (this.objectService.object.line.findIndex(r => r.itemSku === event.itemSku) > -1) {
            let index = this.objectService.object.line.findIndex(r => r.itemSku === event.itemSku);
            if (this.objectService.object.line[index].uuid === null) {
               this.objectService.object.line[index].uuid = event.uuid;
            }
            this.objectService.object.line[index].qtyRequest = (this.objectService.object.line[index].qtyRequest??0) + event.qtyRequest;
            this.objectService.object.line[index].lineQty = this.objectService.object.line[index].qtyRequest;
            this.objectService.object.line[index].qtyReceive = this.objectService.object.line[index].qtyRequest;
            this.objectService.object.line[index].unitPrice = event?.unitPrice;
            this.objectService.object.line[index].unitPriceExTax = event?.unitPrice;
            this.objectService.object.line[index].discountGroupCode = event?.discountGroupCode;
            this.objectService.object.line[index].discountExpression = event?.discountExpression;
            await this.commonService.computeDiscTaxAmount(this.objectService.object.line[index], false, false, false, 2);
         } else {
            if (this.objectService.object.line && this.objectService.object.line.length > 0) {
               this.objectService.object.line.forEach(r => r.sequence += 1);
            }
            event.sequence = 0;
            await this.objectService.object.line.unshift(event);
            await this.commonService.computeDiscTaxAmount(this.objectService.object.line[0], false, false, false, 2);
         }
      }
   }

   async deleteLine(rowIndex: number, event: TransferInScanningLine) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Are you sure to delete?",
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "danger",
               handler: async () => {
                  let lineToDelete = this.objectService.object.line[rowIndex];
                  if (lineToDelete !== null && (lineToDelete.interTransferId !== null || lineToDelete.interTransferId > 0)) {
                     this.objectService.object.line[rowIndex].uuid = null;
                     this.objectService.object.line[rowIndex].qtyRequest = null;
                     this.objectService.object.line[rowIndex].lineQty = this.objectService.object.line[rowIndex].qtyRequest;
                     this.objectService.object.line[rowIndex].qtyReceive = this.objectService.object.line[rowIndex].qtyRequest;
                     await this.commonService.computeDiscTaxAmount(this.objectService.object.line[rowIndex], false, false, false, 2);
                  } else {
                     await this.objectService.object.line.splice(rowIndex, 1);
                     this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
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

   getInsertedLine() {
      return this.objectService.object.line.filter(r => r.uuid !== null).sort((a, b) => { return a.sequence - b.sequence });
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

   async onDoneScanning(event) {
      try {
         if (event) {
            await this.barcodescaninput.validateBarcode(event);
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
               let itemExistInLine = this.objectService.object.line.find(rr => rr.itemSku === response.itemSku);
               if (itemExistInLine) {
                  let outputData: TransferInScanningLine = {
                     id: 0,
                     uuid: uuidv4(),
                     transferInScanningId: 0,
                     interTransferLineId: itemExistInLine.interTransferLineId,
                     interTransferVariationId: itemExistInLine.interTransferVariationId,
                     interTransferId: itemExistInLine.interTransferId,
                     sequence: 0,
                     itemId: itemExistInLine.itemId,
                     itemCode: itemExistInLine.itemCode,
                     itemSku: itemExistInLine.itemSku,
                     itemDesc: itemExistInLine.itemDesc,
                     xId: itemExistInLine.xId,
                     xCd: itemExistInLine.xCd,
                     xDesc: itemExistInLine.xDesc,
                     yId: itemExistInLine.yId,
                     yCd: itemExistInLine.yCd,
                     yDesc: itemExistInLine.yDesc,
                     barcode: itemExistInLine.barcode,
                     lineQty: null,
                     qtyRequest: 1,
                     qtyReceive: null,
                     isDeleted: itemExistInLine.isDeleted
                  }
                  this.insertIntoLine(outputData);
               } else {
                  let outputData: TransferInScanningLine = {
                     id: 0,
                     uuid: uuidv4(),
                     transferInScanningId: 0,
                     interTransferLineId: null,
                     interTransferVariationId: null,
                     interTransferId: null,
                     sequence: 0,
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
                     lineQty: null,
                     qtyRequest: 1,
                     qtyReceive: null,
                     isDeleted: false
                  }
                  this.insertIntoLine(outputData);
               }
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
            if (this.objectService.object?.transferInScanningId > 0) {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.object.transferInScanningId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
            } else {
               this.objectService.resetVariables();
               this.navController.navigateBack("/transactions/transfer-in-scanning");
            }
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
                  if (this.objectService.object.transferInScanningId > 0) {
                     this.updateObject();
                  } else {
                     this.insertObject();
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
      let insertObject: TransferInScanningRoot = {
         transferInScanningId: 0,
         transferInScanningNum: null,
         interTransferId: this.objectService.object.interTransferId,
         interTransferNum: this.objectService.object.interTransferNum,
         trxDate: this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()),
         trxDateTime: null,
         typeCode: this.objectService.object.typeCode,
         locationId: this.objectService.object.locationId,
         locationDesc: null,
         toLocationId: this.objectService.object.toLocationId,
         toLocationDesc: null,
         sourceType: "M",
         deactivated: false,
         isCompleted: null,
         createdBy: null,
         createdAt: null,
         remark: this.objectService.object.remark,
         workFlowTransactionId: this.objectService.object.workFlowTransactionId,
         totalCarton: this.objectService.object.totalCarton,
         interTransferQty: null,
         line: this.objectService.object.line.filter(r => r.uuid !== null),
         transferAdjustment: null,
         uuid: this.objectService.objectUuid
      }

      this.objectService.insertObject(insertObject).subscribe(response => {
         if (response.status === 201) {
            let obj = (response.body as TransferInScanningRoot)
            this.toastService.presentToast("", "Transfer In Scanning created", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: obj.transferInScanningId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
         }
      }, error => {
         console.error(error);
      })
   }

   updateObject() {
      this.objectService.updateObject(this.objectService.object).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("", "Transfer In Scanning updated", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.object.transferInScanningId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
         }
      }, error => {
         console.error(error);
      })
   }

   /* #endregion */

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

}