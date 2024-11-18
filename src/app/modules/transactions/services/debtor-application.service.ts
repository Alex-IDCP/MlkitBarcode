import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { DebtorApplicationHeader, DebtorApplicationList, DebtorApplicationRoot } from '../models/debtor-application';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class DebtorApplicationService {

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) { }

   hasSalesAgent(): boolean {
      let salesAgentId = JSON.parse(localStorage.getItem("loginUser"))?.salesAgentId;
      if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
         return false;
      }
      return true
   }

   async loadRequiredMaster() {
      await this.loadModuleControl();
      await this.loadMasterList();
      await this.loadStaticLov();
   }

   moduleControl: ModuleControl[];
   configSystemWideEInvoiceStrictControl: boolean = false;
   eInvoiceDefaultForeignDebtorTIN: string;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let systemWideEInvoiceStrictControl = this.moduleControl.find(x => x.ctrlName === "SystemWideEInvoiceStrictControl");
         if (systemWideEInvoiceStrictControl?.ctrlValue.toUpperCase() === "Y") {
            this.configSystemWideEInvoiceStrictControl = true;
         }

         this.eInvoiceDefaultForeignDebtorTIN = this.moduleControl.find(x => x.ctrlName === "EInvoiceDefaultForeignDebtorTIN")?.ctrlValue;
      })
   }

   object: DebtorApplicationRoot = null;
   setObject(object: DebtorApplicationRoot) {
      this.object = object;
   }

   removeObject() {
      this.object = null;
   }

   resetVariables() {
      this.removeObject();
   }

   fullMasterList: MasterList[] = [];
   areaMasterList: MasterListDetails[] = [];
   countryMasterList: MasterListDetails[] = [];
   currencyMasterList: MasterListDetails[] = [];
   glAccountMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   paymentMethodMasterList: MasterListDetails[] = [];
   priceSegmentMasterList: MasterListDetails[] = [];
   salesAgentMasterList: MasterListDetails[] = [];
   stateMasterList: MasterListDetails[] = [];
   taxMasterList: MasterListDetails[] = [];
   termPeriodMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.areaMasterList = this.fullMasterList.filter(x => x.objectName === "Area").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.countryMasterList = this.fullMasterList.filter(x => x.objectName === "Country").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.currencyMasterList = this.fullMasterList.filter(x => x.objectName === "Currency").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.glAccountMasterList = this.fullMasterList.filter(x => x.objectName === "GlAccount").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName === "PaymentMethod").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.priceSegmentMasterList = this.fullMasterList.filter(x => x.objectName === "PriceSegment").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName === "SalesAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.stateMasterList = this.fullMasterList.filter(x => x.objectName === "State").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.taxMasterList = this.fullMasterList.filter(x => x.objectName === "Tax").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.termPeriodMasterList = this.fullMasterList.filter(x => x.objectName === "TermPeriod").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   loadStaticLov() {

   }

   getObjects() {
      return this.http.get<DebtorApplicationList[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication");
   }

   getObjectById(objectId: number) {
      return this.http.get<DebtorApplicationRoot>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/" + objectId);
   }

   insertObject(object: DebtorApplicationHeader) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication", object, httpObserveHeader);
   }

   updateObject(object: DebtorApplicationHeader) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileDebtorApplication/deactivate/${objectId}`, null, httpObserveHeader);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/masterlist").toPromise();
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/workflow/" + objectId);
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(keyId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/downloadFile/" + keyId, { responseType: "blob" });
   }

   deleteFile(keyId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/deleteFile/" + keyId, httpObserveHeader);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/jsonDebug", debugObject, httpObserveHeader);
   }

}
