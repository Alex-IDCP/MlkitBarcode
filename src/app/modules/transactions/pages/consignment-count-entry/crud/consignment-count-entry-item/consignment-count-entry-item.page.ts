import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ConsignmentCountEntryRoot } from 'src/app/modules/transactions/models/consignment-count-entry';
import { TransactionCode } from 'src/app/modules/transactions/models/transaction-type-constant';
import { ConsignmentCountEntryService } from 'src/app/modules/transactions/services/consignment-count-entry.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { LocalTransaction } from 'src/app/shared/models/pos-download';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-consignment-count-entry-item',
   templateUrl: './consignment-count-entry-item.page.html',
   styleUrls: ['./consignment-count-entry-item.page.scss'],
})
export class ConsignmentCountEntryItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: ConsignmentCountEntryService,
      public authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      this.resetFilteredObj();
   }

   async ionViewDidEnter(): Promise<void> {
      try {
         await this.barcodescaninput.setFocus();
         if (this.objectService.object?.header === null || this.objectService.object?.header === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-header");
         }
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   /* #region item line */

   async onItemAdd(event: TransactionDetail) {
      if (event) {
         if (event.typeCode === "AS") {
            this.toastService.presentToast("Control Validation", `Item ${event.itemCode} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
            return;
         } else {
            let findLineCount = this.objectService.object.details.filter(r => r.itemId === event.itemId);
            console.log("🚀 ~ ConsignmentCountEntryItemPage ~ onItemAdd ~ findLineCount:", findLineCount)
            if (findLineCount.length > 0) {
               this.toastService.presentToast("Duplicate Code Detected", `Item ${event.itemCode} has been added to transaction previously. Same item in multiple lines are not allowed.`, "top", "warning", 1000);
               return;
            } else {
               this.addItemToLine(event);
            }
            await this.barcodescaninput.setFocus();
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail, isPush: boolean = false) {
      try {
         if (this.objectService.object.details.findIndex(r => r.itemId === trxLine.itemId) === 0) { // already in and first one
            this.objectService.object.details.find(r => r.itemSku === trxLine.itemSku).qtyRequest += (trxLine.qtyRequest ?? 1);
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, this.objectService.object);
            this.resetFilteredObj();
         } else {
            trxLine.lineId = 0;
            trxLine.headerId = this.objectService.object.header.consignmentCountEntryId;
            trxLine.locationId = this.objectService.object.header.locationId;
            trxLine.guid = uuidv4();
            this.objectService.object.details.forEach(r => { r.sequence += 1 });
            if (isPush) {
               await this.objectService.object.details.push(trxLine);
            } else {
               await this.objectService.object.details.unshift(trxLine);
            }
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, this.objectService.object);
            this.resetFilteredObj();
         }
      } catch (e) {
         console.error(e);
      }
   }

   selectedItem: TransactionDetail;
   editLineModal: boolean = false;
   showEditModal(rowData: TransactionDetail) {
      let found = this.objectService.object.details.find(r => r.guid === rowData.guid);
      if (found) {
         this.selectedItem = JSON.parse(JSON.stringify(found));
         this.editLineModal = true;
      } else {
         this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
      }
   }

   hideEditModal() {
      this.editLineModal = false;
      this.selectedItem = null;
   }

   async cancelChanges() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.editLineModal = false;
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
      } catch (e) {
         console.error(e);
      }
   }

   async saveChanges() {
      if (this.selectedItem === null || this.selectedItem === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         return;
      } else {
         let hasQtyError: boolean = false;
         let totalQty: number = 0;
         if (this.selectedItem.variationTypeCode === "0") {
            hasQtyError = (this.selectedItem.qtyRequest ?? 0) <= 0;
         } else {
            this.selectedItem.variationDetails.forEach(r => {
               r.details.forEach(rr => {
                  totalQty += (rr.qtyRequest ?? 0)
               })
            })
            this.selectedItem.qtyRequest = totalQty;
            hasQtyError = totalQty <= 0;
         }
         if (hasQtyError) {
            this.toastService.presentToast("Controll Error", "Invalid quantity", "top", "warning", 1000);
         } else {
            let foundIndex = this.objectService.object.details.findIndex(r => r.guid === this.selectedItem.guid);
            if (foundIndex > -1) {
               this.objectService.object.details[foundIndex] = JSON.parse(JSON.stringify(this.selectedItem));
               let foundFilteredIndex = this.filteredObj.findIndex(r => r.guid === this.selectedItem.guid);
               if (foundFilteredIndex > -1) {
                  this.filteredObj[foundFilteredIndex] = JSON.parse(JSON.stringify(this.selectedItem));
               }
            }
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, this.objectService.object);
         }
         this.hideEditModal();
      }
   }

   async deleteLine(rowData: TransactionDetail) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Delete this Line?",
            message: "This action cannot be undone.",
            buttons: [
               {
                  text: "Delete Line",
                  cssClass: "danger",
                  handler: async () => {
                     let findIndex = this.objectService.object.details.findIndex(r => r.guid === rowData.guid);
                     if (findIndex > -1) {
                        this.objectService.object.details = this.objectService.object.details.filter(r => r.guid !== rowData.guid);
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, this.objectService.object);
                        this.resetFilteredObj();
                     }
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
      } catch (e) {
         console.error(e);
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

   /* #region steps */

   previousStep() {
      this.navController.navigateBack("/transactions/consignment-count-entry/consignment-count-entry-header");
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     if (this.objectService.object?.header?.consignmentCountEntryId > 0) {
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
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   async nextStepLocal() {
      try {
         this.submit_attempt = true;
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     await this.insertObjectLocal();
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
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

	async insertObjectLocal() {
		try {
			await this.loadingService.showLoading();
			let localTrx: LocalTransaction;
			if (this.objectService.object.header.isLocal) {
				localTrx = {
					id: this.objectService.object.header.guid,
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: TransactionCode.consignmentCountEntryTrx,
					lastUpdated: new Date(),
					jsonData: JSON.stringify(this.objectService.object)
				}
				await this.configService.updateLocalTransaction(localTrx);
			} else {
				localTrx = {
					id: uuidv4(),
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: TransactionCode.consignmentCountEntryTrx,
					lastUpdated: new Date(),
					jsonData: JSON.stringify(this.objectService.object)
				}
				await this.configService.insertLocalTransaction(localTrx);
			}
			this.submit_attempt = false;
			await this.objectService.resetVariables();
			await this.loadingService.dismissLoading();
			let navigationExtras: NavigationExtras = {
				queryParams: {
					objectId: 0,
					isLocal: true,
					guid: localTrx.id
				}
			}
			this.navController.navigateForward("/transactions/consignment-count-entry/consignment-count-entry-detail", navigationExtras);
		} catch (error) {
			this.submit_attempt = false;
			await this.loadingService.dismissLoading();
			this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
			console.error(error);
		} finally {
			this.submit_attempt = false;
			await this.loadingService.dismissLoading();
		}
	}

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.insertObject(this.objectService.object).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as ConsignmentCountEntryRoot;
               this.toastService.presentToast("", "Consignment Coun Entry added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.consignmentCountEntryId
                  }
               }
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction(TransactionCode.consignmentCountEntryTrx, this.objectService.localObject);
					}
               await this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-detail", navigationExtras);
            }
         }, async error => {
            this.submit_attempt = false;
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.updateObject(this.objectService.object).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Consignment Count Entry updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.object.header.consignmentCountEntryId
                  }
               }
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction(TransactionCode.consignmentCountEntryTrx, this.objectService.localObject);
					}
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-detail", navigationExtras);
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

   populateDetail() {
      if (this.objectService.object.header.trxDate && this.objectService.object.header.locationId) {
         this.objectService.populateDetail(this.objectService.object.header.trxDate, this.objectService.object.header.locationId).subscribe({
            next: (response) => {
               if (response && response.length > 0) {
                  response.forEach(r => {
                     this.addItemToLine(r, true );
                  })
               }
            },
            error: (error) => {
               console.error(error);
            }
         })
      } else {
         this.toastService.presentToast("", "Invalid Start Date/Location", "top", "warning", 1000);
      }
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

   /* #region line search bar */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: TransactionDetail[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object?.details?.filter(r =>
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.description?.toUpperCase().includes(searchText.toUpperCase())
            )));
            this.currentPage = 1;
         } else {
            this.resetFilteredObj();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object.details));
   }

   /* #endregion */

   filter(details: InnerVariationDetail[]) {
      try {
         return details.filter(r => r.qtyRequest > 0);
      } catch (e) {
         console.error(e);
      }
   }

}
