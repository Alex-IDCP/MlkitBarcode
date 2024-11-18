import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { BulkConfirmReverse, TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { PurchaseOrderDto, PurchaseOrderLine, PurchaseOrderRoot } from '../models/purchase-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SalesBillService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesBill/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesBill/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }  

  getSalesBillById(objectId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileSalesBill/" + objectId);
  }

}
