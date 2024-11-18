import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransferConfirmationRoot } from '../models/inter-transfer';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class TransferConfirmationService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) {

      this.loadRequiredMaster();
   }

   async loadRequiredMaster() {
      await this.loadMasterList();
      await this.loadUserLocationIds();
   }

   /* #region store value */

   selectedObject: TransferConfirmationRoot;
   setSelectedObject(object: TransferConfirmationRoot) {
      this.selectedObject = JSON.parse(JSON.stringify(object));
   }

   getSelectedObject() {
      return this.selectedObject;
   }

   resetVariables() {
      this.clearSelectedObject();
   }

   clearSelectedObject() {
      this.selectedObject = null;
   }

   /* #endregion */

   fullMasterList: MasterList[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);
      await this.locationMasterList.sort((a, c) => { return a.description > c.description ? 1 : -1 });
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
   }

   userLocationIds: number[] = [];
   oriLocationMasterList: MasterListDetails[] = [];
   async loadUserLocationIds() {
      this.userLocationIds = await this.getUserLocationIds();
      let loginUser = JSON.parse(localStorage.getItem('loginUser'));
      if (loginUser.loginUserType === 'B') {
         this.oriLocationMasterList = this.locationMasterList;
      } else {
         this.oriLocationMasterList = this.locationMasterList.filter(r => this.userLocationIds.includes(r.id));
      }
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferConfirmation/masterlist").toPromise();
   }

   getUserLocationIds() {
      return this.http.get<number[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferConfirmation/userLocation").toPromise();
   }

   getPendingList(locationId: number) {
      return this.http.get<TransferConfirmationRoot[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferConfirmation/pending/" + locationId);
   }

   updateObject(object: TransferConfirmationRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferConfirmation", object, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferConfirmation/jsonDebug", debugObject, httpObserveHeader);
   }

}
