import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ConsignmentCountDetail, ConsignmentCountRoot } from 'src/app/modules/transactions/models/consignment-count';
import { TransactionCode } from 'src/app/modules/transactions/models/transaction-type-constant';
import { ConsignmentCountService } from 'src/app/modules/transactions/services/consignment-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { LocalTransaction } from 'src/app/shared/models/pos-download';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-consignment-count-item',
   templateUrl: './consignment-count-item.page.html',
   styleUrls: ['./consignment-count-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: "apiObject", useValue: "MobileConsignmentCount" }]
})
export class ConsignmentCountItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: ConsignmentCountService,
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
         if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
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

   /* #region item line */

   async onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         if (event.filter(r => r.typeCode === "AS")?.length > 0) {
            this.toastService.presentToast("Control Validation", `Item ${event[0].itemCode} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
            return;
         } else {
            event.forEach(r => {
               this.addItemToLine(r);
            })
            await this.barcodescaninput.setFocus();
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         if (this.objectService.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
            this.objectService.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest += (trxLine.qtyRequest??1);
            let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            this.resetFilteredObj();
         } else {
            let newLine: ConsignmentCountDetail = {
               consignmentCountLineId: 0,
               consignmentCountId: this.objectService.objectHeader.consignmentCountId,
               locationId: this.objectService.objectHeader.locationId,
               itemId: trxLine.itemId,
               itemVariationXId: trxLine.itemVariationXId,
               itemVariationYId: trxLine.itemVariationYId,
               itemSku: trxLine.itemSku,
               itemBarcodeTagId: trxLine.itemBarcodeTagId,
               itemBarcode: trxLine.itemBarcode,
               qtyRequest: (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1,
               sequence: 0,
               // for local use
               itemCode: trxLine.itemCode,
               itemDescription: trxLine.description,
               // testing performance
               guid: uuidv4()
            }
            this.objectService.objectDetail.forEach(r => { r.sequence += 1 });
            await this.objectService.objectDetail.unshift(newLine);
            let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            this.resetFilteredObj();
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  manual amend qty */

   async decreaseQty(line: ConsignmentCountDetail) {
      try {
         if (this.objectService.configMobileStockCountSlideToEdit) {
            line.qtyRequest -= 1;
         } else {
            if (line.qtyRequest - 1 < 0) {
               line.qtyRequest = 0;
               let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === line.guid);
               if (findIndex > -1) {
                  this.objectService.objectDetail[findIndex].qtyRequest = line.qtyRequest;
               } else {
                  this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
               }
               let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
               await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            } else {
               line.qtyRequest--;
               let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === line.guid);
               if (findIndex > -1) {
                  this.objectService.objectDetail[findIndex].qtyRequest = line.qtyRequest;
               } else {
                  this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
               }
               let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
               await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            }
            if (line.qtyRequest === 0) {
               await this.deleteLine(line);
            }
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

   async onQtyBlur(line: ConsignmentCountDetail) {
      line.qtyRequest = Math.floor(line.qtyRequest);
      if (!this.objectService.configMobileStockCountSlideToEdit) {
         let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === line.guid);
         if (findIndex > -1) {
            this.objectService.objectDetail[findIndex].qtyRequest = line.qtyRequest;
         } else {
            this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
         }
         let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      }
   }

   async increaseQty(line: ConsignmentCountDetail) {
      line.qtyRequest += 1;
      if (!this.objectService.configMobileStockCountSlideToEdit) {
         let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === line.guid);
         if (findIndex > -1) {
            this.objectService.objectDetail[findIndex].qtyRequest = line.qtyRequest;
         } else {
            this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
         }
         let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      }
   }

   async deleteLine(line: ConsignmentCountDetail) {
      try {
         let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === line.guid);
         if (findIndex > -1) {
            if (this.objectService.objectDetail[findIndex]) {
               const alert = await this.alertController.create({
                  cssClass: "custom-alert",
                  header: "Delete this item?",
                  message: "This action cannot be undone.",
                  buttons: [
                     {
                        text: "Delete item",
                        cssClass: "danger",
                        handler: async () => {
                           await this.objectService.objectDetail.splice(findIndex, 1);
                           this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                           let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                           await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                           this.resetFilteredObj();
                        }
                     },
                     {
                        text: "Cancel",
                        role: "cancel",
                        cssClass: "cancel",
                        handler: async () => {
                           line.qtyRequest = 1;
                           if (findIndex > -1) {
                              this.objectService.objectDetail[findIndex].qtyRequest = line.qtyRequest;
                           } else {
                              this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
                           }
                           let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                           await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                        }
                     }
                  ]
               });
               await alert.present();
            } else {
               this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
            }
         } else {
            this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
         }
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

   /* #endregion */

   /* #region steps */

   previousStep() {
      this.navController.navigateBack("/transactions/consignment-count/consignment-count-header");
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
                     if (this.objectService.objectHeader.consignmentCountId > 0) {
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
			let object: ConsignmentCountRoot = {
				header: this.objectService.objectHeader,
				details: this.objectService.objectDetail
			}
			let localTrx: LocalTransaction;
			if (this.objectService.objectHeader.isLocal) {
				localTrx = {
					id: this.objectService.objectHeader.guid,
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: TransactionCode.consignmentCountTrx,
					lastUpdated: new Date(),
					jsonData: JSON.stringify(object)
				}
				await this.configService.updateLocalTransaction(localTrx);
			} else {
				localTrx = {
					id: uuidv4(),
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: TransactionCode.consignmentCountTrx,
					lastUpdated: new Date(),
					jsonData: JSON.stringify(object)
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
			this.navController.navigateForward("/transactions/consignment-count/consignment-count-detail", navigationExtras);
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
			this.objectService.insertObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
				if (response.status === 201) {
					this.submit_attempt = false;
					let object = response.body as ConsignmentCountRoot;
					this.toastService.presentToast("", "Consignment Count added", "top", "success", 1000);
					let navigationExtras: NavigationExtras = {
						queryParams: {
							objectId: object.header.consignmentCountId
						}
					}
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction(TransactionCode.consignmentCountTrx, this.objectService.localObject);
					}
					await this.objectService.resetVariables();
					await this.loadingService.dismissLoading();
					this.navController.navigateRoot("/transactions/consignment-count/consignment-count-detail", navigationExtras);
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
				if (response.status === 201) {
					this.submit_attempt = false;
					let object = response.body as ConsignmentCountRoot;
					this.toastService.presentToast("", "Consignment Count updated", "top", "success", 1000);
					let navigationExtras: NavigationExtras = {
						queryParams: {
							objectId: object.header.consignmentCountId
						}
					}
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction(TransactionCode.consignmentCountTrx, this.objectService.localObject);
					}
					await this.objectService.resetVariables();
					await this.loadingService.dismissLoading();
					this.navController.navigateRoot("/transactions/consignment-count/consignment-count-detail", navigationExtras);
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

   sendForDebug() {
      let trxDto: ConsignmentCountRoot = {
         header: this.objectService.objectHeader,
         details: this.objectService.objectDetail
      }
      let jsonObjectString = JSON.stringify(trxDto);
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
	filteredObj: ConsignmentCountDetail[] = [];
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
				this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(r => 
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase()) || 
               r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.itemDescription?.toUpperCase().includes(searchText.toUpperCase())
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
		this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail));
	}

   /* #endregion */

   editModal: boolean = false;
   selectedDetail: ConsignmentCountDetail;
   showEditModal(rowData: ConsignmentCountDetail) {
      let index = this.objectService.objectDetail.findIndex(r => r.guid === rowData.guid);
      if (index > -1) {
         this.selectedDetail = JSON.parse(JSON.stringify(this.objectService.objectDetail[index]));
         this.editModal = true;
      } else {
         this.selectedDetail = null;
         this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
      }
   }

   hideEditModal() {
      this.editModal = false;
      setTimeout(async () => {
         let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === this.selectedDetail.guid);
         this.objectService.objectDetail[findIndex] = JSON.parse(JSON.stringify(this.selectedDetail));

         // handle filtered list
         let findIndexFiltered = this.filteredObj.findIndex(r => r.guid === this.selectedDetail.guid);
         if (findIndexFiltered > -1) {
            this.filteredObj[findIndexFiltered] = JSON.parse(JSON.stringify(this.selectedDetail));
         }

         this.selectedDetail = null;
         let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      }, 0);
   }

}
