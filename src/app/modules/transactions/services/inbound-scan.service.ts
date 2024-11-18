import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { AuthService } from "src/app/services/auth/auth.service";
import { LoadingService } from "src/app/services/loading/loading.service";
import { Subscription } from "rxjs";
import { InboundHeaderForWD, MultiInbound, MultiInboundListObject, MultiInboundObject, MultiInboundRoot } from "../models/inbound-scan";
import { ModuleControl } from "src/app/shared/models/module-control";
import { JsonDebug } from "src/app/shared/models/jsonDebug";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class InboundScanService {

   filterStartDate: Date;
   filterEndDate: Date;

   constructor(
      private http: HttpClient,
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

   /* #region store as one set data for each picking */

   header: MultiInbound;
   setHeader(header: MultiInbound) {
      this.header = header;
   }

   object: MultiInboundRoot;
   setObject(object: MultiInboundRoot) {
      this.object = object;
   }

   multiInboundObject: MultiInboundObject = { outstandingInboundList: [], inboundCarton: [] };
   setMultiInboundObject(object: MultiInboundObject) {
      this.multiInboundObject = object;
   }

   removeHeader() {
      this.header = null;
   }

   removeObject() {
      this.object = null;
   }

   removeMultiInboundObject() {
      this.multiInboundObject = { outstandingInboundList: [], inboundCarton: [] };
   }

   resetVariables() {
      this.removeHeader();
      this.removeMultiInboundObject();
      this.removeObject();
   }

   /* #endregion */

   hasWarehouseAgent(): boolean {
      let warehouseAgentId = JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId;
      if (warehouseAgentId === undefined || warehouseAgentId === null || warehouseAgentId === 0) {
         return false;
      }
      return true
   }

   async loadRequiredMaster() {
      try {
         await this.loadingService.showLoading();
         await this.loadMasterList();
         await this.loadStaticLov();
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
   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   customerLocationMasterList: MasterListDetails[] = [];
   allowedLocation: Number[] = [];
   fLocationMasterList: MasterListDetails[] = [];
   warehouseAgentMasterList: MasterListDetails[] = [];
   reasonMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUom").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.fLocationMasterList = this.locationMasterList;
      if (this.object && this.object.header && this.object.header.businessModelType === "T") {
         this.fLocationMasterList = this.locationMasterList.filter(r => r.attribute1 === "W");
      } else if (this.object && this.object.header && this.object.header.businessModelType != "T") {
         this.fLocationMasterList = this.locationMasterList.filter(r => r.attribute1 !== "B");
      }
      this.warehouseAgentMasterList = this.fullMasterList.filter(x => x.objectName === "WarehouseAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.reasonMasterList = this.fullMasterList.filter(x => x.objectName === "Reason").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
      await this.customerMasterList.sort((a, c) => { return a.code > c.code ? 1 : -1 });
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
      this.authService.currentUserToken$.subscribe(codedToken => {
         if (codedToken) {
            let locationString = codedToken.lid;
            if (locationString && locationString.length > 0) {
               this.allowedLocation = locationString.split(",").map(Number);
               if (this.allowedLocation.length > 0) {
                  this.allowedLocation = [...this.allowedLocation, ...this.fLocationMasterList.filter(x => this.allowedLocation.includes(parseInt(x.attribute15))).map(y => y.id)];
                  this.fLocationMasterList = this.fLocationMasterList.filter(x => this.allowedLocation.includes(x.id));
                  if (this.customerFilteringByUserLocation) {
                     this.customerMasterList = this.customerMasterList.filter(x => this.allowedLocation.includes(parseInt(x.attribute6)));
                  }
               }
            }
         }
      })
   }

   fullStaticLovList: MasterList[] = [];
   salesTypeMasterList: MasterListDetails[] = [];
   sourceTypeMasterList: MasterListDetails[] = [];
   multiInboundGroupTypeMasterList: MasterListDetails[] = [];
   multiInboundCopyFromMasterList: MasterListDetails[] = [];
   async loadStaticLov() {
      this.fullStaticLovList = await this.getStaticLov();
      this.salesTypeMasterList = this.fullStaticLovList.filter(x => x.objectName === "SalesType").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.sourceTypeMasterList = this.fullStaticLovList.filter(x => x.objectName === "SourceType").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.multiInboundGroupTypeMasterList = this.fullStaticLovList.filter(x => x.objectName === "MultiInboundGroupType").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.multiInboundCopyFromMasterList = this.fullStaticLovList.filter(x => x.objectName === "MultiInboundCopyFrom").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   moduleControl: ModuleControl[];
   configMultiInboundToWHOnly: boolean = true;
   customerFilteringByUserLocation: boolean = false;
   systemWideBlockConvertedCode: boolean;
   allowDocumentWithEmptyLine: string = "N";
   inbountQtyControl: string = "N";
   multiInboundActivateHeaderReason: boolean = false;
   configMobileScanItemContinuous: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
         if (config != undefined) {
            this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
         }
         let inboundLocationControl = this.moduleControl.find(x => x.ctrlName === "MultiInboundToWHOnly")
         if (inboundLocationControl && inboundLocationControl.ctrlValue.toUpperCase() === "Y") {
            this.configMultiInboundToWHOnly = true;
         } else {
            this.configMultiInboundToWHOnly = false;
         }
         let custFiltering = this.moduleControl.find(x => x.ctrlName === "CustomerFilteringByUserLocation");
         if (custFiltering && custFiltering.ctrlValue.toUpperCase() === "Y") {
            this.customerFilteringByUserLocation = true;
         } else {
            this.customerFilteringByUserLocation = false;
         }
         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }
         let inboundControl = this.moduleControl.find(x => x.ctrlName === "InboundScanQtyControl");
         if (inboundControl != undefined) {
            this.inbountQtyControl = inboundControl.ctrlValue;
         }
         let activateHeaderReason = this.moduleControl.find(x => x.ctrlName === "MultiInboundActivateHeaderReason");
         if (activateHeaderReason && activateHeaderReason.ctrlValue.toUpperCase() === "Y") {
            this.multiInboundActivateHeaderReason = true;
         } else {
            this.multiInboundActivateHeaderReason = false;
         }

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }
      })
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/masterList").toPromise();
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/staticLov").toPromise();
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<MultiInboundListObject[]>(this.configService.selected_sys_param.apiUrl + `MobileMultiInbound/listing/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<MultiInboundRoot>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/" + objectId);
   }

   getDoc(docNums: string[], orderType: string) {
      if (orderType === "I") {
         return this.http.post<InboundHeaderForWD[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/getITHeader", docNums, httpObserveHeader);
      } else {
         return this.http.post<InboundHeaderForWD[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/getSRHeader", docNums, httpObserveHeader);
      }
   }

   insertObject(object: MultiInboundRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound", object, httpObserveHeader);
   }

   updateObject(object: MultiInboundRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound", object, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/jsonDebug", debugObject, httpObserveHeader);
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileMultiInbound/itemByBarcode/" + barcode);
   }

}