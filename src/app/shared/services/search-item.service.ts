import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { ConfigService } from 'src/app/services/config/config.service';
import { TransactionDetail } from '../models/transaction-detail';
import { SalesItemRequest } from '../models/sales-item-request';
import { SalesItemInfoRoot } from '../models/sales-item-info';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class SearchItemService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      @Inject('apiObject') private apiObject: string
   ) {
      this.apiObject = apiObject;
   }

   getItemInfo(itemId: number, trxDate: string, keyId: number, locationId: number) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/item/" + itemId + "/" + trxDate + "/" + keyId + "/" + locationId, { context: background_load() });
   }

   getItemInfoByKeywordfortest(requestObject: SalesItemRequest) {
      return this.http.post<TransactionDetail[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/item/itemList", requestObject);
   }

   getSalesHistoryInfo(requestObject: SalesItemRequest) {
      return this.http.post<SalesItemInfoRoot[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/item/itemList/salesHistory", requestObject);
   }

   getItemImageFile(keyword: string) {
      return this.http.get<ItemImage[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/itemList/imageFile/" + keyword, { context: background_load() });
   }

   getItemInfoWithoutPrice(keyword: string, trxDate: string) {
      return this.http.get<TransactionDetail[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/item/itemList/" + keyword + "/" + trxDate);
   }

}
