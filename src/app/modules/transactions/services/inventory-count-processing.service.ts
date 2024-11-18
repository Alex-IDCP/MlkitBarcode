import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { BulkConfirmReverse, TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { WorkFlowState } from 'src/app/shared/models/workflow';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class InventoryCountProcessingService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCountProcessing/masterlist").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCountProcessing/staticLov").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getObject(objectId: number) {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCountProcessing/" + objectId);
   }

   getReviewDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobileInventoryCountProcessingReview/count');
   }

   getApprovalDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobileInventoryCountProcessingApprove/count');
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInventoryCountProcessing/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId]
         },
         { responseType: "blob" });
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCountProcessing/workflow/" + objectId);
   }

}
