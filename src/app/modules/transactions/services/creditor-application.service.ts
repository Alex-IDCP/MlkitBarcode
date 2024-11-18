import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CreditorApplicationHeader, CreditorApplicationList, CreditorApplicationRoot } from '../models/creditor-application';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class CreditorApplicationService {

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) { }

   hasProcurementAgent(): boolean {
      let procurementAgentId = JSON.parse(localStorage.getItem('loginUser'))?.procurementAgentId;
      if (procurementAgentId === undefined || procurementAgentId === null || procurementAgentId === 0) {
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

   object: CreditorApplicationRoot = null;
   setObject(object: CreditorApplicationRoot) {
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
   procurementAgentMasterList: MasterListDetails[] = [];
   stateMasterList: MasterListDetails[] = [];
   taxMasterList: MasterListDetails[] = [];
   termPeriodMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.areaMasterList = this.fullMasterList.filter(x => x.objectName === "Area").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.countryMasterList = this.fullMasterList.filter(x => x.objectName === "Country").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.currencyMasterList = this.fullMasterList.filter(x => x.objectName === "Currency").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.glAccountMasterList = this.fullMasterList.filter(x => x.objectName === "GlAccount").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0 && y.attribute1 === "W");
      this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName === "PaymentMethod").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.priceSegmentMasterList = this.fullMasterList.filter(x => x.objectName === "PriceSegment").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.procurementAgentMasterList = this.fullMasterList.filter(x => x.objectName === "ProcurementAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.stateMasterList = this.fullMasterList.filter(x => x.objectName === "State").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.taxMasterList = this.fullMasterList.filter(x => x.objectName === "Tax").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.termPeriodMasterList = this.fullMasterList.filter(x => x.objectName === "TermPeriod").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   typeMasterList: MasterListDetails[] = [];
   async loadStaticLov() {
      let masterList = await this.getStaticLovList();
      this.typeMasterList = masterList.filter(x => x.objectName === "VendorType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0 && y);
   }

   getObjects() {
      return this.http.get<CreditorApplicationList[]>(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/vendorPreList");
   }

   getObjectById(objectId: number) {
      return this.http.get<CreditorApplicationRoot>(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/" + objectId);
   }

   insertObject(object: CreditorApplicationHeader) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileVendorPre", object, httpObserveHeader);
   }

   updateObject(object: CreditorApplicationHeader) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileVendorPre", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileVendorPre/deactivate/${objectId}`, null, httpObserveHeader);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/masterlist").toPromise();
   }
   
   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/staticLov").toPromise();
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/workflow/" + objectId);
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(keyId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/downloadFile/" + keyId, { responseType: "blob" });
   }

   deleteFile(keyId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/deleteFile/" + keyId, httpObserveHeader);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileVendorPre/jsonDebug", debugObject, httpObserveHeader);
   }

}
