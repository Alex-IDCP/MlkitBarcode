import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { BinCountBatchList, BinCountDetail, BinCountHeader, BinCountList, BinCountRoot, LocalBinCountBatchList } from '../models/bin-count';
import { InventoryCountBatchCriteria } from '../models/stock-count';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { BinList } from '../models/transfer-bin';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class BinCountService {

   filterStartDate: Date;
   filterEndDate: Date;

   trxKey: string = "binCount";

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   rackMasterList: MasterListDetails[] = [];
   zoneMasterList: MasterListDetails[] = [];
   itemBrandMasterList: MasterListDetails[] = [];
   itemGroupMasterList: MasterListDetails[] = [];
   itemCategoryMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName == "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemBrandMasterList = this.fullMasterList.filter(x => x.objectName == "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemGroupMasterList = this.fullMasterList.filter(x => x.objectName == "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemCategoryMasterList = this.fullMasterList.filter(x => x.objectName == "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.rackMasterList = this.fullMasterList.filter(x => x.objectName == "Rack").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.zoneMasterList = this.fullMasterList.filter(x => x.objectName == "Zone").flatMap(src => src.details).filter(y => y.deactivated == 0);
   }

   objectHeader: BinCountHeader = null;
   setHeader(objectHeader: BinCountHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: BinCountDetail[] = []
   setLines(objectDetail: BinCountDetail[]) {
      this.objectDetail = objectDetail;
   }

   flatDetail: LocalBinCountBatchList[] = [];
   setFlatDetail(flatDetail: LocalBinCountBatchList[]) {
      this.flatDetail = flatDetail;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeDetail() {
      this.objectDetail = [];
   }

   removeFlatDetail() {
      this.flatDetail = [];
   }

   async resetVariables() {
      this.removeHeader();
      this.removeDetail();
      this.removeFlatDetail();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   binList: BinList[] = [];
   binSearchList: SearchDropdownList[] = [];
   async onLocationChanged(locationId: number) {
      if (locationId) {
         this.binList = await this.getBinList(locationId);
         await this.bindBinList();
      } else {
         this.binList = [];
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

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBinCount/masterList").toPromise();
   }

   getObjectList(startDate: string, endDate: string) {
      return this.http.get<BinCountList[]>(this.configService.selected_sys_param.apiUrl + "MobileBinCount/listing/" + startDate + "/" + endDate);
   }

   getObject(objetcId: number) {
      return this.http.get<BinCountRoot>(this.configService.selected_sys_param.apiUrl + "MobileBinCount/" + objetcId);
   }

   getBinCountBatchByLocationId(locationId: number) {
      return this.http.get<BinCountBatchList[]>(this.configService.selected_sys_param.apiUrl + "MobileBinCount/batchlist/" + locationId);
   }

   getBinCountBatchCriteria(batchId: number) {
      return this.http.get<InventoryCountBatchCriteria>(this.configService.selected_sys_param.apiUrl + "MobileBinCount/batchRandomList/" + batchId);
   }

   insertBinCount(objectRoot: BinCountRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBinCount", objectRoot, httpObserveHeader);
   }

   updateBinCount(objectRoot: BinCountRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileBinCount", objectRoot, httpObserveHeader);
   }

   getBinList(locationId: number) {
      return this.http.get<BinList[]>(this.configService.selected_sys_param.apiUrl + `MobileBinCount/binlist/${locationId}`).toPromise();
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBinCount/jsonDebug", debugObject, httpObserveHeader);
   }

}
