import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { BinCountDetail, BinCountRoot, LocalBinCountBatchList } from 'src/app/modules/transactions/models/bin-count';
import { InventoryCountBatchCriteria } from 'src/app/modules/transactions/models/stock-count';
import { BinCountService } from 'src/app/modules/transactions/services/bin-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-bin-count-item',
   templateUrl: './bin-count-item.page.html',
   styleUrls: ['./bin-count-item.page.scss'],
})
export class BinCountItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: BinCountService,
      private authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
   ) { }

   ionViewWillEnter(): void {

   }

   async ionViewDidEnter(): Promise<void> {
      try {
         if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateBack("/transactions/bin-count/bin-count-header");
         } else {
            await this.loadBinCountBatchCriteria();
            if (this.objectService.flatDetail && this.objectService.flatDetail.length === 0) {
               await this.addNewObjectDetail(1);
            } else {
               await this.transformFlatDetail();
            }
         }
         await this.loadModuleControl();
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
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
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
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

   addNewObjectDetail(sequence: number) {
      try {
         if (sequence === null || sequence === undefined) { // max sequence here
            let maxSequence = 0;
            if (this.objectService.flatDetail && this.objectService.flatDetail.length === 0) {
               maxSequence = 0;
            } else {
               let seqArray = this.objectService.flatDetail.flatMap(r => r.sequence);
               maxSequence = Math.max(...seqArray);
            }
            this.objectService.flatDetail.push({
               id: uuidv4(),
               sequence: (maxSequence === null || maxSequence === undefined) ? 0 : maxSequence + 1,
               binCode: null,
               detail: []
            });
            this.showModal((maxSequence === null || maxSequence === undefined) ? 0 : maxSequence + 1);
         } else {
            this.objectService.flatDetail.push({
               id: uuidv4(),
               sequence: sequence,
               binCode: null,
               detail: []
            });
            this.showModal(sequence);
         }
      } catch (error) {
         console.error(error);
      }
   }

   transformFlatDetail() {
      if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
         this.objectService.flatDetail = [];
         let uniqueSequence = [...new Set(this.objectService.objectDetail.filter(r => !(r.sequence === null || r.sequence === undefined)).flatMap(r => r.sequence))];
         uniqueSequence.forEach(r => {
            this.objectService.flatDetail.push({
               id: uuidv4(),
               sequence: r,
               binCode: this.objectService.objectDetail.find(rr => rr.sequence === r)?.binCode,
               detail: JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(rr => rr.sequence === r)))
            })
         })
      }
   }

   binCountBatchCriteria: InventoryCountBatchCriteria;
   loadBinCountBatchCriteria() {
      try {
         this.objectService.getBinCountBatchCriteria(this.objectService.objectHeader.binCountBatchId).subscribe(response => {
            this.binCountBatchCriteria = response;
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(async r => {
            await this.addItemToLine(r);
         })
         try {
            this.barcodescaninput.setFocus();
         } catch (e) {
            console.error(e);
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         switch (this.binCountBatchCriteria.randomCountType) {
            case "Item":
               break;
            case "Brand":
               if (!this.binCountBatchCriteria.keyId.includes(trxLine.itemBrandId)) {
                  this.toastService.presentToast("", "Item Brand not match", "top", "warning", 1000);
                  return;
               }
               break;
            case "Group":
               if (!this.binCountBatchCriteria.keyId.includes(trxLine.itemGroupId)) {
                  this.toastService.presentToast("", "Item Group not match", "top", "warning", 1000);
                  return;
               }
               break;
            case "Category":
               if (!this.binCountBatchCriteria.keyId.includes(trxLine.itemCategoryId)) {
                  this.toastService.presentToast("", "Item Category not match", "top", "warning", 1000);
                  return;
               }
               break;
         }

         if (!(this.selectedSequence === null || this.selectedSequence === undefined)) {
            if (this.selectedFlat.detail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
               await this.selectedFlat.detail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
            } else {
               let newLine: BinCountDetail = {
                  binCountLineId: 0,
                  binCountId: this.objectService.objectHeader.binCountId,
                  locationId: this.objectService.objectHeader.locationId,
                  itemId: trxLine.itemId,
                  itemSku: trxLine.itemSku,
                  itemVariationXId: trxLine.itemVariationXId,
                  itemVariationYId: trxLine.itemVariationYId,
                  itemBarcode: trxLine.itemBarcode,
                  itemBarcodeTagId: trxLine.itemBarcodeTagId,
                  binCode: null,
                  qtyRequest: (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1,
                  /* #region  */
                  itemCode: trxLine.itemCode,
                  itemDescription: trxLine.description,
                  sequence: this.selectedSequence,
                  guid: uuidv4()
                  /* #endregion */
               }
               this.selectedFlat.detail.unshift(newLine);
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteLine(index) {
      try {
         if (!(this.selectedSequence === null || this.selectedSequence === undefined)) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this Line?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete Line",
                     cssClass: "danger",
                     handler: async () => {
                        this.objectService.flatDetail = JSON.parse(JSON.stringify(this.objectService.flatDetail.filter(r => r.sequence !== this.selectedSequence)));
                        this.hideModal();
                        this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {

                     }
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region detail modal */

   selectedSequence: number = null;
   selectedFlat: LocalBinCountBatchList;
   detailModal: boolean = false;
   async showModal(sequence: number) {
      this.detailModal = true;
      this.selectedSequence = sequence;
      this.selectedFlat = this.objectService.flatDetail.find(r => r.sequence === this.selectedSequence);
      if (this.selectedSequence === null || this.selectedSequence === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   hideModal() {
      this.selectedSequence = null;
      this.selectedFlat = null;
      this.detailModal = false;
   }

   async onBinCodeChanged(event) {
      if (!(this.selectedSequence === null || this.selectedSequence === undefined)) {
         if (event) {
            this.selectedFlat.binCode = event.code;
            this.objectService.flatDetail.forEach(r => {
               if (r.sequence === this.selectedSequence) {
                  r.binCode = event.code;
               }
            });
         } else {
            this.selectedFlat.binCode = null;
            this.objectService.flatDetail.forEach(r => {
               if (r.sequence === this.selectedSequence) {
                  r.binCode = null;
               }
            });
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   deleteItemLine(rowIndex: number) {
      if (!(this.selectedSequence === null || this.selectedSequence === undefined)) {
         this.selectedFlat.detail.splice(rowIndex, 1);
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   /* #endregion */

   /* #region  camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(event) {
      if (event) {
         await this.barcodescaninput.validateBarcode(event);
         if (this.configMobileScanItemContinuous) {
            await this.barcodescaninput.startScanning();
         }
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   onBinScanCompleted(event: string) { // bin code
      try {
         let found = this.objectService.binSearchList.find(r => r.code.toUpperCase() === event.toUpperCase());
         if (found) {
            this.onBinCodeChanged({ id: found.id });
         } else {
            this.toastService.presentToast("", "Invalid Bin Code", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   onBinDoneScanning(event) { // bin code
      try {
         let found = this.objectService.binSearchList.find(r => r.code.toUpperCase() === event.toUpperCase());
         if (found) {
            this.onBinCodeChanged({ id: found.id });
         } else {
            this.toastService.presentToast("", "Invalid Bin Code", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   previousStep() {
      this.navController.navigateBack("/transactions/bin-count/bin-count-header");
   }

   async nextStep() {
      try {
         await this.unflattenObject();
         if (!this.validateObject()) {
            this.submit_attempt = true;
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "Confirm",
                     cssClass: "success",
                     handler: async () => {
                        if (this.objectService.objectHeader.binCountId > 0) {
                           this.updateObject();
                        } else {
                           this.insertObject();
                        }
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {
                        this.submit_attempt = false;
                     }
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("Control Error", "Invalid Bin Code", "top", "warning", 1000);
         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   validateObject() {
      let f = this.objectService.objectDetail.filter(r => r.binCode === null || r.binCode === undefined);
      return f.length > 0;
   }

   unflattenObject() {
      this.objectService.objectDetail = [];
      this.objectService.flatDetail.forEach(r => {
         r.detail.forEach(rr => {
            this.objectService.objectDetail.push({
               binCountLineId: rr.binCountLineId,
               binCountId: this.objectService.objectHeader.binCountId,
               locationId: this.objectService.objectHeader.locationId,
               binCode: r.binCode,
               itemId: rr.itemId,
               itemSku: rr.itemSku,
               itemVariationXId: rr.itemVariationXId,
               itemVariationYId: rr.itemVariationYId,
               itemBarcode: rr.itemBarcode,
               itemBarcodeTagId: rr.itemBarcodeTagId,
               itemCode: rr.itemCode,
               itemDescription: rr.itemDescription,
               qtyRequest: rr.qtyRequest,
               sequence: r.sequence
            })
         })
      })
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.insertBinCount({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as BinCountRoot;
               this.objectService.resetVariables();
               this.toastService.presentToast("", "Bin Count added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.binCountId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/bin-count/bin-count-detail", navigationExtras);
            }
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.updateBinCount({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Bin Count updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.binCountId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/bin-count/bin-count-detail", navigationExtras);
            }
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   identify(index, line) {
      return line.guid;
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
		let jsonObjectString = JSON.stringify({ header: this.objectService.objectHeader, details: this.objectService.objectDetail });
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
