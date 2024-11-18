import { Injectable } from '@angular/core';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { Customer } from '../models/customer';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ConfigService } from 'src/app/services/config/config.service';
import { HttpClient } from '@angular/common/http';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { BackToBackOrderHeader, BackToBackOrderList, BackToBackOrderRoot } from '../models/backtoback-order';
import { format } from 'date-fns';
import { map } from 'rxjs/operators';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';
import { OtherAmount } from '../models/sales-order';
import { VariationRatio } from 'src/app/shared/models/variation-ratio';
import { CommonService } from 'src/app/shared/services/common.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class BackToBackOrderService {

   showLatestPrice: boolean = false;
   showQuantity: boolean = false;
   showStandardPackingInfo: boolean = false;
   showOtherAmt: boolean = false;

   promotionMaster: PromotionMaster[] = [];

   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];
   discountGroupMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   shipMethodMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   areaMasterList: MasterListDetails[] = [];
   stateMasterList: MasterListDetails[] = [];
   currencyMasterList: MasterListDetails[] = [];
   salesAgentMasterList: MasterListDetails[] = [];
   termPeriodMasterList: MasterListDetails[] = [];
   countryMasterList: MasterListDetails[] = [];
   uomMasterList: MasterListDetails[] = [];
   otherAmtMasterList: MasterListDetails[] = [];
   remarkMasterList: MasterListDetails[] = [];
   variationRatioList: VariationRatio[] = [];

   salesTypeList: MasterListDetails[] = [];
   docStatusList: MasterListDetails[] = [];
   orderLifeCycleMasterList: MasterListDetails[] = [];

   customers: Customer[] = [];

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService,
      private commonService: CommonService,
      private loadingService: LoadingService
   ) { }

   // Method to clean up the subscription
   stopListening() {
      if (this.custSubscription) {
         this.custSubscription.unsubscribe();
      }
   }

   async loadRequiredMaster() {
      try {
         await this.loadingService.showLoading();
         await this.loadMasterList();
         await this.loadStaticLovList();
         await this.loadCustomer();
         await this.loadModuleControl();
         await this.loadPromotion();
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   custSubscription: Subscription;
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName === "DiscountGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName === "ShipMethod").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
      this.areaMasterList = this.fullMasterList.filter(x => x.objectName === "Area").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.stateMasterList = this.fullMasterList.filter(x => x.objectName === "State").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.currencyMasterList = this.fullMasterList.filter(x => x.objectName === "Currency").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName === "SalesAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.termPeriodMasterList = this.fullMasterList.filter(x => x.objectName === "TermPeriod").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.countryMasterList = this.fullMasterList.filter(x => x.objectName === "Country").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.uomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.otherAmtMasterList = this.fullMasterList.filter(x => x.objectName === "OtherAmount").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.remarkMasterList = this.fullMasterList.filter(x => x.objectName === "Remark").flatMap(src => src.details).filter(y => y.deactivated === 0);
      let ratioMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationRatio").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.variationRatioList = this.commonService.transformVariationRatioList(ratioMasterList);
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
   }

   async loadStaticLovList() {
      let fullMasterList = await this.getStaticLovList();
      this.salesTypeList = fullMasterList.filter(x => x.objectName === "SalesType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.docStatusList = fullMasterList.filter(x => x.objectName === "SalesOrderStatus" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.orderLifeCycleMasterList = fullMasterList.filter(x => x.objectName === "OrderLifeCycle" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   async loadCustomer() {
      this.customers = await this.getCustomerList();
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
      this.bindCustomerList();
   }

   async loadPromotion() {
      if (this.objectHeader?.trxDate && this.objectHeader?.customerId) {
         this.promotionMaster = await this.getPromotion(format(new Date(this.objectHeader.trxDate), "yyyy-MM-dd"), this.objectHeader.customerId);
      } else {
         this.promotionMaster = [];
      }
   }

   customerSearchDropdownList: SearchDropdownList[] = [];
   bindCustomerList() {
      this.customerSearchDropdownList = [];
      this.customers.forEach(r => {
         this.customerSearchDropdownList.push({
            id: r.customerId,
            code: r.customerCode,
            oldCode: r.oldCustomerCode,
            description: r.name
         })
      })
   }

   moduleControl: ModuleControl[];
   allowDocumentWithEmptyLine: string = "N";
   salesActivatePromotionEngine: boolean = false;
   workflowEnablePrintAfterApproved: boolean = false;
   disableTradeTransactionGenerateGL: boolean = false;
   systemWideActivateTaxControl: boolean = false;
   orderingPriceApprovalEnabledFields: string = "0"
   salesOrderQuantityControl: string = "0";
   orderingActivateMOQControl: boolean = false;
   boDoSiDisplayPosLocationCode: boolean = false;
   systemWideDisableDocumentNumber: boolean = false;
   salesActivateTradingMargin: boolean = false;
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionSalesUnitPrice: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let allowDocumentWithEmptyLine = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
            if (allowDocumentWithEmptyLine != undefined) {
               this.allowDocumentWithEmptyLine = allowDocumentWithEmptyLine.ctrlValue.toUpperCase();
            }

            let workflowEnablePrintAfterApproved = this.moduleControl.find(x => x.ctrlName === "WorkflowEnablePrintAfterApproved")?.ctrlValue;
            if (workflowEnablePrintAfterApproved && workflowEnablePrintAfterApproved.toUpperCase() === "Y") {
               this.workflowEnablePrintAfterApproved = true;
            } else {
               this.workflowEnablePrintAfterApproved = false;
            }

            let disableTradeTransactionGenerateGL = this.moduleControl.find(x => x.ctrlName === "DisableTradeTransactionGenerateGL")?.ctrlValue;
            if (disableTradeTransactionGenerateGL && disableTradeTransactionGenerateGL.toUpperCase() === "Y") {
               this.disableTradeTransactionGenerateGL = true;
            } else {
               this.disableTradeTransactionGenerateGL = false;
            }

            let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine")?.ctrlValue;
            if (salesActivatePromotionEngine && salesActivatePromotionEngine.toUpperCase() === "Y") {
               this.salesActivatePromotionEngine = true;
            } else {
               this.salesActivatePromotionEngine = false;
            }

            let systemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
            if (systemWideActivateTaxControl !== undefined) {
               this.systemWideActivateTaxControl = systemWideActivateTaxControl.ctrlValue.toUpperCase() === "Y" ? true : false;
            }

            let orderingPriceApprovalEnabledFields = this.moduleControl.find(x => x.ctrlName === "OrderingPriceApprovalEnabledFields");
            if (orderingPriceApprovalEnabledFields) {
               this.orderingPriceApprovalEnabledFields = orderingPriceApprovalEnabledFields.ctrlValue;
            }

            let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl");
            if (salesOrderQuantityControl) {
               this.salesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
            }

            let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
            if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() === "Y") {
               this.orderingActivateMOQControl = true;
            } else {
               this.orderingActivateMOQControl = false;
            }

            let displayPosLocation = this.moduleControl.find(x => x.ctrlName === "BoDoSiDisplayPosLocationCode");
            if (displayPosLocation && displayPosLocation.ctrlValue.toUpperCase() == "Y") {
               this.boDoSiDisplayPosLocationCode = true;
            }

            let isTradingMargin = this.moduleControl.find(x => x.ctrlName === "SalesActivateTradingMargin");
            if (isTradingMargin && isTradingMargin.ctrlValue.toUpperCase() === "Y") {
               this.salesActivateTradingMargin = true;
            } else {
               this.salesActivateTradingMargin = false;
            }

            let restrictDocnum = this.moduleControl.find(x => x.ctrlName === "SystemWideDisableDocumentNumber");
            if (restrictDocnum && restrictDocnum.ctrlValue.toUpperCase() == "Y") {
               this.systemWideDisableDocumentNumber = true;
            }
         })
         this.authService.precisionList$.subscribe(precision => {
            this.precisionSales = precision.find(x => x.precisionCode === "SALES");
            if (this.precisionSales.localMin === null) this.precisionSales.localMin = 2;
            if (this.precisionSales.localMax === null) this.precisionSales.localMax = 2;
            if (this.precisionSales.localFormat === null) this.precisionSales.localFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;
            if (this.precisionSales.foreignMin === null) this.precisionSales.foreignMin = 2;
            if (this.precisionSales.foreignMax === null) this.precisionSales.foreignMax = 2;
            if (this.precisionSales.foreignFormat === null) this.precisionSales.foreignFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;

            this.precisionSalesUnitPrice = precision.find(x => x.precisionCode === "SALESUNITPRICE");
            if (this.precisionSalesUnitPrice.localMin === null) this.precisionSalesUnitPrice.localMin = 2;
            if (this.precisionSalesUnitPrice.localMax === null) this.precisionSalesUnitPrice.localMax = 2;
            if (this.precisionSalesUnitPrice.localFormat === null) this.precisionSalesUnitPrice.localFormat = `1.${this.precisionSalesUnitPrice.localMin}-${this.precisionSalesUnitPrice.localMax}`;
            if (this.precisionSalesUnitPrice.foreignMin === null) this.precisionSalesUnitPrice.foreignMin = 2;
            if (this.precisionSalesUnitPrice.foreignMax === null) this.precisionSalesUnitPrice.foreignMax = 2;
            if (this.precisionSalesUnitPrice.foreignFormat === null) this.precisionSalesUnitPrice.foreignFormat = `1.${this.precisionSalesUnitPrice.localMin}-${this.precisionSalesUnitPrice.localMax}`;

            this.precisionTax = precision.find(x => x.precisionCode === "TAX");
            if (this.precisionTax.localMin === null) this.precisionTax.localMin = 2;
            if (this.precisionTax.localMax === null) this.precisionTax.localMax = 2;
            if (this.precisionTax.localFormat === null) this.precisionTax.localFormat = `1.${this.precisionTax.localMin}-${this.precisionTax.localMax}`;
            if (this.precisionTax.foreignMin === null) this.precisionTax.foreignMin = 2;
            if (this.precisionSalesUnitPrice.foreignMax === null) this.precisionTax.foreignMax = 2;
            if (this.precisionTax.foreignFormat === null) this.precisionTax.foreignFormat = `1.${this.precisionTax.localMin}-${this.precisionTax.localMax}`;
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  for insert */

   objectHeader: BackToBackOrderHeader;
   objectDetail: TransactionDetail[] = [];
   objectOtherAmt: OtherAmount[] = [];
   objectSummary: BackToBackOrderRoot;
   async setHeader(objectHeader: BackToBackOrderHeader) {
      this.objectHeader = objectHeader;
      // load promotion first after customer confirmed or whenever header changed.
      await this.loadPromotion();
   }

   setLine(objectDetail: TransactionDetail[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   setOtherAmt(otherAmt: OtherAmount[]) {
      this.objectOtherAmt = JSON.parse(JSON.stringify(otherAmt));
   }

   setSummary(objectSummary: BackToBackOrderRoot) {
      this.objectSummary = objectSummary;
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
   }

   removeOtherAmt() {
      this.objectOtherAmt = [];
   }

   removeSummary() {
      this.objectSummary = null;
   }

   resetVariables() {
      this.removeHeader();
      this.removeLine();
      this.removeOtherAmt();
      this.removeSummary();
   }

   hasSalesAgent(): boolean {
      let salesAgentId = JSON.parse(localStorage.getItem("loginUser"))?.salesAgentId;
      if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
         return false;
      }
      return true
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/masterlist", { context: background_load() }).toPromise();
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/staticLov", { context: background_load() }).toPromise();
   }

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/customer", { context: background_load() }).toPromise();
   }

   getPromotion(trxDate: string, customerId: number) {
      return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/promotion/" + trxDate + "/" + customerId).toPromise();
   }

   getFullItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/item/itemList", { context: background_load() });
   }

   // getObjectList() {
   //   return this.http.get<BackToBackOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/b2blist");
   // }

   getObjectListByDate(startDate: string, endDate: string) {
      return this.http.get<BackToBackOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/listing/" + startDate + "/" + endDate);
   }

   getObjectById(objectId: number) {
      return this.http.get<BackToBackOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/" + objectId);
   }

   insertObject(object: BackToBackOrderRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder", object, httpObserveHeader);
   }

   updateObject(object: BackToBackOrderRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/deactivate/" + objectId, null, httpObserveHeader);
   }

   getCreditInfo(customerId: number) {
      return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/creditInfo/" + customerId);
   }

   // downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
   //   return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/exportPdf",
   //     {
   //       "appCode": appCode,
   //       "format": format,
   //       "documentIds": [documentId],
   //       "reportName": reportName??null
   //     },
   //     { responseType: "blob" });
   // }

   // bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
   //   return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   // }

   // getStatus(salesOrderId: number) {
   //   return this.http.get<SalesOrderStatus>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/status/" + salesOrderId);
   // }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/workflow/" + objectId);
   }

   getTrxChild(objectId: number) {
      return this.http.get<TrxChild>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/child/" + objectId).pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/jsonDebug", debugObject, httpObserveHeader);
   }

}
