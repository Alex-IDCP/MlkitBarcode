import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonPopover, IonSearchbar, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { QuotationRoot } from 'src/app/modules/transactions/models/quotation';
import { OtherAmount } from 'src/app/modules/transactions/models/sales-order';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SalesItemInfoRoot } from 'src/app/shared/models/sales-item-info';
import { SalesItemRequest } from 'src/app/shared/models/sales-item-request';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemSalesHistoryPage } from 'src/app/shared/pages/item-sales-history/item-sales-history.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { GeneralTransactionService } from 'src/app/shared/services/general-transaction.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
   selector: 'app-quotation-cart',
   templateUrl: './quotation-cart.page.html',
   styleUrls: ['./quotation-cart.page.scss'],
   providers: [SearchItemService, GeneralTransactionService, { provide: 'apiObject', useValue: 'mobileQuotation' }]
})
export class QuotationCartPage implements OnInit, ViewWillEnter {

   Math: any;

   moduleControl: ModuleControl[] = [];
   submit_attempt: boolean = false;
   inputType: string = "number";

   constructor(
      public objectService: QuotationService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private promotionEngineService: PromotionEngineService,
      private searchItemService: SearchItemService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController,
      private modalController: ModalController
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
      if (this.objectService.objectHeader && this.objectService.objectHeader.quotationId > 0) {
         await this.loadSalesHistory();
      }
      await this.loadRestrictColumms();
      await this.loadAvailableAddresses();
   }

   loadSalesHistory() {
      if (this.objectService.configSalesTransactionShowHistory) {
         if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
            let requestObject: SalesItemRequest = {
               itemId: this.objectService.objectDetail.flatMap(r => r.itemId),
               search: null,
               trxDate: this.commonService.getTodayDate(),
               keyId: this.objectService.objectHeader.quotationId,
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
         this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
         this.onAddressSelected();
      } catch (e) {
         console.error(e);
      }
   }

   // restrictFields: any = {};
   restrictTrxFields: any = {};
   originalRestrictTrxFields: any = {};
   loadRestrictColumms() {
      try {
         let restrictedObject = {};
         let restrictedTrx = {};
         this.authService.restrictedColumn$.subscribe(obj => {
            let apiData = obj.filter(x => x.moduleName === "SM" && x.objectName === "Quotation").map(y => y.fieldName);

            let trxDataColumns = obj.filter(x => x.moduleName === "SM" && x.objectName === "QuotationLine").map(y => y.fieldName);
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

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/quotation/quotation-item");
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         if (this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "OK",
                     role: "confirm",
                     cssClass: "success",
                     handler: async () => {
                        if (this.objectService.objectHeader.quotationId) {
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
            this.submit_attempt = false;
            this.toastService.presentToast("Error!", "Please add at least 1 item to continue", "top", "danger", 1000);
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
         let trxDto: QuotationRoot = {
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
         this.objectService.insertObject(trxDto).subscribe(async response => {
            let object = response.body;
            await this.objectService.setSummary(object);
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/quotation/quotation-summary");
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         });
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
         let trxDto: QuotationRoot = {
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
         this.objectService.updateObject(trxDto).subscribe(async response => {
            let object = response.body;
            await this.objectService.setSummary(object);
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/quotation/quotation-summary");
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

   checkPricingApprovalLines(trxDto: QuotationRoot, trxLineArray: TransactionDetail[]) {
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
      let trxDto: QuotationRoot = {
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

   // async onDisablePromotionCheck(event: any) {
   //    if (event.detail.checked) {
   //       await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.priceModel.qtyRequest > 0).flatMap(r => r.priceModel), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false, this.objectService.salesActivateTradingMargin)
   //    } else {
   //       this.objectService.objectDetail.forEach(async line => {
   //          line.priceModel = this.commonService.reversePromoImpact(line.priceModel);
   //          await this.computeDiscTaxAmount(line.priceModel);
   //       })
   //    }
   // }

   onLineEditComplete(event: TransactionDetail[]) {
      this.objectService.objectDetail = JSON.parse(JSON.stringify(event));
   }

   onTrxOtherAmountEditComplete(event: OtherAmount[]) {
      this.objectService.setOtherAmt(event);
   }

   /* #region toggle show latest price */

   toggleShowLatestPrice() {
      this.objectService.showLatestPrice = !this.objectService.showLatestPrice;
   }

   /* #endregion */

   getLatestHistory(history: SalesItemInfoRoot) {
      if (history.historyInfo && history.historyInfo.length > 0) {
         return history.historyInfo[0];
      }
      return null;
   }

   async showPriceHistoryModal(history: SalesItemInfoRoot) {
      const modal = await this.modalController.create({
         component: ItemSalesHistoryPage,
         componentProps: {
            selectedHistory: history
         },
         canDismiss: true
      })
      modal.present();
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
