import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { PalletAssemblyDetail, PalletAssemblyRoot, PalletItemList } from 'src/app/modules/transactions/models/pallet-assembly';
import { BinList } from 'src/app/modules/transactions/models/transfer-bin';
import { PalletAssemblyService } from 'src/app/modules/transactions/services/pallet-assembly.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
   selector: 'app-pallet-assembly-item',
   templateUrl: './pallet-assembly-item.page.html',
   styleUrls: ['./pallet-assembly-item.page.scss'],
})
export class PalletAssemblyItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;
   selectedPalletNum: number;
   showPalletInfo: boolean = true;
   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: PalletAssemblyService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
         this.selectedPalletNum = this.objectService.objectDetail[0].palletNum;
         this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
      } else {
         await this.addPallet();
         this.selectedPalletNum = this.objectService.objectDetail[0].palletNum;
         this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
      }
      if (this.objectService.locationBin && this.objectService.locationBin.length > 0) {
         await this.bindLocationBin(this.objectService.locationBin);
      }
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {
   }

   onPalletNumClicked(palletNum: number) {
      if (palletNum.toString() === this.selectedPalletNum.toString()) {
         this.showPalletInfo = !this.showPalletInfo;
      }
   }

   palletToShow: PalletAssemblyDetail;
   onPalletNumChanged(event) {
      if (event) {
         this.showPalletInfo = true;
         let found = this.objectService.objectDetail.find(r => r.palletNum.toString() === event.detail.value.toString());
         if (found) {
            this.palletToShow = found;
         } else {
            this.palletToShow = found;
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } else {
         this.palletToShow = null;
      }
   }

   binSearchList: SearchDropdownList[] = [];
   bindLocationBin(binList: BinList[]) {
      this.binSearchList = [];
      binList.forEach((r, rowIndex) => {
         this.binSearchList.push({
            id: rowIndex,
            code: r.binCode,
            description: r.binCode
         })
      })
   }

   async addPallet() {
      // detail is empty
      if (this.objectService.objectDetail && this.objectService.objectDetail.length === 0) {
         await this.objectService.objectDetail.unshift(this.newPallet(1));
         this.selectedPalletNum = 1;
         this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
      } else {
         let maxPalletNum = Math.max(...this.objectService.objectDetail.flatMap(r => r.palletNum));
         await this.objectService.objectDetail.unshift(this.newPallet(maxPalletNum + 1));
         this.selectedPalletNum = maxPalletNum + 1;
         this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
      }
   }

   async deletePallet() {
      if (this.selectedPalletNum) {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Confirmation",
            subHeader: `Are you sure to delete Pallet Num. ${this.selectedPalletNum}?`,
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     this.objectService.objectDetail = JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(r => r.palletNum.toString() !== this.selectedPalletNum.toString())));
                     if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
                        let maxPalletNum = Math.max(...this.objectService.objectDetail.flatMap(r => r.palletNum));
                        this.selectedPalletNum = maxPalletNum;
                        this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
                     } else {
                        this.selectedPalletNum = null;
                        this.onPalletNumChanged(null);
                     }
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
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   newPallet(sequence: number): PalletAssemblyDetail {
      let newPallet: PalletAssemblyDetail = {
         headerId: this.objectService.objectHeader.palletAssemblyId,
         lineId: 0,
         palletCode: null,
         palletNum: sequence,
         description: null,
         referenceNum: null,
         palletHeight: null,
         palletWidth: null,
         palletLength: null,
         palletWeight: null,
         binCode: null,
         sequence: sequence,
         palletItemList: []
      }
      return newPallet;
   }

   onLocationBinSelected(event) {
      if (event) {
         if (this.selectedPalletNum) {
            let found = this.objectService.objectDetail.find(r => r.palletNum.toString() === this.selectedPalletNum.toString());
            if (found) {
               this.objectService.objectDetail.find(r => r.palletNum.toString() === this.selectedPalletNum.toString()).binCode = event.code;
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } else {
         if (this.selectedPalletNum) {
            let found = this.objectService.objectDetail.find(r => r.palletNum.toString() === this.selectedPalletNum.toString());
            if (found) {
               this.objectService.objectDetail.find(r => r.palletNum.toString() === this.selectedPalletNum.toString()).binCode = null;
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      }
   }

   /* #region item line */

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         if (this.selectedPalletNum && this.palletToShow) {
            if (event.filter(r => r.typeCode === "AS")?.length > 0) {
               this.toastService.presentToast("Control Validation", `Item ${event[0].itemCode} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
               return;
            } else {
               event.forEach(r => {
                  this.addItemToLine(r);
               })
            }
         } else {
            this.toastService.presentToast("Control Error", "Please select a pallet before adding Item", "top", "warning", 1000);
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         if (this.selectedPalletNum) {
            if (this.palletToShow.palletItemList.findIndex(r => r.itemBarcode === trxLine.itemBarcode) === 0) {
               this.palletToShow.palletItemList[0].qtyRequest += 1;
            } else {
               this.palletToShow.palletItemList.unshift(this.newPalletItem(trxLine));
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   newPalletItem(item: TransactionDetail): PalletItemList {
      let newPalletItem: PalletItemList = {
         variationId: 0,
         headerId: this.objectService.objectHeader.palletAssemblyId,
         lineId: this.palletToShow.lineId,
         itemId: item.itemId,
         itemCode: item.itemCode,
         itemUomId: item.itemUomId,
         itemBarcode: item.itemBarcode,
         description: item.description,
         sequence: this.palletToShow.palletItemList.length ?? 0,
         qtyRequest: (item.qtyRequest && item.qtyRequest) > 0 ? item.qtyRequest : 1
      }
      return newPalletItem;
   }

   /* #endregion */

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(barcode: any) {
      if (barcode) {
         await this.barcodescaninput.validateBarcode(barcode);
         if (this.objectService.configMobileScanItemContinuous) {
            await this.barcodescaninput.startScanning();
         }
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   async deletePalletItemList(rowIndex: number) {
      try {
         if (this.selectedPalletNum && this.palletToShow && this.palletToShow.palletItemList[rowIndex]) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this item?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete item",
                     cssClass: "danger",
                     handler: async () => {
                        await this.palletToShow.palletItemList.splice(rowIndex, 1);
                        this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {
                        this.palletToShow.palletItemList[rowIndex].qtyRequest = 1;
                     }
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   eventHandler(keyCode, line) {
      if (keyCode === 13) {
         if (Capacitor.getPlatform() !== "web") {
            Keyboard.hide();
         }
      }
   }

   previousStep() {
      this.navController.navigateBack("/transactions/pallet-assembly/pallet-assembly-header");
   }

   async nextStep() {
      try {
         if (this.isObjectValid()) {
            this.submit_attempt = true;
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "Confirm",
                     cssClass: "success",
                     handler: async () => {
                        if (this.objectService.objectHeader.palletAssemblyId > 0) {
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

         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.objectHeader.totalPallet = this.objectService.objectDetail.length;
         this.objectService.insertObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as PalletAssemblyRoot;
               this.toastService.presentToast("", "Pallet Assembly added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.palletAssemblyId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/pallet-assembly/pallet-assembly-detail", navigationExtras);
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
         this.objectService.objectHeader.totalPallet = this.objectService.objectDetail.length;
         this.objectService.updateObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Pallet Assembly updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.palletAssemblyId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/pallet-assembly/pallet-assembly-detail", navigationExtras);
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

   isObjectValid(): boolean {
      let result = false;
      if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
         this.objectService.objectDetail.forEach(r => {
            if (r.binCode) {
               result = true;
            } else {
               this.toastService.presentToast("Control Error", `Pallet ${r.palletNum} has invalid Bin Code`, "top", "warning", 1000);
               return;
            }
         })
      } else {
         this.toastService.presentToast("Control Error", "Please add at least 1 pallet", "top", "warning", 1000);
      }
      return result;
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
