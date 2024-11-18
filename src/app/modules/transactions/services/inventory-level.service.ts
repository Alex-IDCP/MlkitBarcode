import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { InventoryLevelRoot, InventoryLevelVariationRoot, ItemPriceBySegment } from '../models/inventory-level';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class InventoryLevelService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) {

   }

   async loadRequiredMaster() {
      await this.loadMasterList();
   }

   fullMasterList: MasterList[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   //Load item list in background
   getItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "mobileInventoryLevel/itemlist", { context: background_load() }).pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "mobileInventoryLevel/masterlist").toPromise();
   }

   // getItemThumbnailById(itemId: number) {
   //   return this.http.get(this.configService.selected_sys_param.apiUrl + "inventoryLevel/itemInfoThumbnail/" + itemId, { observe: "response" as "response", responseType: "blob" });
   // }

   getInventoryLevelByItem(itemId: number, loginUserType: string, salesAgentId?: number) {
      return this.http.get<InventoryLevelRoot>(this.configService.selected_sys_param.apiUrl + "mobileInventoryLevel/item/" + itemId + "/" + loginUserType + "/" + salesAgentId);
   }

   getInventoryLevelByVariation(itemId: number, loginUserType: string, salesAgentId?: number) {
      return this.http.get<InventoryLevelVariationRoot>(this.configService.selected_sys_param.apiUrl + "mobileInventoryLevel/variation/" + itemId + "/" + loginUserType + "/" + salesAgentId);
   }

   getSegmentItemPriceBySalesAgent(itemId: number, loginUserType: string, salesAgentId?: number) {
      return this.http.get<ItemPriceBySegment[]>(this.configService.selected_sys_param.apiUrl + "mobileInventoryLevel/price/" + itemId + "/" + loginUserType + "/" + salesAgentId);
   }

}
