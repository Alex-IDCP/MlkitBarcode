import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { InterTransferHeader, InterTransferList, InterTransferRoot } from '../models/inter-transfer';
import { MasterList } from 'src/app/shared/models/master-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemList } from 'src/app/shared/models/item-list';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class InterTransferService {

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) {

   }

   async loadRequiredMaster() {
      await this.loadModuleControl();
      await this.loadMasterList();
      await this.loadStaticLov();
      await this.loadUserLocationIds();
   }

   moduleControl: ModuleControl[] = [];
   configMobileScanItemContinuous: boolean = false;
   configTransferOutActivateContainerNum: boolean = false;
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
      })
   }

   fullMasterList: MasterList[] = [];
   locationMasterList: MasterListDetails[] = [];
   destLocationMasterList: MasterListDetails[] = [];
   shipMethodMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details);
      this.locationMasterList = this.locationMasterList.filter(r => r.attribute1 !== "B");
      this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName == "ShipMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);

      let loginUser = JSON.parse(localStorage.getItem("loginUser"));
      if (loginUser.loginUserType === "B") {
         this.destLocationMasterList = this.locationMasterList;
      } else if (loginUser.loginUserType === "C") {
         this.oriLocationMasterList = this.locationMasterList.filter(r => r.attribute1 === "C" || r.attribute1 === "W");
      } else {
         this.oriLocationMasterList = this.locationMasterList.filter(r => r.attribute1 === "O" || r.attribute1 === "W");
      }
   }

   fullStaticLovMasterList: MasterList[] = [];
   interTransferTypeMasterList: MasterListDetails[] = [];
   async loadStaticLov() {
      this.fullStaticLovMasterList = await this.getStaticLov();
      this.interTransferTypeMasterList = this.fullStaticLovMasterList.filter(x => x.objectName == "InterTransferType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0);
   }

   userLocationIds: number[] = [];
   oriLocationMasterList: MasterListDetails[] = [];
   async loadUserLocationIds() {
      this.userLocationIds = await this.getUserLocationIds();
      let loginUser = JSON.parse(localStorage.getItem("loginUser"));
      if (loginUser.loginUserType === "B") {
         this.oriLocationMasterList = this.locationMasterList;
      } else {
         this.oriLocationMasterList = this.locationMasterList.filter(r => this.userLocationIds.includes(r.id));
      }
   }

   /* #region hold object value */

   header: InterTransferHeader;
   itemInCart: TransactionDetail[] = [];
   setHeader(header: any) {
      this.header = header;
   }

   setChoosenItems(items: TransactionDetail[]) {
      this.itemInCart = JSON.parse(JSON.stringify(items));
      this.itemInCart.forEach(r => {
         r.locationId = this.header.locationId;
      })
   }

   removeHeader() {
      this.header = null;
   }

   removeItems() {
      this.itemInCart = [];
   }

   resetVariables() {
      this.removeHeader();
      this.removeItems();
   }

   /* #endregion */

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<InterTransferList[]>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/listing/" + dateStart + "/" + dateEnd);
   }

   getObjectById(objectId: number) {
      return this.http.get<InterTransferRoot>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/" + objectId);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/masterlist").toPromise();
   }

   getStaticLov() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/staticLov").toPromise();
   }

   getUserLocationIds() {
      return this.http.get<number[]>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/userLocation").toPromise();
   }

   getFullItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer/item/itemList", { context: background_load() });
   }

   insertObject(object: InterTransferRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInterTransfer", object, httpObserveHeader);
   }

}
