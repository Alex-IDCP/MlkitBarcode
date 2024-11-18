import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { DraftTransaction } from '../models/draft-transaction';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class DraftTransactionService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  // getObjects(type: string) {
  //   return this.http.get<DraftTransaction[]>(this.configService.selected_sys_param.apiUrl + "MobileDraftTransaction/type/" + type.toUpperCase());
  // }

  // getObject(objectId) {
  //   return this.http.get<DraftTransaction>(this.configService.selected_sys_param.apiUrl + "MobileDraftTransaction/" + objectId);
  // }

  // insertObject(object: DraftTransaction) {
  //   return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDraftTransaction", object, httpObserveHeader);
  // }

  // updateObject(object: DraftTransaction) {
  //   return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDraftTransaction", object, httpObserveHeader);
  // }

  // toggleObject(objectId: number) {
  //   return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDraftTransaction/deactivate/" + objectId, null, httpObserveHeader);
  // }

}
