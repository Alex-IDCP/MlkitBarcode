import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { LocalTransaction } from "src/app/shared/models/pos-download";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";
import { LoadingService } from "src/app/services/loading/loading.service";
import { CommonService } from "src/app/shared/services/common.service";
import { AuthService } from "src/app/services/auth/auth.service";
import { ModuleControl } from "src/app/shared/models/module-control";
import { ConsignmentCountEntryHeader, ConsignmentCountEntryList, ConsignmentCountEntryRoot } from "../models/consignment-count-entry";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class ConsignmentCountEntryService {

   filterStartDate: Date;
   filterEndDate: Date;
   filterLocationId: number[] = [];

   trxKey: string = "consignmentCountEntry";

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private loadingService: LoadingService
   ) { }

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
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   moduleControl: ModuleControl[];
   configMobileScanItemContinuous: boolean = false;
   configItemVariationMatrixShowCodeDesc: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
            if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
               this.configMobileScanItemContinuous = true;
            } else {
               this.configMobileScanItemContinuous = false;
            }

            let itemVariationMatrixShowCodeDesc = this.moduleControl.find(x => x.ctrlName === "ItemVariationMatrixShowCodeDesc");
            if (itemVariationMatrixShowCodeDesc && itemVariationMatrixShowCodeDesc.ctrlValue.toUpperCase() === "Y") {
               this.configItemVariationMatrixShowCodeDesc = true
            } else {
               this.configItemVariationMatrixShowCodeDesc = false;
            }
         });
      } catch (e) {
         console.error(e);
      }
   }


   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   fullLocationMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName == "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.fullLocationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      if (this.commonService.getModCtrlBoolValue(this.moduleControl, "TransformCSBizModelAsRetail")) {
         this.locationMasterList = this.fullLocationMasterList.filter(r => (r.attribute1 === "C" || r.attribute1 === "O") && (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      } else {
         this.locationMasterList = this.fullLocationMasterList.filter(r => r.attribute1 === "C" && (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      }
      await this.bindLocationList();
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

   object: ConsignmentCountEntryRoot;
   setObject(object: ConsignmentCountEntryRoot) {
      this.object = object;
   }

   localObject: LocalTransaction;
   setLocalObject(localObject: LocalTransaction) {
      this.localObject = localObject;
   }

   removeObject() {
      this.object = null
   }

   removeLocalObject() {
      this.localObject = null;
   }

   async resetVariables() {
      this.removeObject();
      this.removeLocalObject();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry/masterList").toPromise();
   }

   getObjects(dateStart: string, dateEnd: string) {
      return this.http.get<ConsignmentCountEntryList[]>(this.configService.selected_sys_param.apiUrl + `MobileConsignmentCountEntry/listing/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<ConsignmentCountEntryRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry/" + objectId);
   }

   insertObject(objectRoot: ConsignmentCountEntryRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry", objectRoot, httpObserveHeader);
   }

   updateObject(objectRoot: ConsignmentCountEntryRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry", objectRoot, httpObserveHeader);
   }

   populateDetail(startDate: Date, locationId: number) {
      return this.http.post<TransactionDetail[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry/populate", { startDate: startDate, locationId: locationId });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCountEntry/jsonDebug", debugObject, httpObserveHeader);
   }

}
