import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { BulkConfirmReverse, TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { PurchaseReqRoot, PurchaseReqDto, PurchaseReqLine } from '../models/purchase-req';
import { map } from 'rxjs/operators';
import { WorkFlowState } from 'src/app/shared/models/workflow';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class PurchaseReqService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) {

   }

   unflattenDtoDetail(object: PurchaseReqRoot): PurchaseReqDto {
      let line: PurchaseReqLine[] = [];
      object.details.forEach(r => {
         if (r.variationTypeCode === '0') {
            let l: PurchaseReqLine = {
               purchaseReqLineId: r.lineId,
               purchaseReqId: r.headerId,
               itemId: r.itemId,
               itemVariationXId: null,
               itemVariationYId: null,
               itemCode: r.itemCode,
               itemSku: r.itemSku,
               description: r.description,
               extendedDescription: r.extendedDescription,
               qtyRequest: r.qtyRequest,
               unitPrice: r.unitPrice,
               subTotal: r.subTotal,
               sequence: r.sequence,
               locationId: r.locationId,
               deactivated: r.deactivated
            }
            line.push(l);
         } else {
            r.variationDetails.forEach(v => {
               v.details.forEach(d => {
                  let l: PurchaseReqLine = {
                     purchaseReqLineId: r.lineId,
                     purchaseReqId: r.headerId,
                     itemId: r.itemId,
                     itemVariationXId: v.itemVariationXId,
                     itemVariationYId: d.itemVariationYId,
                     itemCode: r.itemCode,
                     itemSku: r.itemSku,
                     description: r.description,
                     extendedDescription: r.extendedDescription,
                     qtyRequest: d.qtyRequest,
                     unitPrice: r.unitPrice,
                     subTotal: (d.qtyRequest ?? 0) * (r.unitPrice ?? 0),
                     sequence: r.sequence,
                     locationId: r.locationId,
                     deactivated: r.deactivated
                  }
                  if (l.qtyRequest && l.qtyRequest > 0) {
                     line.push(l);
                  }
               })
            })
         }
      })

      let dto: PurchaseReqDto = {
         header: {
            purchaseReqId: object.header.purchaseReqId,
            purchaseReqNum: object.header.purchaseReqNum,
            trxDate: object.header.trxDate,
            typeCode: object.header.typeCode,
            attention: object.header.attention,
            locationId: object.header.locationId,
            vendorId: object.header.vendorId,
            termPeriodId: object.header.termPeriodId,
            workFlowTransactionId: object.header.workFlowTransactionId,
            countryId: object.header.countryId,
            currencyId: object.header.currencyId,
            currencyRate: object.header.currencyRate,
            remark: object.header.remark,
            createdById: object.header.createdById,
            createdBy: object.header.createdBy,
            createdAt: object.header.createdAt
         },
         details: line
      }

      return dto;
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePurchaseReq/masterlist").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePurchaseReq/staticLov").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getPurchaseReqDetail(purchaseReqId: number) {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobilePurchaseReq/" + purchaseReqId);
   }

   getReviewDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobilePurchaseReqReview/count');
   }

   getApprovalDocumentCount() {
      return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobilePurchaseReqApprove/count');
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePurchaseReq/exportPdf",
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
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobilePurchaseReq/workflow/" + objectId);
   }

}