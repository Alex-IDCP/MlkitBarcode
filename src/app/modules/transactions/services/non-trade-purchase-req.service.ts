import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class NonTradePurchaseReqService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileNonTradePurchaseReq/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getNonTradePurchaseReqDetail(purchaseReqId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileNonTradePurchaseReq/" + purchaseReqId);
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileNonTradePurchaseReq/exportPdf", 
    {
      "appCode": appCode,
      "format": format,
      "documentIds": [ documentId ]
    },
    { responseType: "blob"});
  }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
  }

}
