import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { BarcodeTag, ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { InventoryCountBatchCriteria, InventoryCountBatchList, StockCount, StockCountDetail, StockCountHeader, StockCountList, StockCountRoot } from '../models/stock-count';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BinList } from '../models/transfer-bin';
import { LocalTransaction } from 'src/app/shared/models/pos-download';
import { TransactionCode } from '../models/transaction-type-constant';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class StockCountService {

   filterStartDate: Date;
   filterEndDate: Date;

   trxKey: string = TransactionCode.inventoryCountTrx;

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService
   ) { }

   async loadRequiredMaster() {
      await this.loadModuleControl();
      await this.loadMasterList();
   }

   moduleControl: ModuleControl[];
   configInvCountFreeTextZoneRack: boolean = false;
   configInvCountActivateLineWithBin: boolean = false;
   configHeaderShowBinDesc: boolean = false;
   configMobileScanItemContinuous: boolean = false;
   configInvCountBinFromLocation: boolean = false;
   configMobileStockCountItemAlwaysCreateNewLine: boolean = false;
   configMobileStockCountHideBinSelection: boolean = false;
   configMobileStockCountSlideToEdit: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let invCountFreeTextZoneRack = this.moduleControl.find(x => x.ctrlName === "InvCountFreeTextZoneRack");
         if (invCountFreeTextZoneRack && invCountFreeTextZoneRack.ctrlValue.toUpperCase() === "Y") {
            this.configInvCountFreeTextZoneRack = true;
         } else {
            this.configInvCountFreeTextZoneRack = false;
         }

         let InvCountActivateLineWithBin = this.moduleControl.find(x => x.ctrlName === "InvCountActivateLineWithBin");
         if (InvCountActivateLineWithBin && InvCountActivateLineWithBin.ctrlValue.toUpperCase() === "Y") {
            this.configInvCountActivateLineWithBin = true;
         } else {
            this.configInvCountActivateLineWithBin = false;
         }

         let InvCountHeaderShowBinDesc = this.moduleControl.find(x => x.ctrlName === "InvCountListingShowBinDesc");
         if (InvCountHeaderShowBinDesc && InvCountHeaderShowBinDesc.ctrlValue.toUpperCase() === "Y") {
            this.configHeaderShowBinDesc = true;
         } else {
            this.configHeaderShowBinDesc = false;
         }

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }

         let invCountBinFromLocation = this.moduleControl.find(x => x.ctrlName === "InvCountBinFromLocation");
         if (invCountBinFromLocation && invCountBinFromLocation.ctrlValue.toUpperCase() === "Y") {
            this.configInvCountBinFromLocation = true;
         } else {
            this.configInvCountBinFromLocation = false;
         }

         let mobileStockCountItemAlwaysCreateNewLine = this.moduleControl.find(x => x.ctrlName === "MobileStockCountItemAlwaysCreateNewLine");
         if (mobileStockCountItemAlwaysCreateNewLine && mobileStockCountItemAlwaysCreateNewLine.ctrlValue.toUpperCase() === "Y") {
            this.configMobileStockCountItemAlwaysCreateNewLine = true;
         } else {
            this.configMobileStockCountItemAlwaysCreateNewLine = false;
         }

         let mobileStockCountHideBinSelection = this.moduleControl.find(x => x.ctrlName === "MobileStockCountHideBinSelection");
         if (mobileStockCountHideBinSelection && mobileStockCountHideBinSelection.ctrlValue.toUpperCase() === "Y") {
            this.configMobileStockCountHideBinSelection = true;
         } else {
            this.configMobileStockCountHideBinSelection = false;
         }

         let mobileStockCountSlideToEdit = this.moduleControl.find(x => x.ctrlName === "MobileStockCountSlideToEdit");
         if (mobileStockCountSlideToEdit && mobileStockCountSlideToEdit.ctrlValue.toUpperCase() === "Y") {
            this.configMobileStockCountSlideToEdit = true;
         } else {
            this.configMobileStockCountSlideToEdit = false;
         }
      })
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   rackMasterList: MasterListDetails[] = [];
   zoneMasterList: MasterListDetails[] = [];
   itemBrandMasterList: MasterListDetails[] = [];
   itemGroupMasterList: MasterListDetails[] = [];
   itemCategoryMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemBrandMasterList = this.fullMasterList.filter(x => x.objectName === "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemGroupMasterList = this.fullMasterList.filter(x => x.objectName === "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemCategoryMasterList = this.fullMasterList.filter(x => x.objectName === "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.rackMasterList = this.fullMasterList.filter(x => x.objectName === "Rack").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.zoneMasterList = this.fullMasterList.filter(x => x.objectName === "Zone").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   objectHeader: StockCountHeader = null;
   setHeader(objectHeader: StockCountHeader) {
      this.objectHeader = objectHeader;
      console.log("🚀 ~ StockCountService ~ setHeader ~ this.objectHeader:", JSON.stringify(this.objectHeader))
   }

   objectDetail: StockCountDetail[] = []
   setLines(objectDetail: StockCountDetail[]) {
      this.objectDetail = objectDetail;
   }

   localObject: LocalTransaction;
   setLocalObject(localObject: LocalTransaction) {
      this.localObject = localObject;
   }

   objectBarcodeTag: BarcodeTag[] = [];
   setBarcodeTag(objectBarcodeTag: BarcodeTag[]) {
      this.objectBarcodeTag = objectBarcodeTag;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeDetail() {
      this.objectDetail = [];
   }

   removeLocalObject() {
      this.localObject = null;
   }

   removeBarcodeTag() {
      this.objectBarcodeTag = [];
   }

   async resetVariables() {
      this.removeHeader();
      this.removeDetail();
      this.removeBarcodeTag();
      this.removeLocalObject();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/masterList").toPromise();
   }

   getInventoryCountByDate(startDate, endDate) {
      return this.http.get<StockCount[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/listing/" + startDate + "/" + endDate);
   }

   getInventoryCountList() {
      return this.http.get<StockCountList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/iclist");
   }

   getInventoryCount(inventoryCountId: number) {
      return this.http.get<StockCountRoot>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/" + inventoryCountId);
   }

   getInventoryCountBatchByLocationId(locationId: number) {
      return this.http.get<InventoryCountBatchList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/batchlist/" + locationId);
   }

   getInventoryCountBatchCriteria(inventoryCountBatchId: number) {
      return this.http.get<InventoryCountBatchCriteria>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/batchRandomList/" + inventoryCountBatchId);
   }

   getItemInfoByBarcode(barcode: string) {
      return this.http.get<ItemBarcodeModel>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/itemByBarcode/" + barcode);
   }

   insertInventoryCount(inventoryCountRoot: StockCountRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
   }

   updateInventoryCount(inventoryCountRoot: StockCountRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
   }

   getBinListByLocationId(locationId: number) {
      return this.http.get<BinList[]>(this.configService.selected_sys_param.apiUrl + `MobileInventoryCount/binList/${locationId}`);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/jsonDebug", debugObject, httpObserveHeader);
   }

}
