import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MasterList } from '../models/master-list';
import { BulkConfirmReverse, TransactionProcessingDoc } from '../models/transaction-processing';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoginRequest } from 'src/app/services/auth/login-user';
import { OtherCompanyTrx } from '../models/other-company-access';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class MultiCoTransactionProcessingService {
   baseUrl: string;

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      @Inject("apiObject") private apiObject: string
   ) {
      this.baseUrl = this.configService.selected_sys_param.apiUrl;
      this.apiObject = apiObject;
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.baseUrl + this.apiObject + "/masterlist");
   }

   getOtherCompany() {
      return this.http.get<OtherCompanyTrx[]>(this.baseUrl + this.apiObject + "/otherCompaniesLogin");
   }

   getTokenByUrl(url: string, loginModel: LoginRequest) {
      return this.http.post<any>(url + "/account/login", loginModel, httpObserveHeader);
   }

   getTransactionList(token: string, url: string, trxEndPoint: string) {
      const httpHeaders: HttpHeaders = new HttpHeaders({
         Authorization: "Bearer " + token
      });
      return this.http.get<TransactionProcessingDoc[]>(url + "/" + trxEndPoint + "/pending", { headers: httpHeaders });
   }

   bulkUpdateDocumentStatus(token: string, url: string, trxEndPoint: string, bulkConfirmReverse: BulkConfirmReverse) {
      const httpHeaders: HttpHeaders = new HttpHeaders({
         Authorization: "Bearer " + token
      });
      return this.http.post(url + "/" + trxEndPoint + "/bulkUpdate", bulkConfirmReverse, { headers: httpHeaders, observe: "response" });
   }

   downloadPdf(token: string, url: string, trxEndPoint: string, reqBody: number[]) {
      const httpHeaders: HttpHeaders = new HttpHeaders({
         Authorization: "Bearer " + token
      });
      return this.http.post(url + "/" + trxEndPoint + "/printPdf", reqBody, { headers: httpHeaders, responseType: "blob" });
   }

}
