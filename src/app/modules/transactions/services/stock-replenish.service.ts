import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { format } from "date-fns";
import { ConfigService } from "src/app/services/config/config.service";
import { DraftTransaction } from "src/app/shared/models/draft-transaction";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { PromotionMaster } from "src/app/shared/models/promotion-engine";
import { SalesSearchModal } from "src/app/shared/models/sales-search-modal";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { SalesOrderHeader, SalesOrderRoot, SalesOrderList } from "../models/sales-order";
import { AuthService } from "src/app/services/auth/auth.service";
import { LoadingService } from "src/app/services/loading/loading.service";
import { Subscription } from "rxjs";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class StockReplenishService {

   promotionMaster: PromotionMaster[] = [];

   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];
   discountGroupMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   shipMethodMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   areaMasterList: MasterListDetails[] = [];
   currencyMasterList: MasterListDetails[] = [];
   salesAgentMasterList: MasterListDetails[] = [];

   // customers: Customer[] = [];

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

   async loadRequiredMaster() {
      try {
         await this.loadingService.showLoading();
         await this.loadMasterList();
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
      //   await this.loadCustomer();
   }

   custSubscription: Subscription;
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName == "Customer").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName == "DiscountGroup").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName == "ShipMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details);
      this.locationMasterList = this.locationMasterList.filter(r => r.attribute1 === "O" && (r.attribute2 && Number(r.attribute2) > 0));
      this.areaMasterList = this.fullMasterList.filter(x => x.objectName == "Area").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.currencyMasterList = this.fullMasterList.filter(x => x.objectName == "Currency").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName == "SalesAgent").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
      this.bindSalesAgentList();
   }

   // async loadCustomer() {
   //   this.customers = await this.getCustomerList();
   //   await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
   //   this.bindCustomerList();
   // }

   // customerSearchDropdownList: SearchDropdownList[] = [];
   // bindCustomerList() {
   //   this.customerSearchDropdownList = [];
   //   this.customers.forEach(r => {
   //     this.customerSearchDropdownList.push({
   //       id: r.customerId,
   //       code: r.customerCode,
   //       oldCode: r.oldCustomerCode,
   //       description: r.name
   //     })
   //   })
   // }

   salesAgentDropdownList: SearchDropdownList[] = [];
   bindSalesAgentList() {
      this.salesAgentMasterList.forEach(r => {
         this.salesAgentDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      })
   }

   /* #region  for insert */

   header: SalesOrderHeader;
   itemInCart: TransactionDetail[] = [];
   object: SalesOrderRoot;
   async setHeader(header: SalesOrderHeader) {
      this.header = header;
      // load promotion first after customer confirmed or whenever header changed.
      this.promotionMaster = await this.getPromotion(format(new Date(this.header.trxDate), "yyyy-MM-dd"), this.header.customerId);
   }

   setChoosenItems(items: TransactionDetail[]) {
      this.itemInCart = JSON.parse(JSON.stringify(items));
   }

   setObject(object: SalesOrderRoot) {
      this.object = object;
   }

   isDraft: boolean = false;
   draftObject: DraftTransaction;
   setDraftObject(draftObject: DraftTransaction) {
      this.isDraft = true;
      this.draftObject = draftObject;
   }

   removeCustomer() {
      this.header = null;
   }

   removeItems() {
      this.itemInCart = [];
   }

   removeObject() {
      this.object = null;
   }

   removeDraftObject() {
      this.isDraft = false;
      this.draftObject = null;
   }

   resetVariables() {
      this.removeCustomer();
      this.removeItems();
      this.removeObject();
      this.removeDraftObject();
   }

   hasSalesAgent(): boolean {
      let salesAgentId = JSON.parse(localStorage.getItem("loginUser"))?.salesAgentId;
      if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
         return false;
      }
      return true
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/masterlist").toPromise();
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/staticLov");
   }

   getPromotion(trxDate: string, customerId: number) {
      return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/promotion/" + trxDate + "/" + customerId).toPromise();
   }

   getObjectListByDate(searchObject: SalesSearchModal) {
      return this.http.post<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/listing", searchObject);
   }

   getObjectById(objectId: number) {
      return this.http.get<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/" + objectId);
   }

   insertObject(object: SalesOrderRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish", object, httpObserveHeader);
   }

   updateObject(object: SalesOrderRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/deactivate/" + objectId, null, httpObserveHeader);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReplenish/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

}
