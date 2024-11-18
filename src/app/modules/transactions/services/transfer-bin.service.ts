import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { BinFromPalletList, BinList, TransferBinDetail, TransferBinHeader, TransferBinList, TransferBinRoot } from "../models/transfer-bin";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class TransferBinService {

   filterStartDate: Date;
   filterEndDate: Date;

   trxKey: string = "transferBin";

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
      await this.loadStaticLov();
   }

   fullMasterList: MasterList[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   warehouseAgentMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.locationMasterList.filter(r => (r.attribute1 === "W" || r.attribute1 === "O")); // && this.configService.loginUser.locationId.includes(r.id));
      this.warehouseAgentMasterList = this.fullMasterList.filter(x => x.objectName === "WarehouseAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   transferBinTypeMasterList: MasterListDetails[] = [];
   async loadStaticLov() {
      let full = await this.getStaticLov();
      this.transferBinTypeMasterList = full.filter(x => x.objectName === "TransferBinType").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   objectHeader: TransferBinHeader;
   setHeader(objectHeader: TransferBinHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: TransferBinDetail[] = []
   setLines(objectDetail: TransferBinDetail[]) {
      this.objectDetail = objectDetail;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeLines() {
      this.objectDetail = [];
   }

   async resetVariables() {
      this.removeHeader();
      this.removeLines();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   binList: BinList[] = [];
   binSearchList: SearchDropdownList[] = [];
   palletList: string[] = [];
   palletSearchList: SearchDropdownList[] = [];
   async onLocationChanged(locationId: number) {
      if (locationId) {
         this.binList = await this.getBinList(locationId);
         await this.bindBinList();
         this.palletList = await this.getPalletList(locationId);
         await this.bindPalletList();
      } else {
         this.binList = [];
         this.palletList = [];
      }
   }

   bindBinList() {
      this.binSearchList = [];
      this.binList.forEach((r, index) => {
         this.binSearchList.push({
            id: index,
            code: r.binCode,
            description: r.binCode
         })
      })
   }

   bindPalletList() {
      this.palletSearchList = [];
      this.palletList.forEach((r, index) => {
         this.palletSearchList.push({
            id: index,
            code: r,
            description: r
         })
      })
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferBin/masterList").toPromise();
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferBin/staticLov").toPromise();
   }

   getObjects(dateStart: string, dateEnd: string) {
      return this.http.get<TransferBinList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferBin/tblist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<TransferBinRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferBin/" + objectId);
   }

   insertObject(objectRoot: TransferBinRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferBin", objectRoot, httpObserveHeader);
   }

   updateObject(objectRoot: TransferBinRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferBin", objectRoot, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferBin/jsonDebug", debugObject, httpObserveHeader);
   }

   getBinList(locationId: number) {
      return this.http.get<BinList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferBin/binlist/${locationId}`).toPromise();
   }

   getPalletList(locationId: number) {
      return this.http.get<string[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferBin/palletlist/${locationId}`).toPromise();
   }

   getPalletObject(palletCode: string) {
      return this.http.get<BinFromPalletList[]> (this.configService.selected_sys_param.apiUrl + `MobileTransferBin/pallet/${palletCode}`);
   }

}
