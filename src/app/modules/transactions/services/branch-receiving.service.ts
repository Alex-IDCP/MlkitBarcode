import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { TransactionProcessingCount, BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class BranchReceivingService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/masterlist").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/staticLov").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getObjectById(objectId: number) {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/" + objectId);
   }

   getReviewDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceivingReview/count");
   }

   getApprovalDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceivingApprove/count");
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId]
         },
         { responseType: "blob" });
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }

}
