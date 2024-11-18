import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferOutRoot, TransferOutLine, TransferOutList } from "../models/transfer-out";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { ModuleControl } from "src/app/shared/models/module-control";
import { AuthService } from "src/app/services/auth/auth.service";
import { WorkFlowState } from "src/app/shared/models/workflow";
import { BulkConfirmReverse } from "src/app/shared/models/transaction-processing";
import { FileListObject } from "src/app/shared/models/file-list-object";
import { CashDepositFileSimpleList } from "../models/cash-deposit";
import { DomSanitizer } from "@angular/platform-browser";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class TransferOutService {

   filterStartDate: Date;
   filterEndDate: Date;

   fullMasterList: MasterList[] = [];
   interTransferTypeList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   fullLocationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];

   selectedLocation: number;
   selectedTypeCode: string;

   pageNum: number = 1;

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
      private sanitizer: DomSanitizer
   ) { }

   async loadRequiredMaster() {
      await this.loadStaticLovList();
      await this.loadMasterList();
      await this.loadModuleControl();
   }

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.fullLocationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
      this.locationMasterList = this.fullLocationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
   }

   async loadStaticLovList() {
      let fullMasterList = await this.getStaticLovList();
      this.interTransferTypeList = fullMasterList.filter(x => x.objectName === "InterTransferType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0 && (y.code == 'IL' || y.code == 'C'));
   }

   moduleControl: ModuleControl[] = [];
   configMobileScanItemContinuous: boolean = false;
   configTransferOutActivateContainerNum: boolean = false;
   fileSizeLimit: number = 1 * 1024 * 1024;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }

         let transferOutActivateContainerNum = this.moduleControl.find(x => x.ctrlName === "TransferOutActivateContainerNum");
         if (transferOutActivateContainerNum && transferOutActivateContainerNum.ctrlValue.toUpperCase() === "Y") {
            this.configTransferOutActivateContainerNum = true;
         } else {
            this.configTransferOutActivateContainerNum = false;
         }
         
         let uploadFileSizeLimit = this.moduleControl.find(x => x.ctrlName === "UploadFileSizeLimit")?.ctrlValue;
         this.fileSizeLimit = Number(uploadFileSizeLimit) * 1024 * 1024;
      })
   }

   /* #region  for insert */

   objectHeader: TransferOutRoot;
   objectDetail: TransferOutLine[] = [];
   async setHeader(objectHeader: TransferOutRoot) {
      this.objectHeader = objectHeader;
   }

   setLine(objectDetail: TransferOutLine[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
      this.objectDetail.forEach(r => {
         r.qtyRequest = r.lineQty;
      })
   }

   objectAttachment: FileListObject[] = [];
   attachment: CashDepositFileSimpleList[] = [];
   setAttachment(objectAttachment: FileListObject[]) {
      this.objectAttachment = objectAttachment;
      this.attachment = [];
      this.objectAttachment.forEach(r => {
         this.downloadFile(r.filesId).subscribe(blob => {
            let objectURL = URL.createObjectURL(blob);
            this.attachment.push({
               filesId: r.filesId,
               filesName: r.filesName,
               imageUrl: this.sanitizer.bypassSecurityTrustUrl(objectURL)
            })
         }, error => {
            console.error(error);
         })
      })
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
   }

   removeAttachment() {
      this.objectAttachment = [];
   }

   resetVariables() {
      this.pageNum = 1;
      this.removeHeader();
      this.removeLine();
      this.removeAttachment();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/staticLov").toPromise();
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<TransferOutList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/toList/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<TransferOutRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/" + objectId);
   }

   insertObject(object: TransferOutRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
   }

   updateObject(object: TransferOutRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/exportPdf",
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
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/itemByBarcode/" + barcode);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/jsonDebug", debugObject, httpObserveHeader);
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }
   
   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/workflow/" + objectId);
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(fileId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/downloadFile/" + fileId, { responseType: 'blob' });
   }

   deleteFile(fileId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/deleteFile/" + fileId, httpObserveHeader);
   }

   getAttachmentIdByDocId(keyId: number) {
      return this.http.get<FileListObject[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/attachment/" + keyId);
   }

}
