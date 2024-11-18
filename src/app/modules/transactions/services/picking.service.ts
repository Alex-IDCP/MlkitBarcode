import { HttpClient } from '@angular/common/http';
import { Injectable, asNativeElements } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { MultiPickingHeader, MultiPickingList, MultiPickingObject, MultiPickingRoot } from '../models/picking';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ItemImage } from '../models/item';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ItemListMultiUom, TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class PickingService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService,
      private loadingService: LoadingService
   ) { }

   // Method to clean up the subscription
   stopListening() {
      if (this.custSubscription) {
         this.custSubscription.unsubscribe();
      }
   }

   /* #region store as one set data for each picking */

   header: MultiPickingHeader;
   object: MultiPickingRoot;
   setHeader(header: MultiPickingHeader) {
      this.header = header;
   }

   multiPickingObject: MultiPickingObject = { outstandingPickList: [], pickingCarton: [] };
   setMultiPickingObject(object: MultiPickingObject) {
      this.multiPickingObject = object;
   }

   setPickingObject(object: MultiPickingRoot) {
      this.object = object;
   }

   removeHeader() {
      this.header = null;
   }

   removeMultiPickingObject() {
      this.multiPickingObject = { outstandingPickList: [], pickingCarton: [] };
   }

   removePickingObject() {
      this.object = null;
   }

   resetVariables() {
      this.removeHeader();
      this.removeMultiPickingObject();
      this.removePickingObject();
   }

   /* #endregion */

   /* #region get data */

   getTotalPicked() {
      if (this.object.details) {
         return this.object.details.flatMap(r => r.pickList).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
      }
   }

   getUniqueSo(): string[] {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         return [...new Set(this.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
      }
      return [];
   }

   getUniqueItem(): string[] { //{ itemCode: string, variationTypeCode: string, isSelected: boolean }[] {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         return [...new Set(this.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
      }
      return [];
   }

   // getItemDescriptionByItemCode(itemCode: string): string {
   //    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
   //       let description = "";
   //       let found = this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode);
   //       if (found) {            
   //          return found.description;
   //       }
   //    }
   //    return null;
   // }

   getLocationByItemCode(itemCode: string): string {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let location = "";
         let found = this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode);
         return location;
      }
      return null;
   }

   getQtyRequestByItemCode(itemCode: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         return this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPickedByItemCode(itemCode: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
         if (this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode)?.isComponentScan) { // here to return isComponentScan item
            let assemblyComputedQty = this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
            return Math.trunc(qtyPickedByOther + assemblyComputedQty);
         } else {
            if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) { // this part cannot calculate isComponentScan item
               let qtyPickedCurrent = this.multiPickingObject.pickingCarton.flatMap(r => r.pickList).filter(r => r.itemCode === itemCode && (r.assemblyItemId??null) === null).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
               return Math.trunc(qtyPickedByOther + qtyPickedCurrent);
            }
         }         
         return Math.trunc(qtyPickedByOther);
      }
      return 0;
   }

   getQtyRequestByItemSku(itemSku: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         return this.multiPickingObject.outstandingPickList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPickedByItemSku(itemSku: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
         if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) {
            let qtyPickedCurrent = this.multiPickingObject.pickingCarton.flatMap(r => r.pickList).filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
            return qtyPickedByOther + qtyPickedCurrent;
         }
         return qtyPickedByOther;
      }
      return 0;
   }

   getProgressByItemCode(itemCode: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let total = this.getQtyRequestByItemCode(itemCode);
         if (total === 0) {
            return 0;
         }
         let qtyPicked = this.getQtyPickedByItemCode(itemCode);
         if (qtyPicked === 0) {
            return 0;
         }
         return (qtyPicked / total) * 100;
      }
      return 0;
   }

   getQtyRequestBySoNum(salesOrderNum: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         return this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      return 0;
   }

   getQtyPickedBySoNum(salesOrderNum: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
         if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) {
            let qtyPickedCurrent = this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
            return qtyPickedByOther + qtyPickedCurrent;
         }
         return qtyPickedByOther;
      }
      return 0;
   }

   getProgressBySoNum(salesOrderNum: string): number {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let total = this.getQtyRequestBySoNum(salesOrderNum);
         if (total === 0) {
            return 0;
         }
         let qtyPicked = this.getQtyPickedBySoNum(salesOrderNum);
         if (qtyPicked === 0) {
            return 0;
         }
         return (qtyPicked / total) * 100;
      }
      return 0;
   }

   getItemVariation(itemCode: string): { itemSku: string, variationTypeCode: string, xDesc: string, yDesc: string }[] {
      if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
         let lines = this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode);
         if (lines && lines.length > 0) {
            let results: any[] = [];
            lines.forEach(r => {
               if (!results.flatMap(rr => rr.itemSku).includes(r.itemSku)) {
                  results.push({ 
                     itemSku: r.itemSku, 
                     variationTypeCode: r.variationTypeCode, 
                     xDesc: this.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
                     yDesc: this.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description
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
      return this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode)?.isComponentScan;
   }

   getItemAssembly(itemCode: string) {
      return this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode)?.assembly;
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
   warehouseAgentMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
      await this.customerMasterList.sort((a, c) => { return a.code > c.code ? 1 : -1 });
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.warehouseAgentMasterList = this.fullMasterList.filter(x => x.objectName === "WarehouseAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
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
      this.groupTypeMasterList = this.fullMasterList.filter(x => x.objectName === "MultiPickingGroupType").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/masterList").toPromise();
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/staticLov").toPromise();
   }

   getObjectListByDate(startDate: string, endDate: string) {
      return this.http.get<MultiPickingList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/listing/" + startDate + "/" + endDate);
   }

   getObjectById(objectId: number) {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/" + objectId);
   }

   getSOHeader(object: string[]) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/getSOHeader", object, httpObserveHeader);
   }

   getB2BHeader(object: string[]) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/getB2bHeader", object, httpObserveHeader);
   }

   insertObject(object: MultiPickingRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking", object, httpObserveHeader);
   }

   updateObject(object: MultiPickingRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking", object, httpObserveHeader);
   }

   getItemImage(itemId: number) {
      return this.http.get<ItemImage[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/itemList/imageFile/" + itemId, { context: background_load() });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/jsonDebug", debugObject, httpObserveHeader);
   }

   // getSoByCustomer(customerId: number) {
   //   return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSO/customer/" + customerId);
   // }

   // getSoByCustomerLocation(customerId: number, toLocationId: number){
   //   return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSo/customer/" + customerId + "/" + toLocationId);
   // }

   // insertPicking(object: GoodsPickingRoot) {
   //   return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePicking", object, httpObserveHeader);
   // }

   getItemListMultiUom() {
      return this.http.get<ItemListMultiUom[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/item/itemListMultiUom", { context: background_load() });
   }
   
   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/itemByBarcode/" + barcode);
   }

}
