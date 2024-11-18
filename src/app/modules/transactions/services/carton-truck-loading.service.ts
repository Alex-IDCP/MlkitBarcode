import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { AuthService } from 'src/app/services/auth/auth.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';
import { CartonTruckLoadingDetail, CartonTruckLoadingHeader, CartonTruckLoadingList, CartonTruckLoadingRoot, TruckArrangementListForCTL, TruckArrangementRootForCTL } from '../models/carton-truck-loading';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class CartonTruckLoadingService {

   startDate: Date;
   endDate: Date

   fullMasterList: MasterList[] = [];
   vehicleMasterList: MasterListDetails[] = [];
   transportMasterList: MasterListDetails[] = [];
   transportAgentMasterList: MasterListDetails[] = [];

   truckArrangementType: MasterListDetails[] = [];

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
      private loadingService: LoadingService
   ) { }

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

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.vehicleMasterList = this.fullMasterList.filter(x => x.objectName === "Vehicle").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.transportMasterList = this.fullMasterList.filter(x => x.objectName === "Transport").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.transportAgentMasterList = this.fullMasterList.filter(x => x.objectName === "TransportAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   async loadStaticLov() {
      let ml = await this.getStaticLovList();
      this.truckArrangementType = ml.filter(x => x.objectName === "TruckArrangementType").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   /* #region  for insert */

   objectHeader: CartonTruckLoadingHeader;
   async setHeader(objectHeader: CartonTruckLoadingHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: CartonTruckLoadingDetail[] = [];
   setLine(objectDetail: CartonTruckLoadingDetail[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   objectTA: TruckArrangementRootForCTL;
   setTA(objectTA: TruckArrangementRootForCTL) {
      this.objectTA = objectTA;
   }

   object: CartonTruckLoadingRoot
   setObject(object: CartonTruckLoadingRoot) {
      this.object = object;
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
   }

   removeTA() {
      this.objectTA = null;
   }

   removeObject() {
      this.object = null;
   }

   resetVariables() {
      this.removeHeader();
      this.removeLine();
      this.removeTA();
      this.removeObject();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/masterlist", { context: background_load() }).toPromise();
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/staticLov", { context: background_load() }).toPromise();
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<CartonTruckLoadingList[]>(this.configService.selected_sys_param.apiUrl + `MobileCartonTruckLoading/listing/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<CartonTruckLoadingRoot>(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/" + objectId);
   }

   insertObject(object: CartonTruckLoadingRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading", object, httpObserveHeader);
   }

   updateObject(object: CartonTruckLoadingRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/deactivate/" + objectId, null, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/jsonDebug", debugObject, httpObserveHeader);
   }

   getPendingList() {
      return this.http.get<TruckArrangementListForCTL[]>(this.configService.selected_sys_param.apiUrl + "MobileCartonTruckLoading/pendingList");
   }

   getPendingObjectById(objectId: number) {
      return this.http.get<TruckArrangementRootForCTL>(this.configService.selected_sys_param.apiUrl + 'MobileCartonTruckLoading/truckArrangement/' + objectId);
   }

}
