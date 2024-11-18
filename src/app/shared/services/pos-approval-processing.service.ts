import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MasterList } from '../models/master-list';
import { TransactionProcessingCount } from '../models/transaction-processing';
import { ConfigService } from 'src/app/services/config/config.service';
import { PosApproval, PosApprovalLine } from '../models/pos-approval-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class PosApprovalProcessingService {
   
   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      @Inject('apiObject') private apiObject: string
   ) {
      this.apiObject = apiObject;
   }

   getObjectCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/count");
   }

   getObjects(startDate: string, endDate: string) {
      return this.http.get<PosApproval[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/processing/" + startDate + "/" + endDate);
   }

   approveObject(posApprovalId: number, remark: object) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + this.apiObject + "/isApprove/" + posApprovalId, remark, httpObserveHeader);
   }

   rejectObject(posApprovalId: number, remark: object) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + this.apiObject + "/isReject/" + posApprovalId, remark, httpObserveHeader);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/masterlist");
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/staticLov");
   }

   // special for pos exchange
   getObjectLine(posApprovalId: number) {
      return this.http.get<PosApprovalLine[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/line/" + posApprovalId);
   }

}
