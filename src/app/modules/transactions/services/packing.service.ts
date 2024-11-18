import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MultiPackingHeader, MultiPackingRoot, MultiPackingObject, MultiPackingList } from "../models/packing";
import { ItemListMultiUom, TransactionDetail } from "src/app/shared/models/transaction-detail";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { ItemImage } from "../models/item";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { background_load } from "src/app/core/interceptors/error-handler.interceptor";
import { AuthService } from "src/app/services/auth/auth.service";
import { LoadingService } from "src/app/services/loading/loading.service";
import { Subscription } from "rxjs";
import { LocalTransaction } from "src/app/shared/models/pos-download";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class PackingService {

   trxKey: string = "multiPacking";

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService,
      private loadingService: LoadingService,
   ) { }

   // Method to clean up the subscription
   stopListening() {
      if (this.custSubscription) {
         this.custSubscription.unsubscribe();
      }
   }

   /* #region store as one set data for each packing */

   header: MultiPackingHeader;
   object: MultiPackingRoot;
   setHeader(header: MultiPackingHeader) {
      this.header = header;
   }

   multiPackingObject: MultiPackingObject = { outstandingPackList: [], packingCarton: [] };
   setMultiPackingObject(object: MultiPackingObject) {
      this.multiPackingObject = object;
   }

   setPackingObject(object: MultiPackingRoot) {
      this.object = object;
   }

   localObject: LocalTransaction;
   setLocalObject(localObject: LocalTransaction) {
      this.localObject = localObject;
   }

   removeHeader() {
      this.header = null;
   }

   removeMultiPackingObject() {
      this.multiPackingObject = { outstandingPackList: [], packingCarton: [] };
   }

   removePackinGObject() {
      this.object = null;
   }

   removeLocalObject() {
      this.localObject = null;
   }

   async resetVariables() {
      this.removeHeader();
      this.removeMultiPackingObject();
      this.removePackinGObject();
      this.removeLocalObject();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   /* #endregion */

   /* #region get data */

   getTotalPacked() {
      if (this.object.details) {
         return this.object.details.flatMap(r => r.packList).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
      }
   }

   getUniqueSo(): string[] {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         return [...new Set(this.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
      }
      return [];
   }

   getUniqueItem(): string[] { //{ itemCode: string, variationTypeCode: string, isSelected: boolean }[] {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         return [...new Set(this.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
      }
      return [];
   }

   // getItemDescriptionByItemCode(itemCode: string): string {
   //    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
   //       let description = "";
   //       let found = this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode);
   //       if (found) {
   //          return found.description;
   //       }
   //    }
   //    return null;
   // }

   getLocationByItemCode(itemCode: string): string {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let location = "";
         let found = this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode);
         // if (found && found.rack) {
         //    location += found.rack;
         // }
         // if (found && found.subRack) {
         //    location += " - " + found.subRack;
         // }
         return location;
      }
      return null;
   }

   getQtyRequestByItemCode(itemCode: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         return this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPackedByItemCode(itemCode: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let qtyPackedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
         if (this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.isComponentScan) { // here to return isComponentScan item
            let assemblyComputedQty = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
            return Math.trunc(qtyPackedByOther + assemblyComputedQty);
         } else {
            if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) { // this part cannot calculate isComponentScan item
               let qtyPackedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemCode === itemCode && (r.assemblyItemId ?? null) === null).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
               return Math.trunc(qtyPackedByOther + qtyPackedCurrent);
            }
         }
         return Math.trunc(qtyPackedByOther);
      }
      return 0;
   }

   getQtyRequestByItemSku(itemSku: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         return this.multiPackingObject.outstandingPackList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPackedByItemSku(itemSku: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let qtyPackedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
         if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
            let qtyPackedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
            return qtyPackedByOther + qtyPackedCurrent;
         }
         return qtyPackedByOther;
      }
      return 0;
   }

   getProgressByItemCode(itemCode: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let total = this.getQtyRequestByItemCode(itemCode);
         if (total === 0) {
            return 0;
         }
         let qtyPacked = this.getQtyPackedByItemCode(itemCode);
         if (qtyPacked === 0) {
            return 0;
         }
         return (qtyPacked / total) * 100;
      }
      return 0;
   }

   getQtyRequestBySoNum(salesOrderNum: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         return this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPackedBySoNum(salesOrderNum: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let qtyPackedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
         if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
            let qtyPackedCurrent = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
            return qtyPackedByOther + qtyPackedCurrent;
         }
         return qtyPackedByOther;
      }
      return 0;
   }

   getProgressBySoNum(salesOrderNum: string): number {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let total = this.getQtyRequestBySoNum(salesOrderNum);
         if (total === 0) {
            return 0;
         }
         let qtyPacked = this.getQtyPackedBySoNum(salesOrderNum);
         if (qtyPacked === 0) {
            return 0;
         }
         return (qtyPacked / total) * 100;
      }
      return 0;
   }

   getItemVariation(itemCode: string): { itemSku: string, variationTypeCode: string, xDesc: string, yDesc: string }[] {
      if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
         let lines = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode);
         if (lines && lines.length > 0) {
            let results: any[] = [];
            lines.forEach(r => {
               if (!results.flatMap(rr => rr.itemSku).includes(r.itemSku)) {
                  results.push({
                     itemSku: r.itemSku,
                     variationTypeCode: r.variationTypeCode,
                     xDesc: this.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
                     yDesc: this.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
                  });
               }
            })
            return results;
         }
         return [];
      }
      return [];
   }

   isItemComponentScan(itemCode: string) {
      return this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.isComponentScan;
   }

   getItemAssembly(itemCode: string) {
      return this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.assembly;
   }

   /* #endregion */

   hasWarehouseAgent(): boolean {
      let warehouseAgentId = JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId;
      if (warehouseAgentId === undefined || warehouseAgentId === null || warehouseAgentId === 0) {
         return false;
      }
      return true
   }

   async loadRequiredMaster() {
      try {
         await this.loadingService.showLoading();
         await this.loadMasterList();
         await this.loadStaticLov();
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   custSubscription: Subscription;
   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   fLocationMasterList: MasterListDetails[] = [];
   warehouseAgentMasterList: MasterListDetails[] = [];
   reasonMasterList: MasterListDetails[] = [];
   packagingMasterList: MasterListDetails[] = [];
   shipMethodMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      setTimeout(async () => {
         this.fullMasterList = await this.getMasterList();
         this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
         await this.customerMasterList.sort((a, c) => { return a.code > c.code ? 1 : -1 });
         this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUom").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.fLocationMasterList = this.locationMasterList;
         if (this.object && this.object.header.businessModelType === "T") {
            this.fLocationMasterList = this.locationMasterList.filter(r => r.attribute1 === "W");
         } else if (this.object && this.object.header.businessModelType !== "T") {
            this.fLocationMasterList = this.locationMasterList.filter(r => r.attribute1 !== "B");
         }
         this.warehouseAgentMasterList = this.fullMasterList.filter(x => x.objectName === "WarehouseAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.reasonMasterList = this.fullMasterList.filter(x => x.objectName === "Reason").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.packagingMasterList = this.fullMasterList.filter(x => x.objectName === "Packaging").flatMap(src => src.details).filter(y => y.deactivated === 0);
         this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName === "ShipMethod").flatMap(src => src.details).filter(y => y.deactivated === 0);
      }, 0);
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
   }

   fullStaticLovList: MasterList[] = [];
   groupTypeMasterList: MasterListDetails[] = [];
   async loadStaticLov() {
      this.fullStaticLovList = await this.getStaticLov();
      this.groupTypeMasterList = this.fullMasterList.filter(x => x.objectName === "MultiPackingGroupType").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/masterList").toPromise();
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/staticLov").toPromise();
   }

   getObjectListByDate(startDate: string, endDate: string) {
      return this.http.get<MultiPackingList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/listing/" + startDate + "/" + endDate);
   }

   getObjectById(objectId: number) {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/" + objectId);
   }

   getSOHeader(object: string[]) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/getSOHeader", object, httpObserveHeader);
   }

   getB2BHeader(object: string[]) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/getB2bHeader", object, httpObserveHeader);
   }

   insertObject(object: MultiPackingRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking", object, httpObserveHeader);
   }

   updateObject(object: MultiPackingRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking", object, httpObserveHeader);
   }

   getItemImage(itemId: number) {
      return this.http.get<ItemImage[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/itemList/imageFile/" + itemId, { context: background_load() });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/jsonDebug", debugObject, httpObserveHeader);
   }

   getItemListMultiUom() {
      return this.http.get<ItemListMultiUom[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/item/itemListMultiUom", { context: background_load() });
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/itemByBarcode/" + barcode);
   }

}
