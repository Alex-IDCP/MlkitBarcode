import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { AlertController, NavController, IonPopover, ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { BinFromPalletList, TransferBinGroupList, TransferBinRoot } from 'src/app/modules/transactions/models/transfer-bin';
import { TransferBinService } from 'src/app/modules/transactions/services/transfer-bin.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { GeneralScanInputPage } from 'src/app/shared/pages/general-scan-input/general-scan-input.page';

@Component({
   selector: 'app-transfer-bin-item',
   templateUrl: './transfer-bin-item.page.html',
   styleUrls: ['./transfer-bin-item.page.scss'],
})
export class TransferBinItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;

   constructor(
      public objectService: TransferBinService,
      private configService: ConfigService,
      private authService: AuthService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController
   ) { }

   ionViewWillEnter(): void {

   }

   async ionViewDidEnter(): Promise<void> {
      try {
         if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-header");
         }
         if (this.objectService.objectDetail && this.objectService.objectDetail.length === 0) {
            await this.addNewObjectDetail();
         }
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   addNewObjectDetail() {
      try {
         this.objectService.objectDetail.unshift({
            fromBinCode: null,
            fromPalletCode: null,
            groupList: [],
            toBinCode: null,
            toPalletCode: null,
            typeCode: "I"
         });
         this.showModal(0);
      } catch (error) {
         console.error(error);
      }
   }

   /* #region item line */

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(r => {
            this.addItemToLine(r);
         })
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
            if (this.objectService.objectDetail[this.selectedIndex].groupList.findIndex(r => r.itemId === trxLine.itemId) === 0) { // already in and first one
               this.objectService.objectDetail[this.selectedIndex].groupList.find(r => r.itemId === trxLine.itemId).qtyRequest += 1;
            } else {
               let newLine: TransferBinGroupList = {
                  transferBinLineId: 0,
                  transferBinId: this.objectService.objectHeader.transferBinId,
                  itemId: trxLine.itemId,
                  itemCode: trxLine.itemCode,
                  description: trxLine.description,
                  qtyRequest: (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1,
                  deactivated: false
               }
               await this.objectService.objectDetail[this.selectedIndex].groupList.unshift(newLine);
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteLine(index) {
      try {
         if (this.objectService.objectDetail[index]) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this line?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: `Delete Line #${index+1}?`,
                     cssClass: "danger",
                     handler: async () => {
                        await this.objectService.objectDetail.splice(index, 1);
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
            this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region detail modal */

   currentStep: number = 1;
   selectedIndex: number = null;
   detailModal: boolean = false;
   @ViewChild("fromBinScan", { static: false }) fromBinScan: GeneralScanInputPage;
   @ViewChild("fromPalletScan", { static: false }) fromPalletScan: GeneralScanInputPage;
   @ViewChild("toBinScan", { static: false }) toBinScan: GeneralScanInputPage;
   async showModal(rowIndex: number) {
      this.selectedIndex = rowIndex;
      this.detailModal = true;
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   detailModalDidPresent() {
      this.fromBinScan.setFocus();
   }

   hideModal() {
      this.currentStep = 1;
      this.selectedIndex = null;
      this.detailModal = false;
   }

   detailGoPrevious() {
      if (this.currentStep >= 2) {
         this.currentStep -= 1;
      }
      setTimeout(() => {
         this.detailStepSetFocus();
      }, 10);
   }

   detailGoNext() {
      this.currentStep += 1;
      setTimeout(() => {
         this.detailStepSetFocus();
      }, 10);
   }

   detailStepSetFocus() {
      switch (this.currentStep) {
         case 1:
            this.fromBinScan.setFocus();
            break;
         case 2:
            this.fromPalletScan.setFocus();
            break;
         case 3:
            this.toBinScan.setFocus();
            break;
         default:
            console.error("Step not found");
            break;
      }
   }

   async onFromBinCodeChanged(event: string) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            if (this.objectService.objectDetail[this.selectedIndex].fromPalletCode) {
               this.toastService.presentToast("Control Error", "Unable to modify after Pallet Code inserted", "top", "warning", 1000);
            } else {
               let binFound = this.objectService.binList.find(r => r.binCode.toUpperCase() === event.toUpperCase());
               if (binFound) {
                  this.objectService.objectDetail[this.selectedIndex].fromBinCode = binFound.binCode;
               } else {
                  this.toastService.presentToast("Control Error", "Bin entered does not belong to selected Location", "top", "warning", 1000);
               }
            }
         } else {
            this.objectService.objectDetail[this.selectedIndex].fromBinCode = null;
         }
         await this.validateBinPair("From");
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   async onToBinCodeChanged(event) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            let binFound = this.objectService.binList.find(r => r.binCode.toUpperCase() === event.toUpperCase());
            if (binFound) {
               this.objectService.objectDetail[this.selectedIndex].toBinCode = binFound.binCode;
            } else {
               this.toastService.presentToast("Control Error", "Bin entered does not belong to selected Location", "top", "warning", 1000);
            }
         } else {
            this.objectService.objectDetail[this.selectedIndex].toBinCode = null;
         }
         await this.validateBinPair("To");
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   validateBinPair(direction: string) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (this.objectService.objectDetail[this.selectedIndex].fromBinCode && this.objectService.objectDetail[this.selectedIndex].toBinCode) {
            if (this.objectService.objectDetail[this.selectedIndex].fromBinCode === this.objectService.objectDetail[this.selectedIndex].toBinCode) {
               if (direction === "From") {
                  this.objectService.objectDetail[this.selectedIndex].fromBinCode = null;
                  this.toastService.presentToast("Control Error", `${direction} Bin canont be the same as To Bin`, "top", "warning", 1000);
               } else {
                  this.objectService.objectDetail[this.selectedIndex].toBinCode = null;
                  this.toastService.presentToast("Control Error", `${direction} Bin canont be the same as From Bin`, "top", "warning", 1000);
               }
            }
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   async onFromPalletCodeChanged(event: string) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            if (this.objectService.objectDetail[this.selectedIndex].fromPalletCode) { // if pallet code inserted, unable to change, unable to scan item
               this.toastService.presentToast("Control Error", "Unable to modify after Pallet Code inserted", "top", "warning", 1000);
            } else {
               let palletFound = this.objectService.palletList.find(r => r.toUpperCase().includes(event.toUpperCase())); // check if this is pallet
               if (palletFound) {
                  if (this.objectService.objectDetail[this.selectedIndex].groupList?.length > 0) {
                     this.toastService.presentToast("Control Error", "Please remove items before adding pallet code", "top", "warning", 1000);
                  } else {
                     this.objectService.objectDetail[this.selectedIndex].fromPalletCode = event;
                     this.loadPallet(event);
                  }
               } else { // item
                  if (Capacitor.getPlatform() !== "web") {
                     let itemFound = this.configService.item_Masters.find(r => r.code.toUpperCase().includes(event.toUpperCase()));
                     let itemBarcodeFound = this.configService.item_Barcodes.find(r => r.barcode.toUpperCase() === event.toUpperCase());
                     if (itemFound) {
                        this.addItemToLine({
                           itemId: itemFound.id,
                           itemCode: itemFound.code,
                           typeCode: itemFound.typeCode,
                           description: itemFound.itemDesc,
                           qtyRequest: 1
                        });
                     } else if (itemBarcodeFound) {
                        itemFound = this.configService.item_Masters.find(r => r.id === itemBarcodeFound.itemId);
                        if (itemFound) {
                           this.addItemToLine({
                              itemId: itemFound.id,
                              itemCode: itemFound.code,
                              typeCode: itemFound.typeCode,
                              description: itemFound.itemDesc,
                              qtyRequest: 1
                           });
                        } else {
                           this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
                        }
                     } else {
                        this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
                     }
                  }
               }
            }
         } else {
            // this.objectService.objectDetail[this.selectedIndex].fromPalletCode = null;
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   binFromPallet: BinFromPalletList[] = [];
   loadPallet(palletCode: string) {
      this.objectService.getPalletObject(palletCode).subscribe(response => {
         this.binFromPallet = response;
         if (this.binFromPallet && this.binFromPallet.length > 0) {
            if (this.objectService.objectDetail[this.selectedIndex].fromBinCode) {
               if (this.binFromPallet.flatMap(r => r.binCode).includes(this.objectService.objectDetail[this.selectedIndex].fromBinCode)) { // if found insert item
                  if (Capacitor.getPlatform() !== "web") {
                     this.binFromPallet.forEach(r => {
                        let itemFound = this.configService.item_Masters.find(rr => rr.id === r.itemId);
                        if (itemFound) {
                           this.addItemToLine({
                              itemId: itemFound.id,
                              itemCode: itemFound.code,
                              typeCode: itemFound.typeCode,
                              description: itemFound.itemDesc,
                              qtyRequest: r.qty
                           });
                        } else {
                           this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
                        }
                     })
                  }  
               } else {
                  this.toastService.presentToast("Control Error", "Pallet Items doesnt match To Bin Location", "top", "warning", 1000);
                  this.objectService.objectDetail[this.selectedIndex].fromPalletCode = null;
               }
            } else {
               this.objectService.objectDetail[this.selectedIndex].fromBinCode = this.binFromPallet[0].binCode;
               if (Capacitor.getPlatform() !== "web") {
                  this.binFromPallet.forEach(r => {
                     let itemFound = this.configService.item_Masters.find(rr => rr.id === r.itemId);
                     if (itemFound) {
                        this.addItemToLine({
                           itemId: itemFound.id,
                           itemCode: itemFound.code,
                           typeCode: itemFound.typeCode,
                           description: itemFound.itemDesc,
                           qtyRequest: r.qty
                        });
                     } else {
                        this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
                     }
                  })
               }  
            }
         }
      }, error => {
         console.error(error);
      })
   }

   deleteItemLine(rowIndex) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         this.objectService.objectDetail[this.selectedIndex].groupList.splice(rowIndex, 1);
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
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

   async onFromBinDoneScanning(event: string) {
      if (event) {
         await this.onFromBinCodeChanged(event);
      }
   }

   async onFromPalletDoneScanning(event: string) {
      if (event) {
         await this.onFromPalletCodeChanged(event);
      }
   }

   async onToBinDoneScanning(event: string) {
      if (event) {
         await this.onToBinCodeChanged(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region steps */

   previousStep() {
      this.navController.navigateBack("/transactions/transfer-bin/transfer-bin-header");
   }

   async nextStep() {
      try {
         if (this.validateObject()) {
            this.toastService.presentToast("Control Error", "Please select valid Bin Codes", "top", "warning", 1000);
         } else {
            this.submit_attempt = true;
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "Confirm",
                     cssClass: "success",
                     handler: async () => {
                        if (this.objectService.objectHeader.transferBinId > 0) {
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
         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   validateObject() {
      let hasError: boolean = false;
      this.objectService.objectDetail.flatMap(r => {
         if (r.fromBinCode === null || r.fromBinCode === undefined || r.toBinCode === null || r.toBinCode === undefined) {
            hasError = true;
         }
      })
      return hasError;
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.insertObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as TransferBinRoot;
               this.toastService.presentToast("", "Transfer Bin added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.transferBinId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
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
         this.objectService.updateObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Transfer Bin updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.transferBinId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
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
      let trxDto: TransferBinRoot = {
         header: this.objectService.objectHeader,
         details: this.objectService.objectDetail
      }
      let jsonObjectString = JSON.stringify(trxDto);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status === 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

}
