import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonDatetime, IonPopover, IonSearchbar, NavController, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { OtherAmount, SalesOrderRoot } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { SalesItemRequest } from 'src/app/shared/models/sales-item-request';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { GeneralTransactionService } from 'src/app/shared/services/general-transaction.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
   selector: 'app-sales-order-cart',
   templateUrl: './sales-order-cart.page.html',
   styleUrls: ['./sales-order-cart.page.scss'],
   providers: [SearchItemService, GeneralTransactionService, { provide: 'apiObject', useValue: 'mobileSalesOrder' }]
})
export class SalesOrderCartPage implements OnInit, ViewWillEnter {

   Math: any;

   submit_attempt: boolean = false;
   inputType: string = "number";

   constructor(
      public objectService: SalesOrderService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private searchItemService: SearchItemService,
      private promotionEngineService: PromotionEngineService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController
   ) {
      this.Math = Math;
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.objectHeader && this.objectService.objectHeader.salesOrderId > 0) {
         await this.loadSalesHistory();
      }
      if (this.objectService.objectHeader.deliveryDate) {
         this.dateValue = format(new Date(this.objectService.objectHeader.deliveryDate), "yyyy-MM-dd") + "T08:00:00.000Z";
         this.setFormattedDateString();
      }
      await this.validateMinOrderQty();
   }

   loadSalesHistory() {
      if (this.objectService.configSalesTransactionShowHistory) {
         if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
            let requestObject: SalesItemRequest = {
               itemId: this.objectService.objectDetail.flatMap(r => r.itemId),
               search: null,
               trxDate: this.commonService.getTodayDate(),
               keyId: this.objectService.objectHeader.salesOrderId,
               customerId: this.objectService.objectHeader.customerId,
               locationId: this.objectService.objectHeader.locationId ?? 0,
               startIndex: null,
               size: null
            }
            this.searchItemService.getSalesHistoryInfo(requestObject).subscribe({
               next: (response) => {
                  if (response && response.flatMap(r => r.historyInfo) && response.flatMap(r => r.historyInfo).length > 0) {
                     this.objectService.objectSalesHistory = [...this.objectService.objectSalesHistory, ...response];
                  }
               },
               error: (error) => {
                  console.error(error);
               }
            })
         }
      }
   }

   ngOnInit() {
      this.loadRestrictColumms();
      this.loadAvailableAddresses();
   }

   availableAddress: ShippingInfo[] = [];
   shippingInfo: ShippingInfo;
   loadAvailableAddresses() {
      try {
         this.availableAddress = [];
         if (this.objectService.objectHeader) {
            if (this.objectService.objectHeader.businessModelType === "T") {
               this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectService.objectHeader.customerId).flatMap(r => r.shippingInfo);
            } else {
               this.availableAddress = this.objectService.locationMasterList.filter(r => r.id === this.objectService.objectHeader.toLocationId).flatMap(r => r.shippingInfo);
            }
         }
         if (this.objectService.objectHeader.salesOrderId === 0) { // only do this when new sales-order
            this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
            this.onAddressSelected();
         }
      } catch (e) {
         console.error(e);
      }
   }

   restrictTrxFields: any = {};
   originalRestrictTrxFields: any = {};
   loadRestrictColumms() {
      try {
         let restrictedObject = {};
         let restrictedTrx = {};
         this.authService.restrictedColumn$.subscribe(obj => {
            let apiData = obj.filter(x => x.moduleName === "SM" && x.objectName === "SalesOrder").map(y => y.fieldName);
            let trxDataColumns = obj.filter(x => x.moduleName === "SM" && x.objectName === "SalesOrderLine").map(y => y.fieldName);
            trxDataColumns.forEach(element => {
               restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
            });
            this.restrictTrxFields = restrictedTrx;
            this.originalRestrictTrxFields = JSON.parse(JSON.stringify(this.restrictTrxFields));
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  extra info e.g. shipping and address */

   isExtraInfoModal: boolean = false;
   showExtraInfo() {
      this.isExtraInfoModal = true;
   }

   hideExtraInfo() {
      this.isExtraInfoModal = false;
   }

   selectedAddress: ShippingInfo;
   onAddressSelected() {
      try {
         if (this.selectedAddress) {
            this.objectService.objectHeader.shipAddress = this.selectedAddress.address;
            this.objectService.objectHeader.shipPostCode = this.selectedAddress.postCode;
            this.objectService.objectHeader.shipPhone = this.selectedAddress.phone;
            this.objectService.objectHeader.shipEmail = this.selectedAddress.email;
            this.objectService.objectHeader.shipFax = this.selectedAddress.fax;
            this.objectService.objectHeader.shipAreaId = this.selectedAddress.areaId;
            this.objectService.objectHeader.shipStateId = this.selectedAddress.stateId;
            this.objectService.objectHeader.attention = this.selectedAddress.attention;
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region transaction attributes */

   trxAttrModal: boolean = false;
   showTrxAttr() {
      this.trxAttrModal = true;
   }

   hideTrxAttr() {
      this.trxAttrModal = false;
   }

   @ViewChild("udoption1", { static: false }) udoption1: SearchDropdownPage;
   onUdOption1Changed(event: SearchDropdownList) {
      if (event) {
         this.objectService.objectHeader.salesOrderUDOption1 = event.id;
      } else {
         this.objectService.objectHeader.salesOrderUDOption1 = null;
      }
      this.udoption1.manuallyTrigger();
   }

   @ViewChild("udoption2", { static: false }) udoption2: SearchDropdownPage;
   onUdOption2Changed(event: SearchDropdownList) {
      if (event) {
         this.objectService.objectHeader.salesOrderUDOption2 = event.id;
      } else {
         this.objectService.objectHeader.salesOrderUDOption2 = null;
      }
      this.udoption2.manuallyTrigger();
   }

   @ViewChild("udoption3", { static: false }) udoption3: SearchDropdownPage;
   onUdOption3Changed(event: SearchDropdownList) {
      if (event) {
         this.objectService.objectHeader.salesOrderUDOption3 = event.id;
      } else {
         this.objectService.objectHeader.salesOrderUDOption3 = null;
      }
      this.udoption3.manuallyTrigger();
   }

   /* #endregion */

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/sales-order/sales-order-item");
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         if (this.objectService.objectDetail.length > 0) {
            await this.validateMinOrderQty();            
            if (await this.validateMinOrderAmt() && this.objectService.objectDetail.filter(r => r.minOrderQtyError).length === 0) {
               const alert = await this.alertController.create({
                  header: "Are you sure to proceed?",
                  subHeader: (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) ? "This will delete Draft & Generate SO" : "",
                  buttons: [
                     {
                        text: "OK",
                        cssClass: "success",
                        role: "confirm",
                        handler: async () => {
                           if (this.objectService.objectHeader.salesOrderId > 0) {
                              await this.updateObject();
                           } else {
                              await this.insertObject();
                           }
                        },
                     },
                     {
                        text: "Cancel",
                        cssClass: "cancel",
                        role: "cancel",
                        handler: async () => {
                           this.submit_attempt = false;
                        }
                     },
                  ],
               });
               await alert.present();
            } else {
               this.toastService.presentToast("Invalid Quantity", `${this.objectService.objectDetail.find(r => r.minOrderQty).itemCode} does not meet minimum order quantity.`, "top", "warning", 1000);
            }
         } else {
            this.submit_attempt = false;
            this.toastService.presentToast("Control Error", "Please add at least 1 item to continue", "top", "warning", 1000);
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
         let trxDto: SalesOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         if (this.objectService.orderingPriceApprovalIgnoreACL) {
            this.checkPricingApprovalLines(trxDto, trxDto.details);
         } else {
            if (this.originalRestrictTrxFields.unitPrice || this.originalRestrictTrxFields.unitPriceExTax || this.originalRestrictTrxFields.discountExpression || this.originalRestrictTrxFields.discountGroupCode) {
               this.checkPricingApprovalLines(trxDto, trxDto.details);
            }
         }
         if (trxDto.details.filter(r => r.unitPrice === null || r.unitPrice === undefined)?.length > 0) {
            this.toastService.presentToast("Control Error", "Please enter valid price for each line.", "top", "warning", 1000);
            return;
         }
         trxDto.header.salesOrderNum = null; // always default to null when insert
         if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
            this.objectService.confirmDraftObject(this.objectService.draftObject.draftTransactionId, trxDto).subscribe(async response => {
               this.objectService.setSummary(response.body);
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
            }, async error => {
               this.submit_attempt = false;
               console.error(error);
               await this.loadingService.dismissLoading();
            })
         } else {
            this.objectService.insertObject(trxDto).subscribe(async response => {
               this.objectService.setSummary(response.body);
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
            }, async error => {
               this.submit_attempt = false;
               console.error(error);
               await this.loadingService.dismissLoading();
            })
         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
         await this.loadingService.dismissLoading();
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         let trxDto: SalesOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         if (this.objectService.orderingPriceApprovalIgnoreACL) {
            this.checkPricingApprovalLines(trxDto, trxDto.details);
         } else {
            if (this.originalRestrictTrxFields.unitPrice || this.originalRestrictTrxFields.unitPriceExTax || this.originalRestrictTrxFields.discountExpression || this.originalRestrictTrxFields.discountGroupCode) {
               this.checkPricingApprovalLines(trxDto, trxDto.details);
            }
         }
         if (trxDto.details.filter(r => r.unitPrice === null || r.unitPrice === undefined)?.length > 0) {
            this.toastService.presentToast("Control Error", "Please enter valid price for each line.", "top", "warning", 1000);
            return;
         }
         this.objectService.updateObject(trxDto).subscribe(async response => {
            this.objectService.setSummary(response.body);
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
            await this.loadingService.dismissLoading();
            this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
         }, async error => {
            this.submit_attempt = false;
            console.error(error);
            await this.loadingService.dismissLoading();
         });
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
         await this.loadingService.dismissLoading();
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region draft step */

   async nextStepDraft() {
      try {
         this.submit_attempt = true;
         if (this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               header: "Save as Draft?",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
                           await this.updateObjectAsDraft();
                        } else {
                           await this.insertObjectAsDraft();
                        }
                     },
                  },
                  {
                     text: "Cancel",
                     cssClass: "cancel",
                     role: "cancel",
                     handler: async () => {
                        this.submit_attempt = false;
                     }
                  },
               ],
            });
            await alert.present();
         } else {
            this.submit_attempt = false;
            this.toastService.presentToast("Control Error", "Please add at least 1 item to continue", "top", "warning", 1000);
         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      }
   }

   async insertObjectAsDraft() {
      try {
         await this.loadingService.showLoading();
         let trxDto: SalesOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         if (this.objectService.orderingPriceApprovalIgnoreACL) {
            this.checkPricingApprovalLines(trxDto, trxDto.details);
         } else {
            if (this.originalRestrictTrxFields.unitPrice || this.originalRestrictTrxFields.unitPriceExTax || this.originalRestrictTrxFields.discountExpression || this.originalRestrictTrxFields.discountGroupCode) {
               this.checkPricingApprovalLines(trxDto, trxDto.details);
            }
         }
         if (trxDto.details.filter(r => r.unitPrice === null || r.unitPrice === undefined)?.length > 0) {
            this.toastService.presentToast("Control Error", "Please enter valid price for each line.", "top", "warning", 1000);
            return;
         }
         let object: DraftTransaction = {
            draftTransactionId: 0,
            draftTransactionNum: null,
            transactionType: "SALESORDER",
            jsonData: JSON.stringify(trxDto)
         }
         this.objectService.insertDraftObject(object).subscribe(async response => {
            this.submit_attempt = false;
            let ret: DraftTransaction = response.body as DraftTransaction;
            let object = JSON.parse(ret.jsonData) as SalesOrderRoot;
            object.header.salesOrderNum = ret.draftTransactionNum;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            await this.objectService.setSummary(object);
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("", "Insert Draft Complete", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
         }, async error => {
            await this.loadingService.dismissLoading();
            this.submit_attempt = false;
            console.error(error);
         });
      } catch (e) {
         await this.loadingService.dismissLoading();
         this.submit_attempt = false;
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
         this.submit_attempt = false;
      }
   }

   async updateObjectAsDraft() {
      try {
         await this.loadingService.showLoading();
         let trxDto: SalesOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         if (this.objectService.orderingPriceApprovalIgnoreACL) {
            this.checkPricingApprovalLines(trxDto, trxDto.details);
         } else {
            if (this.originalRestrictTrxFields.unitPrice || this.originalRestrictTrxFields.unitPriceExTax || this.originalRestrictTrxFields.discountExpression || this.originalRestrictTrxFields.discountGroupCode) {
               this.checkPricingApprovalLines(trxDto, trxDto.details);
            }
         }
         if (trxDto.details.filter(r => r.unitPrice === null || r.unitPrice === undefined)?.length > 0) {
            this.toastService.presentToast("Control Error", "Please enter valid price for each line.", "top", "warning", 1000);
            return;
         }
         this.objectService.draftObject.jsonData = JSON.stringify(trxDto);
         this.objectService.updateDraftObject(this.objectService.draftObject).subscribe(async response => {
            let ret: DraftTransaction = response.body as DraftTransaction
            await this.objectService.setSummary(JSON.parse(ret.jsonData) as SalesOrderRoot);
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Update Draft Complete", "", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
         }, async error => {
            await this.loadingService.dismissLoading();
            this.submit_attempt = false;
            console.error(error);
         });
      } catch (e) {
         await this.loadingService.dismissLoading();
         this.submit_attempt = false;
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
         this.submit_attempt = false;
      }
   }

   /* #endregion */

   /* #region  misc */

   checkPricingApprovalLines(trxDto: SalesOrderRoot, trxLineArray: TransactionDetail[]) {
      if (trxDto.header.businessModelType === "R" || trxDto.header.businessModelType === "C") {
         trxDto.header.isPricingApproval = false;
      } else {
         trxLineArray.forEach(x => { x.isPricingApproval = false }); // cast all to false first, then only check again
         let filteredData = trxLineArray.filter(x => x.unitPrice != x.oriUnitPrice || x.unitPriceExTax != x.oriUnitPriceExTax || x.discountGroupCode != x.oriDiscountGroupCode || x.discountExpression != x.oriDiscountExpression);
         filteredData = filteredData.filter(x => !x.isPromoImpactApplied);
         if (filteredData.length > 0) {
            filteredData.forEach(x => { x.isPricingApproval = true });
            trxDto.header.isPricingApproval = true;
         } else {
            trxLineArray.forEach(x => { x.isPricingApproval = false });
            trxDto.header.isPricingApproval = false;
         }
      }
      return trxDto;
   }

   /* #endregion */

   updateIsPriorityDate() {
      if (this.objectService.objectHeader.isPriority) {
         this.objectService.objectHeader.isPriorityDate = this.commonService.convertUtcDate(new Date());
      } else {
         this.objectService.objectHeader.isPriorityDate = null
      }
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
      this.objectService.objectHeader.deliveryDate = new Date(format(new Date(value), "yyyy-MM-dd") + "T00:00:00.000Z");
   }

   dateDismiss() {
      this.objectService.objectHeader.deliveryDate = null;
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

   /* #region check min order qty */

   validateMinOrderQty() {
      if (this.objectService.orderingActivateMOQControl) {
         if (this.objectService.objectHeader.businessModelType === "T" || this.objectService.objectHeader.businessModelType === "B") {
            this.objectService.objectDetail.forEach(data => {
               if (data.qtyRequest !== null && data.minOrderQty && data.qtyRequest < data.minOrderQty) {
                  let sameItemInCart = this.objectService.objectDetail.filter(r => r.itemId === data.itemId && r.uuid !== data.uuid);
                  let totalQtyRequestOfSameItemInCart = sameItemInCart.flatMap(r => (r.qtyRequest ?? 0)).reduce((a, c) => (a + c), 0);
                  if (sameItemInCart && totalQtyRequestOfSameItemInCart > 0) {
                     // check if qtyincart has same item if yes then check minorderqty again
                     if (data.qtyRequest !== null && data.minOrderQty && (data.qtyRequest + totalQtyRequestOfSameItemInCart) < data.minOrderQty) {
                        data.minOrderQtyError = true;
                     } else {
                        data.minOrderQtyError = false;
                     }
                  } else {
                     data.minOrderQtyError = true;
                  }
               } else {
                  data.minOrderQtyError = false;
               }
            })
         }
      }
   }

   validateMinOrderAmt() {
      return new Promise((resolve, reject) => {
         if (this.objectService.soMinOrderAmount !== 0) {
            let totalAmt = this.objectService.objectDetail.reduce((sum, current) => sum + current.subTotalExTax, 0);
            if (!this.objectService.objectHeader.isHomeCurrency) {
               totalAmt = totalAmt * this.objectService.objectHeader.currencyRate;
            }
            totalAmt = this.commonService.decimalJsRoundTwo(totalAmt);
            if (totalAmt < this.objectService.soMinOrderAmount) {
               this.toastService.presentToast("Control Validation", `Min ordering amount is ${this.objectService.soMinOrderAmount}. Please add more items.`, "top", "warning", 1000);
               reject(false);
            } else {
               resolve(true);
            }
         } else {
            resolve(true);
         }
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

   isPricingPopoverOpen: boolean = false;
   @ViewChild("pricingPopover", { static: false }) pricingPopover: IonPopover;
   showPricingPopover(event) {
      try {
         this.pricingPopover.event = event;
         this.isPricingPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   sendForDebug() {
      let trxDto: SalesOrderRoot = {
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

   onLineEditComplete(event: TransactionDetail[]) {
      this.objectService.setLine(event);
   }

   onTrxOtherAmountEditComplete(event: OtherAmount[]) {
      this.objectService.setOtherAmt(event);
   }

   /* #region remark */

   remarkModal: boolean = false;
   remarkSearchText: string;
   remarkSearchDropdownList: SearchDropdownList[] = [];
   remarkTempDropdownList: SearchDropdownList[] = [];
   selectedRemark: SearchDropdownList;
   async showRemarkModal() {
      this.remarkSearchDropdownList = [];
      for await (const r of this.objectService.remarkMasterList) {
         this.remarkSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      }
      this.remarkTempDropdownList = this.remarkSearchDropdownList;
      this.remarkModal = true;
   }

   @ViewChild("remarkSearchBar", { static: false }) remarkSearchBar: IonSearchbar;
   setFocus() {
      if (this.remarkSearchBar) {
         this.remarkSearchBar.setFocus();
      }
   }

   async onRemarkKeyDown(event) {
      if (event.keyCode === 13) {
         await this.searchItem();
      }
   }

   startIndex: number = 0;
   readonly size: number = 20;
   searchItem() {
      this.startIndex = 0;
      this.remarkTempDropdownList = []
      this.assignToTemp(this.startIndex, this.size);
   }

   resetRemarkFilter() {
      this.remarkSearchText = "";
      this.startIndex = 0;
      this.remarkTempDropdownList = [];
      this.assignToTemp(this.startIndex, this.size);
   }

   assignToTemp(startIndex: number, size: number) {
      if (this.remarkSearchText && this.remarkSearchText.length > 0) {
         this.remarkTempDropdownList = [...this.remarkTempDropdownList, ...this.remarkSearchDropdownList.filter(r => r.code?.toLowerCase().includes(this.remarkSearchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.remarkSearchText.toLowerCase()) || r.description?.toLowerCase().includes(this.remarkSearchText.toLowerCase())).slice(this.startIndex, startIndex + size)];
         if (this.remarkTempDropdownList && this.remarkTempDropdownList.length === 1) {
            this.remarkChooseThis(this.remarkTempDropdownList[0]);
         }
      } else {
         this.remarkTempDropdownList = [...this.remarkTempDropdownList, ...this.remarkSearchDropdownList.slice(startIndex, startIndex + size)];
      }
   }

   remarkChooseThis(object: SearchDropdownList) {
      if (this.selectedRemark && this.selectedRemark.id === object.id) {
         this.hideRemarkModal(this.selectedRemark, false);
      } else {
         this.selectedRemark = object;
         this.hideRemarkModal(object, true);
      }
   }

   applyRemark() {
      this.hideRemarkModal(null);
   }

   clearRemark() {
      this.hideRemarkModal(null, true);
   }

   hideRemarkModal(object: SearchDropdownList, triggerOutput: boolean = false) {
      this.remarkSearchText = "";
      this.remarkTempDropdownList = [];
      if (object) {
         this.objectService.objectHeader.remark = object.description;
      } else {
         this.objectService.objectHeader.remark = null;
      }
      this.remarkModal = false;
   }

   /* #endregion */

}
