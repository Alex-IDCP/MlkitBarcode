import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentSalesHeader, ConsignmentSalesList, ConsignmentSalesRoot } from '../models/consignment-sales';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { ModuleControl } from 'src/app/shared/models/module-control';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class ConsignmentSalesService {

   filterStartDate: Date;
   filterEndDate: Date;
   filterLocationId: number[] = [];

   trxKey: string = "ConsignmentSales";

   constructor(
      private http: HttpClient,
      private commonService: CommonService,
      private configService: ConfigService,
      private authService: AuthService,
      private loadingService: LoadingService
   ) { }

   // Method to clean up the subscription
   stopListening() {
      if (this.custSubscription) {
         this.custSubscription.unsubscribe();
      }
   }

   objectHeader: ConsignmentSalesHeader;
   objectDetail: TransactionDetail[] = [];
   setHeader(objectHeader: ConsignmentSalesHeader) {
      this.objectHeader = objectHeader;
   }

   setLines(objectDetail: TransactionDetail[]) {
      this.objectDetail = objectDetail;
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeDetail() {
      this.objectDetail = [];
   }

   async resetVariables() {
      this.removeHeader();
      this.removeDetail();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   async loadRequiredMaster() {
      try {
         if (this.configService.selected_location) {
            this.filterLocationId = [];
            if (this.filterLocationId.findIndex(r => r === this.configService.selected_location) === -1) {
               this.filterLocationId.push(this.configService.selected_location);
            }
         }
         await this.loadingService.showLoading();
         await this.loadModuleControl();
         await this.loadMasterList();
         await this.loadStaticLov();
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   moduleControl: ModuleControl[];
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   maxPrecision: number = 2;
   maxPrecisionTax: number = 2;
   useTax: boolean = true;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   allowDocumentWithEmptyLine: string = "N";
   consignmentSalesActivateMarginCalculation: boolean = false;
   consignmentSalesBlockItemWithoutMargin: string = "0";
   consignBearingComputeGrossMargin: boolean = false;
   systemWideBlockConvertedCode: boolean;
   configMobileScanItemContinuous: boolean = false;
   configConsignmentActivateMarginExpr: boolean = false;
   configRestrictEditAfterCompleteFullMonth: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
            if (config != undefined) {
               this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
            }

            let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
            if (SystemWideActivateTaxControl != undefined) {
               this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() === "Y" ? true : false;
            }
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
            }
            let activateMargin = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesActivateMarginCalculation");
            if (activateMargin && activateMargin.ctrlValue.toUpperCase() === 'Y') {
               this.consignmentSalesActivateMarginCalculation = true;
            }
            let consignmentBlockNoMarginItem = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesBlockItemWithoutMargin");
            if (consignmentBlockNoMarginItem) {
               this.consignmentSalesBlockItemWithoutMargin = consignmentBlockNoMarginItem.ctrlValue;
            }
            let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
            if (blockConvertedCode) {
               this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
            } else {
               this.systemWideBlockConvertedCode = false;
            }

            let computationMethod = this.moduleControl.find(x => x.ctrlName === "ConsignBearingComputeGrossMargin");
            if (computationMethod && computationMethod.ctrlValue.toUpperCase() === 'Y') {
               this.consignBearingComputeGrossMargin = true;
            } else {
               this.consignBearingComputeGrossMargin = false;
            }

            let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
            if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
               this.configMobileScanItemContinuous = true;
            } else {
               this.configMobileScanItemContinuous = false;
            }

            let useConsMarginExpr = this.moduleControl.find(x => x.ctrlName === "ConsignmentActivateMarginExpr");
            if (useConsMarginExpr && useConsMarginExpr.ctrlValue.toUpperCase() == 'Y') {
               this.configConsignmentActivateMarginExpr = true;
            } else {
               this.configConsignmentActivateMarginExpr = false;
            }

            let restrictEditAfterCompleteFullMonth = this.moduleControl.find(x => x.ctrlName === "RestrictEditAfterCompleteFullMonth");
            if (restrictEditAfterCompleteFullMonth && restrictEditAfterCompleteFullMonth.ctrlValue.toUpperCase() == 'Y') {
               this.configRestrictEditAfterCompleteFullMonth = true;
            } else {
               this.configRestrictEditAfterCompleteFullMonth = false;
            }            
         });
         this.authService.precisionList$.subscribe(precision => {
            if (precision) {
               this.precisionSales = precision.find(x => x.precisionCode === "SALES");
               this.precisionTax = precision.find(x => x.precisionCode === "TAX");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   custSubscription: Subscription;
   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];
   fullLocationMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   salesAgentMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   currencyMasterList: MasterListDetails[] = [];
   discountGroupMasterList: MasterListDetails[] = [];
   taxMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.customerMasterList = this.customerMasterList.filter(x => x.attribute5 === "C");
      this.fullLocationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      if (this.commonService.getModCtrlBoolValue(this.moduleControl, "TransformCSBizModelAsRetail")) {
         this.locationMasterList = this.fullLocationMasterList.filter(r => (r.attribute1 === "C" || r.attribute1 === "O") && (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      } else {
         this.locationMasterList = this.fullLocationMasterList.filter(r => r.attribute1 === "C" && (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      }
      await this.bindLocationList();
      this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName === "SalesAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUom").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.currencyMasterList = this.fullMasterList.filter(x => x.objectName === "Currency").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName === "DiscountGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.taxMasterList = this.fullMasterList.filter(x => x.objectName === "Tax").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
            this.customerMasterList = this.customerMasterList.filter(x => x.attribute5 === "C");
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
   }

   locationSearchDropdownList: SearchDropdownList[] = [];
   async bindLocationList() {
      this.locationSearchDropdownList = [];
      for await (let r of this.locationMasterList) {
         this.locationSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      }
   }

   loadStaticLov() {

   }

   // locationList: ConsignmentSalesLocation[] = [];
   // async loadConsignmentLocation() {
   //   this.locationList = await this.getConsignmentLocation();
   // }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/masterList").toPromise();
   }

   // async getConsignmentLocation() {
   //   return await this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/consignmentLocation").toPromise();
   // }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/staticlov").toPromise();
   }

   getObjectList() {
      return this.http.get<ConsignmentSalesList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/cslist");
   }

   getObjectListByDate(startDate: string, endDate: string) {
      return this.http.get<ConsignmentSalesList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/listing/" + startDate + "/" + endDate);
   }

   getObjectById(objectId: number) {
      return this.http.get<ConsignmentSalesRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/" + objectId);
   }

   getExistingObject(trxDate: string, toLocationId: number) {
      return this.http.get<ConsignmentSalesRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/existing/" + trxDate + "/" + toLocationId);
   }

   insertObject(object: ConsignmentSalesRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales", object, httpObserveHeader);
   }

   updateObject(object: ConsignmentSalesRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales", object, httpObserveHeader);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileConsignmentSales/complete/${objectId}`, null, httpObserveHeader)
   }

   unCompleteObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileConsignmentSales/uncomplete/${objectId}`, null, httpObserveHeader)
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/jsonDebug", debugObject, httpObserveHeader);
   }

}
