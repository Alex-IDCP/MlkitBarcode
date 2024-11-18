import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { BulkConfirmReverse, TransactionProcessingCount, TransactionProcessingDoc } from '../models/transaction-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class TransactionProcessingService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      @Inject('apiObject') private apiObject: string
   ) {
      this.apiObject = apiObject;
   }

   getDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + this.apiObject + '/count');
   }

   getProcessingDocumentByDateRange(dateStart: string, dateEnd: string) {
      return this.http.get<TransactionProcessingDoc[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + '/processing/' + dateStart + '/' + dateEnd).pipe(
         map((response: any) => {
            return response.map((item: any) => item)
         })
      );
   }

   getGeneratedDocumentByDateRange(dateStart: string, dateEnd: string) {
      return this.http.get<TransactionProcessingDoc[]>(this.configService.selected_sys_param.apiUrl + this.apiObject + '/generated/' + dateStart + '/' + dateEnd).pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   updateDocumentStatus(docStatus: any, trxId: number, actionReason: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + this.apiObject + '/' + docStatus + '/' + trxId + '/' + actionReason, null, httpObserveHeader);
   }

   bulkUpdateDocumentStatus(bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + this.apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
   }

   rejectDocumentStatus(docStatus: any, trxId: number) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + this.apiObject + '/' + docStatus + '/' + trxId, null, httpObserveHeader);
   }

}
