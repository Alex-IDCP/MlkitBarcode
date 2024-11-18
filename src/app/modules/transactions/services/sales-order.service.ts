import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { SalesOrderStatus } from 'src/app/shared/models/sales-order-status';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { Customer } from '../models/customer';
import { OtherAmount, SalesOrderHeader, SalesOrderList, SalesOrderRoot } from '../models/sales-order';
import { format } from 'date-fns';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { map } from 'rxjs/operators';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { AuthService } from 'src/app/services/auth/auth.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { SalesItemInfoRoot } from 'src/app/shared/models/sales-item-info';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';
import { VariationRatio } from 'src/app/shared/models/variation-ratio';
import { CommonService } from 'src/app/shared/services/common.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class SalesOrderService {

   filterStartDate: Date;
   filterEndDate: Date;
   filterCustomerIds: number[] = [];
   filterSalesAgentIds: number[] = [];
   filterShowClosed: boolean = false;
   filterShowDraftOnly: boolean = false;

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
   uomMasterList: MasterListDetails[] = [];
   otherAmtMasterList: MasterListDetails[] = [];
   remarkMasterList: MasterListDetails[] = [];
   variationRatioList: VariationRatio[] = [];

   userDefinedList: MasterList[] = [];
   udOption1List: MasterListDetails[] = [];
   udOption2List: MasterListDetails[] = [];
   udOption3List: MasterListDetails[] = [];

   salesTypeList: MasterListDetails[] = [];
   docStatusList: MasterListDetails[] = [];
   orderLifeCycleMasterList: MasterListDetails[] = [];
   itemGroupingTypeMasterList: MasterListDetails[] = [];

   customers: Customer[] = [];

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private commonService: CommonService,
      private authService: AuthService,
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
         await this.loadCustomer();
         await this.loadMasterList();
         await this.loadUserDefinedList();
         await this.loadStaticLovList();
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
      await this.bindSalesAgentList();
   }

   loadUserDefinedList() {
      this.getUserDefinedList().subscribe(response => {
         this.userDefinedList = response.flatMap(src => src);
         this.udOption1List = response.filter(x => x.objectName.toUpperCase() === "SALESORDERUDOPTION1" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.udOption2List = response.filter(x => x.objectName.toUpperCase() === "SALESORDERUDOPTION2" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.udOption3List = response.filter(x => x.objectName.toUpperCase() === "SALESORDERUDOPTION3" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      }, error => {
         console.log(error);
      })
   }

   async loadStaticLovList() {
      let response = await this.getStaticLovList();
      this.salesTypeList = response.filter(x => x.objectName === "SalesType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.docStatusList = response.filter(x => x.objectName === "SalesOrderStatus" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.orderLifeCycleMasterList = response.filter(x => x.objectName === "OrderLifeCycle" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemGroupingTypeMasterList = response.filter(x => x.objectName === "ItemGroupingType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   async loadCustomer() {
      this.customers = await this.getCustomerList();
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
      await this.bindCustomerList();
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

   salesAgentDropdownList: SearchDropdownList[] = [];
   bindSalesAgentList() {
      this.salesAgentDropdownList = [];
      this.salesAgentMasterList.forEach(r => {
         this.salesAgentDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
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
   salesActivateTradingMargin: boolean = false;
   configSalesTransactionShowHistory: boolean = false;
   orderingPriceApprovalIgnoreACL: boolean = false;
   soMinOrderAmount: number = 0;
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
            if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() === 'Y') {
               this.orderingActivateMOQControl = true;
            } else {
               this.orderingActivateMOQControl = false;
            }

            let isTradingMargin = this.moduleControl.find(x => x.ctrlName === "SalesActivateTradingMargin");
            if (isTradingMargin && isTradingMargin.ctrlValue.toUpperCase() === "Y") {
               this.salesActivateTradingMargin = true;
            } else {
               this.salesActivateTradingMargin = false;
            }

            let salesTransactionShowHistory = this.moduleControl.find(x => x.ctrlName === "SalesTransactionShowHistory");
            if (salesTransactionShowHistory && salesTransactionShowHistory.ctrlValue.toUpperCase() === 'Y') {
               this.configSalesTransactionShowHistory = true;
            } else {
               this.configSalesTransactionShowHistory = false;
            }

            let priceApproval = this.moduleControl.find(x => x.ctrlName === "OrderingPriceApprovalIgnoreACL");
            if (priceApproval && priceApproval.ctrlValue.toUpperCase() === 'Y') {
               this.orderingPriceApprovalIgnoreACL = true;
            }

            let minOrderAmt = this.moduleControl.find(x => x.ctrlName === "SOMinOrderAmount");
            if (minOrderAmt && minOrderAmt.ctrlValue !== "0") {
              this.soMinOrderAmount = parseFloat(minOrderAmt.ctrlValue);
            }

         })
         this.authService.precisionList$.subscribe(precision => {
            if (precision) {
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
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  for insert */

   objectHeader: SalesOrderHeader;
   objectDetail: TransactionDetail[] = [];
   objectOtherAmt: OtherAmount[] = [];
   objectSalesHistory: SalesItemInfoRoot[] = [];
   objectSummary: SalesOrderRoot;
   async setHeader(objectHeader: SalesOrderHeader) {
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

   setSummary(objectSummary: SalesOrderRoot) {
      this.objectSummary = objectSummary;
   }

   isDraft: boolean = false;
   draftObject: DraftTransaction;
   setDraftObject(draftObject: DraftTransaction) {
      this.isDraft = true;
      this.draftObject = draftObject;
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
      this.objectSalesHistory = [];
   }

   removeOtherAmt() {
      this.objectOtherAmt = [];
   }

   removeSummary() {
      this.objectSummary = null;
   }

   removeDraftObject() {
      this.isDraft = false;
      this.draftObject = null;
   }

   resetVariables() {
      this.removeHeader();
      this.removeLine();
      this.removeOtherAmt();
      this.removeSummary();
      this.removeDraftObject();
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
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/masterlist", { context: background_load() }).toPromise();
   }

   getUserDefinedList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/udlist").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/staticLov", { context: background_load() }).toPromise();
   }

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/customer", { context: background_load() }).toPromise();
   }

   getPromotion(trxDate: string, customerId: number) {
      return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/promotion/" + trxDate + "/" + customerId).toPromise();
   }

   getFullItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/item/itemList", { context: background_load() });
   }

   getObjectList() {
      return this.http.get<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/solist");
   }

   getObjectListByDate(searchObject: SalesSearchModal) {
      return this.http.post<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/listing", searchObject);
   }

   getObjectById(objectId: number) {
      return this.http.get<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/" + objectId);
   }

   insertObject(object: SalesOrderRoot) {
      return this.http.post<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder", object, httpObserveHeader);
   }

   updateObject(object: SalesOrderRoot) {
      return this.http.put<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/deactivate/" + objectId, null, httpObserveHeader);
   }

   getCreditInfo(customerId: number) {
      return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/creditInfo/" + customerId);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }

   getStatus(objectId: number) {
      return this.http.get<SalesOrderStatus>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/status/" + objectId);
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/workflow/" + objectId);
   }

   getTrxChild(objectId: number) {
      return this.http.get<TrxChild>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/child/" + objectId).pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/jsonDebug", debugObject, httpObserveHeader);
   }

   /* #region draft */

   getDraftObjects() {
      return this.http.get<DraftTransaction[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft");
   }

   getDraftObject(objectId) {
      return this.http.get<DraftTransaction>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft/" + objectId);
   }

   insertDraftObject(object: DraftTransaction) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft", object, httpObserveHeader);
   }

   updateDraftObject(object: DraftTransaction) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft", object, httpObserveHeader);
   }

   confirmDraftObject(objectId: number, object: SalesOrderRoot) {
      return this.http.post<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft/confirm/", { draftTransactionId: objectId, object: object }, httpObserveHeader);
   }

   deleteDraftObject(objectId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/draft/" + objectId, httpObserveHeader);
   }

   /* #endregion */

}
