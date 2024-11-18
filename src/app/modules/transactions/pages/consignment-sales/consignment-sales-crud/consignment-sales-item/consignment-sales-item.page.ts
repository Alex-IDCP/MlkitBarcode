import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-consignment-sales-item',
   templateUrl: './consignment-sales-item.page.html',
   styleUrls: ['./consignment-sales-item.page.scss'],
   providers: [BarcodeScanInputService, SearchItemService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemPage implements OnInit, ViewWillEnter {

   moduleControl: ModuleControl[] = [];
   allowModifyItemInfo: boolean = true;

   currentPage: number = 1;
   itemsPerPage: number = 20;

   inputType: string = "number";

   constructor(
      public objectService: ConsignmentSalesService,
      public authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
      private actionSheetController: ActionSheetController
   ) {
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ionViewWillEnter(): Promise<void> {
      await this.loadRestrictColumms();
      await this.barcodescaninput.setFocus();
      await this.resetFilteredObj();
   }

   ngOnInit() {

   }

   restrictTrxFields: any = {};
   loadRestrictColumms() {
      try {
         let restrictedTrx = {};
         this.authService.restrictedColumn$.subscribe(obj => {
            let trxDataColumns = obj.filter(x => x.moduleName === "SM" && x.objectName === "ConsignmentSalesLine").map(y => y.fieldName);
            trxDataColumns.forEach(element => {
               restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
            });
            this.restrictTrxFields = restrictedTrx;
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  barcode & check so */

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   async onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         if (event.filter(r => r.typeCode === "AS")?.length > 0) {
            this.toastService.presentToast("Control Validation", `Item ${event[0].itemCode} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
            return;
         } else {
            event.forEach(async r => {
               await this.addItemToLine(r);
            })
            await this.barcodescaninput.setFocus();
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      setTimeout(async () => {
         if (this.objectService.consignmentSalesActivateMarginCalculation) {
            if (!this.objectService.objectHeader.marginMode) {
               this.toastService.presentToast("Control Validation", "Unable to proceed. Please setup location margin mode.", "top", "warning", 1000);
               return;
            }
         }
         let isBlock: boolean = false;
         isBlock = this.validateNewItemConversion(trxLine);
         if (!isBlock) {
            this.objectService.objectDetail.forEach(r => r.sequence += 1);
            trxLine.qtyRequest = (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1;
            trxLine.locationId = this.objectService.objectHeader.toLocationId;
            trxLine.sequence = 0;
            trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.objectHeader.trxDate, this.objectService.objectHeader.toLocationId);
            await this.assignTrxItemToDataLine(trxLine);
            let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            setTimeout(async () => {
               await this.resetFilteredObj();
            }, 500);
         }         
      }, 0);
   }

   validateNewItemConversion(trxLine: TransactionDetail): boolean {
      if (trxLine.newItemId && trxLine.newItemEffectiveDate && new Date(trxLine.newItemEffectiveDate) <= new Date(this.objectService.objectHeader.trxDate)) {
         let newItemCode = this.configService.item_Masters.find(r => r.id === trxLine.itemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${trxLine.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(trxLine.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.objectService.systemWideBlockConvertedCode) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   async assignTrxItemToDataLine(item: TransactionDetail) {
      if (this.objectService.useTax) {
         if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
            item.unitPrice = item.itemPricing.unitPrice;
            item.unitPriceExTax = this.commonService.computeAmtExclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
         } else {
            item.unitPrice = this.commonService.computeAmtInclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
            item.unitPriceExTax = item.itemPricing.unitPrice;
         }
      } else {
         item.unitPrice = item.itemPricing.unitPrice;
         item.unitPriceExTax = item.itemPricing.unitPrice;
      }
      item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.objectService.maxPrecision);
      item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.objectService.maxPrecision);

      item.oriUnitPrice = item.unitPrice;
      item.oriUnitPriceExTax = item.unitPriceExTax;

      if (item.taxId && this.objectService.useTax) {
         if (this.objectService.objectHeader.customerId) {
            let foundCustomer = this.objectService.customerMasterList.find(r => r.id === this.objectService.objectHeader.customerId);
            if (foundCustomer && foundCustomer.attribute7) {
               let foundSupplyTax = this.objectService.taxMasterList.find(r => r.id === Number(foundCustomer.attribute7));
               if (foundSupplyTax && foundSupplyTax.attribute1) {
                  item.taxCode = foundSupplyTax.code;
                  item.taxPct = Number(foundSupplyTax.attribute1);
                  item.taxAmt = null
               } else {
                  item.taxCode = null;
                  item.taxPct = null;
                  item.taxAmt = null;
               }
            } else {
               item.taxCode = null;
               item.taxPct = null;
               item.taxAmt = null;
            }
         } else {
            item.taxCode = null;
            item.taxPct = null;
            item.taxAmt = null;
         }
      } else {
         item.taxCode = null;
         item.taxPct = null;
         item.taxAmt = null;
      }

      item.guid = uuidv4();

      if (this.objectService.consignmentSalesActivateMarginCalculation) {
         if (!this.objectService.configConsignmentActivateMarginExpr && item.marginPct) {
            item.marginExpression = item.marginPct + "%";
            this.objectService.objectDetail.unshift(item);
            await this.computeAllAmount(this.objectService.objectDetail[0]);
         } else if (this.objectService.configConsignmentActivateMarginExpr && item.marginExpression) {
            this.objectService.objectDetail.unshift(item);
            await this.computeAllAmount(this.objectService.objectDetail[0]);
         } else {
            if (this.objectService.consignmentSalesBlockItemWithoutMargin !== "0") {
               this.toastService.presentToast("", `Margin unavailable for code ${item.itemCode}`, "top", "warning", 1000);
               if (this.objectService.consignmentSalesBlockItemWithoutMargin === "1") {
                  this.objectService.objectDetail.unshift(item);
                  await this.computeAllAmount(this.objectService.objectDetail[0]);
               }
            } else {
               this.objectService.objectDetail.unshift(item);
               await this.computeAllAmount(this.objectService.objectDetail[0]);
            }
         }
      } else {
         this.objectService.objectDetail.unshift(item);
         await this.computeAllAmount(this.objectService.objectDetail[0]);
      }
   }

   async deleteLine(rowData: TransactionDetail) {
      try {
         let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === rowData.guid);
         if (this.objectService.objectDetail[findIndex]) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this line?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete item",
                     cssClass: "danger",
                     handler: async () => {
                        await this.objectService.objectDetail.splice(findIndex, 1);
                        let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                        this.toastService.presentToast("", "Line removed", "top", "success", 1000);
                        await this.resetFilteredObj();
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel"
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("System Error", "Index not found", "top", "danger", 1000);
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

   async onDoneScanning(barcode) {
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

   highlight(event) {
      event.getInputElement().then(r => {
         r.setFocus();
      })
   }

   eventHandler(keyCode) {
      if (keyCode === 13) {
         if (Capacitor.getPlatform() !== "web") {
            Keyboard.hide();
         }
      }
   }

   /* #region  unit price, tax, discount */

   async computeUnitPriceExTax(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
      try {
         trxLine.unitPrice = parseFloat(parseFloat(stringValue).toFixed(2));
         trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.objectService.useTax, this.objectService.maxPrecision);
         await this.computeDiscTaxAmount(trxLine);
         let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } catch (e) {
         console.error(e);
      }
   }

   async computeUnitPrice(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
      try {
         trxLine.unitPriceExTax = parseFloat(parseFloat(stringValue).toFixed(2));
         trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.objectService.useTax, this.objectService.maxPrecision);
         await this.computeDiscTaxAmount(trxLine);
         let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } catch (e) {
         console.error(e);
      }
   }

   async computeDiscTaxAmount(trxLine: TransactionDetail) {
      try {
         trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.objectService.useTax, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.maxPrecision);
         if (this.objectService.consignmentSalesActivateMarginCalculation) {
            await this.computeMarginAmount(trxLine);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async computeMarginAmount(trxLine: TransactionDetail) {
      let isComputeGross: boolean = this.objectService.consignBearingComputeGrossMargin;
      if (this.objectService.objectHeader.grossPromoMarginCategoryCode) {
         let grossDiscountCodeList = this.objectService.discountGroupMasterList.filter(x => x.attribute3 == this.objectService.objectHeader.grossPromoMarginCategoryCode);
         let findTrxDiscount = grossDiscountCodeList.find(x => x.code == trxLine.discountGroupCode);
         if (findTrxDiscount) {
            isComputeGross = true;
         }
      }
      trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectService.objectHeader, isComputeGross, true);
      let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
      await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
   }

   async onDiscCodeChanged(trxLine: TransactionDetail, event: SearchDropdownList) {
      try {
         if (event) {
            let discPct = this.objectService.discountGroupMasterList.find(x => x.code === event.code)?.attribute1
            if (discPct) {
               trxLine.discountGroupCode = event.code;
               if (discPct === "0") {
                  trxLine.discountExpression = null;
               } else {
                  trxLine.discountExpression = discPct + "%";
               }
               trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.objectHeader.trxDate, this.objectService.objectHeader.toLocationId);
               await this.computeAllAmount(trxLine);
            }
         } else {
            this.toastService.presentToast("Control Error", "Disc. Code is required to calculate Margin", "top", "warning", 1000);
            return;
         }
      } catch (e) {
         console.error(e);
      }
   }

   async computeAllAmount(rowData: TransactionDetail, reflectToDetail: boolean = false) {
      setTimeout(async () => {
         if (rowData.qtyRequest === null || rowData.qtyRequest === undefined || isNaN(Number(rowData.qtyRequest))) {
            this.toastService.presentToast("", "Invalid Qty", "top", "warning", 1000);
            return;
         } else {
            try {
               await this.computeDiscTaxAmount(rowData);
               if (this.objectService.consignmentSalesActivateMarginCalculation) {
                  await this.computeMarginAmount(rowData);
               }
               if (reflectToDetail) {
                  let findIndex = this.objectService.objectDetail.findIndex(r => r.guid === rowData.guid);
                  this.objectService.objectDetail[findIndex] = JSON.parse(JSON.stringify(rowData));
                  let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                  await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
               }
               if (this.itemSearchText) {
                  await this.search(this.itemSearchText);
               }
            } catch (e) {
               console.error(e);
            }
         }
      }, 0);
   }

   /* #endregion */

   /* #region  modal to edit line detail */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   selectedIndex: number;
   showEditModal(data: TransactionDetail) {
      this.selectedItem = JSON.parse(JSON.stringify(this.objectService.objectDetail.find(r => r.guid === data.guid)));
      this.selectedIndex = this.objectService.objectDetail.findIndex(r => r.guid === data.guid);
      this.isModalOpen = true;
   }

   hideEditModal() {
      this.isModalOpen = false;
   }

   onModalHide() {
      this.selectedIndex = null;
      this.selectedItem = null;
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact Administrator", "top", "danger", 1000);
         return;
      } else {
         if (this.selectedItem.unitPrice === null || this.selectedItem.unitPrice === undefined || isNaN(Number(this.selectedItem.unitPrice))) {
            this.toastService.presentToast("", "Invalid Unit Price", "top", "warning", 1000);
         } else {
            this.objectService.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
            let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            await this.hideEditModal();
            await this.search(this.itemSearchText);
         }
      }
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
                     this.isModalOpen = false;
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

   /* #endregion */

   async nextStep() {
      let lineError = false;
      this.objectService.objectDetail.forEach(r => {
         if (r.qtyRequest === null || r.qtyRequest === undefined || isNaN(Number(r.qtyRequest))) {
            lineError = true;
         }
      })
      if (lineError) {
         this.toastService.presentToast("Unable to proceed", "Invalid Qty", "top", "warning", 1000);
      } else {
         try {
            if (this.objectService.allowDocumentWithEmptyLine == "N") {
               if (this.objectService.objectDetail.length < 1) {
                  this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "warning", 1000);
                  return;
               }
            }
            const alert = await this.alertController.create({
               header: "Are you sure to proceed?",
               cssClass: "custom-alert",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        if (this.objectService.objectHeader?.consignmentSalesId && this.objectService.objectHeader.consignmentSalesId > 0) {
                           await this.updateObject();
                        } else {
                           await this.insertObject();
                        }
                     },
                  },
                  {
                     text: "Cancel",
                     cssClass: "cancel",
                     role: "cancel"
                  },
               ],
            });
            await alert.present();
         } catch (e) {
            console.error(e);
         }
      }
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         let trxDto: ConsignmentSalesRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         this.objectService.insertObject(trxDto).subscribe(async response => {
            if (response.status === 201) {
               await this.loadingService.dismissLoading();
               let object = response.body as ConsignmentSalesRoot;
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.consignmentSalesId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
            } else {
               this.sendForDebug();
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         this.sendForDebug();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   updateObject() {
      try {
         let trxDto: ConsignmentSalesRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         this.objectService.updateObject(trxDto).subscribe(response => {
            if (response.status === 204) {
               this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.consignmentSalesId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
            } else {
               this.sendForDebug();
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         this.sendForDebug();
         console.error(e);
      }
   }

   previousStep() {
      this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
   }

   async cancelUpdate() {
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
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.objectHeader.consignmentSalesId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
         }
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
      let trxDto: ConsignmentSalesRoot = {
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

   identify(index, line) {
      return line.guid;
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
      // setTimeout(() => {
         this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail));
      // }, 100);
	}

   /* #endregion */

}
