import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { InventoryCurrentModel, StockReorderLine, StockReorderList, StockReorderRoot } from "../models/stock-reorder";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { ModuleControl } from "src/app/shared/models/module-control";
import { AuthService } from "src/app/services/auth/auth.service";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class StockReorderService {

   fullMasterList: MasterList[] = [];
   salesTypeMasterList: MasterListDetails[] = [];
   fullLocationMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   selectedTypeCode: string;

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadModuleControl();
      await this.loadStaticLovList();
      await this.loadMasterList();
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   pickingQtyControl: string = "0";
   systemWideScanningMethod: string;
   configMobileScanItemContinuous: boolean = false;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   configStockReorderBlockCheckBalance: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
         }

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }

         let stockReorderBlockCheckBalance = this.moduleControl.find(x => x.ctrlName === "StockReorderBlockCheckBalance");
         if (stockReorderBlockCheckBalance && stockReorderBlockCheckBalance.ctrlValue.toUpperCase() === "Y") {
            this.configStockReorderBlockCheckBalance = true;
         } else {
            this.configStockReorderBlockCheckBalance = false;
         }

      })
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
      this.salesTypeMasterList = fullMasterList.filter(x => x.objectName === "SalesType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0 && (y.code == 'T' || y.code == 'C'));
   }

   /* #region  for insert */

   object: StockReorderRoot;
   async setObject(object: StockReorderRoot) {
      this.object = object;
   }

   removeObject() {
      this.object = null;
   }

   resetVariables() {
      this.removeObject();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/staticLov").toPromise();
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<StockReorderList[]>(this.configService.selected_sys_param.apiUrl + `MobileStockReorder/srlist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<StockReorderRoot>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/" + objectId);
   }

   insertObject(object: StockReorderRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReorder", object, httpObserveHeader);
   }

   updateObject(object: StockReorderRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileStockReorder", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileStockReorder/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/jsonDebug", debugObject, httpObserveHeader);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   getInventoryQty(locationId: number, itemId: number) {
      return this.http.get<InventoryCurrentModel>(this.configService.selected_sys_param.apiUrl + `MobileStockReorder/inventoryQty/${locationId}/${itemId}`).toPromise();
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/itemByBarcode/" + barcode);
   }

}
