import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { ConsignmentCountDetail, ConsignmentCountHeader, ConsignmentCountList, ConsignmentCountRoot } from "../models/consignment-count";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { LocalTransaction } from "src/app/shared/models/pos-download";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";
import { LoadingService } from "src/app/services/loading/loading.service";
import { CommonService } from "src/app/shared/services/common.service";
import { AuthService } from "src/app/services/auth/auth.service";
import { ModuleControl } from "src/app/shared/models/module-control";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class ConsignmentCountService {

   filterStartDate: Date;
   filterEndDate: Date;
   filterLocationId: number[] = [];

   trxKey: string = "consignmentCount";

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
   configMobileStockCountSlideToEdit: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let mobileStockCountSlideToEdit = this.moduleControl.find(x => x.ctrlName === "MobileStockCountSlideToEdit");
            if (mobileStockCountSlideToEdit && mobileStockCountSlideToEdit.ctrlValue.toUpperCase() === "Y") {
               this.configMobileStockCountSlideToEdit = true;
            } else {
               this.configMobileStockCountSlideToEdit = false;
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

   objectHeader: ConsignmentCountHeader;
   setHeader(objectHeader: ConsignmentCountHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: ConsignmentCountDetail[] = []
   setLines(objectDetail: ConsignmentCountDetail[]) {
      this.objectDetail = objectDetail;
   }

   localObject: LocalTransaction;
   setLocalObject(localObject: LocalTransaction) {
      this.localObject = localObject;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeLines() {
      this.objectDetail = [];
   }

   removeLocalObject() {
      this.localObject = null;
   }

   async resetVariables() {
      this.removeHeader();
      this.removeLines();
      this.removeLocalObject();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/masterList").toPromise();
   }

   // getObjects() {
   getObjects(dateStart: string, dateEnd: string) {
      return this.http.get<ConsignmentCountList[]>(this.configService.selected_sys_param.apiUrl + `MobileConsignmentCount/cclist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<ConsignmentCountRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/" + objectId);
   }

   insertObject(objectRoot: ConsignmentCountRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount", objectRoot, httpObserveHeader);
   }

   updateObject(objectRoot: ConsignmentCountRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount", objectRoot, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/jsonDebug", debugObject, httpObserveHeader);
   }

}
