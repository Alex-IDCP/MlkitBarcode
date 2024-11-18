import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { Customer } from '../models/customer';
import { QuotationHeader, QuotationList, QuotationRoot } from '../models/quotation';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { format } from 'date-fns';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { SalesItemInfoRoot } from 'src/app/shared/models/sales-item-info';
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
export class QuotationService {

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
   otherAmtMasterList: MasterListDetails[] =[];
   remarkMasterList: MasterListDetails[] = [];
   variationRatioList: VariationRatio[] = [];

   customers: Customer[] = [];

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
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
         await this.loadCustomer();
         await this.loadMasterList();
         await this.loadModuleControl();
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
      this.custSubscription = this.authService.customerMasterList$.subscribe(obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            this.authService.rebuildCustomerList();
         }
      })
   }

   async loadCustomer() {
      this.customers = await this.getCustomerList();
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
      this.bindCustomerList();
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
   salesActivateTradingMargin: boolean = false;
   configOrderingActivateCasePackQtyControl: boolean;
   isCasePackQtyControlWarningOnly: boolean = false;
   consignBearingComputeGrossMargin: boolean = false;
   configSalesTransactionShowHistory: boolean = false;
   orderingPriceApprovalIgnoreACL: boolean = false;

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

            let isTradingMargin = this.moduleControl.find(x => x.ctrlName === "SalesActivateTradingMargin");
            if (isTradingMargin && isTradingMargin.ctrlValue.toUpperCase() === "Y") {
               this.salesActivateTradingMargin = true;
            } else {
               this.salesActivateTradingMargin = false;
            }

            let casePackCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateCasePackQtyControl");
            if (casePackCtrl && (casePackCtrl.ctrlValue.toUpperCase() === "Y" || casePackCtrl.ctrlValue.toUpperCase() === "W")) {
               this.configOrderingActivateCasePackQtyControl = true;
               if (casePackCtrl.ctrlValue.toUpperCase() === "W") {
                  this.isCasePackQtyControlWarningOnly = true;
               } else {
                  this.isCasePackQtyControlWarningOnly = false;
               }
            } else {
               this.configOrderingActivateCasePackQtyControl = false;
               this.isCasePackQtyControlWarningOnly = false;
            }

            let computationMethod = this.moduleControl.find(x => x.ctrlName === "ConsignBearingComputeGrossMargin");
            if (computationMethod && computationMethod.ctrlValue.toUpperCase() === 'Y') {
               this.consignBearingComputeGrossMargin = true;
            } else {
               this.consignBearingComputeGrossMargin = false;
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

   objectHeader: QuotationHeader;
   objectOtherAmt: OtherAmount[] = [];
   objectDetail: TransactionDetail[] = [];
   objectSalesHistory: SalesItemInfoRoot[] = [];
   async setHeader(objectHeader: QuotationHeader) {
      this.objectHeader = objectHeader;
      // load promotion first after customer confirmed or whenever header changed.
      this.promotionMaster = await this.getPromotion(format(new Date(this.objectHeader.trxDate), "yyyy-MM-dd"), this.objectHeader.customerId);
   }

   setLine(objectDetail: TransactionDetail[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   setOtherAmt(otherAmt: OtherAmount[]) {
      this.objectOtherAmt = JSON.parse(JSON.stringify(otherAmt));
   }

   objectSummary: QuotationRoot
   setSummary(objectSummary: QuotationRoot) {
      this.objectSummary = objectSummary;
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
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/masterlist", { context: background_load() }).toPromise();
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/staticLov").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/customer", { context: background_load() }).toPromise();
   }

   getPromotion(trxDate: string, customerId: number) {
      return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/promotion/" + trxDate + "/" + customerId).toPromise();
   }

   getFullItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/item/itemList", { context: background_load() });
   }

   getObjectList() {
      return this.http.get<QuotationList[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/qtlist");
   }

   getObjectListByDate(searchObject: SalesSearchModal) {
      return this.http.post<QuotationList[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/listing", searchObject);
   }

   getObjectById(objectId: number) {
      return this.http.get<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/" + objectId);
   }

   insertObject(object: QuotationRoot) {
      return this.http.post<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileQuotation", object, httpObserveHeader);
   }

   updateObject(object: QuotationRoot) {
      return this.http.put<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileQuotation", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileQuotation/deactivate/" + objectId, null, httpObserveHeader);
   }

   getCreditInfo(customerId: number) {
      return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/creditInfo/" + customerId);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileQuotation/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId]
         },
         { responseType: "blob" });
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileQuotation/workflow/" + objectId);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileQuotation/jsonDebug", debugObject, httpObserveHeader);
   }

   generateDocument(objectId: number){
     return this.http.post(this.configService.selected_sys_param.apiUrl + `MobileQuotation/generateDocument/${objectId}`, null, httpObserveHeader);
   }

}
