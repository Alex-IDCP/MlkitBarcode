import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferInHeader, TransferInLine, TransferInList } from "../models/transfer-in";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class TransferInService {

   // selectedConsignmentLocation: ConsignmentSalesLocation = null;

   fullMasterList: MasterList[] = [];
   interTransferTypeList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];

   selectedLocation: number = null;

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      // await this.loadConsignmentLocation();
      await this.loadMasterList();
   }

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
   }

   // locationList: ConsignmentSalesLocation[] = [];
   // async loadConsignmentLocation() {
   //   this.locationList = [];
   //   this.locationList = await this.getConsignmentLocation();
   // }

   /* #region  for insert */

   objectHeader: TransferInHeader;
   objectDetail: TransferInLine[] = [];
   async setHeader(objectHeader: TransferInHeader) {
      this.objectHeader = objectHeader;
   }

   setLine(objectDetail: TransferInLine[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
   }

   resetVariables() {
      this.removeHeader();
      this.removeLine();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/staticLov");
   }

   getPendingList(locationCode: string) {
      return this.http.get<TransferInHeader[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/pending/${locationCode}`);
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<TransferInList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/tilist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<TransferInHeader>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/" + objectId);
   }

   updateObject(object: TransferInHeader) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferIn", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/itemByBarcode/" + barcode);
   }

}
