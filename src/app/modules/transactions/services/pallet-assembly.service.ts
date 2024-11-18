import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { PalletAssemblyDetail, PalletAssemblyHeader, PalletAssemblyList, PalletAssemblyRoot } from "../models/pallet-assembly";
import { BinList } from "../models/transfer-bin";
import { ModuleControl } from "src/app/shared/models/module-control";
import { AuthService } from "src/app/services/auth/auth.service";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class PalletAssemblyService {

   filterStartDate: Date;
   filterEndDate: Date;

   trxKey: string = "palletAssembly";

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
      await this.loadModuleControl();
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      //  this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }
   
   moduleControl: ModuleControl[] = [];
   configMobileScanItemContinuous: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }
      })
   }

   objectHeader: PalletAssemblyHeader;
   setHeader(objectHeader: PalletAssemblyHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: PalletAssemblyDetail[] = []
   setLines(objectDetail: PalletAssemblyDetail[]) {
      this.objectDetail = objectDetail;
   }

   locationBin: BinList[] = [];
   setLocationBin(locationBin: BinList[]) {
      this.locationBin = locationBin;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeLines() {
      this.objectDetail = [];
   }

   removeLocationBin() {
      this.locationBin = [];
   }

   resetVariables() {
      this.removeHeader();
      this.removeLines();
      this.removeLocationBin();
      this.configService.removeFromLocalStorage(this.trxKey);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly/masterList").toPromise();
   }

   getObjectListing(dateStart: string, dateEnd: string) {
      return this.http.get<PalletAssemblyList[]>(this.configService.selected_sys_param.apiUrl + `MobilePalletAssembly/listing/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<PalletAssemblyRoot>(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly/" + objectId);
   }

   insertObject(objectRoot: PalletAssemblyRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly", objectRoot, httpObserveHeader);
   }

   updateObject(objectRoot: PalletAssemblyRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly", objectRoot, httpObserveHeader);
   }

   getLocationBin(locationId: number) {
      return this.http.get<any[]>(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly/binlist/" + locationId);
   }

   getReceiveMatching(locationId: number) {
      return this.http.get<any[]>(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly/rmlist/" + locationId);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePalletAssembly/jsonDebug", debugObject, httpObserveHeader);
   }

}
