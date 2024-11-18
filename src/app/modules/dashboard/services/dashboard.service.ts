import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { Dashboard } from '../models/dashboard';
import { NotificationHistory } from '../models/notification-history';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class DashboardService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
   }

   fullMasterList: MasterList[] = [];
   locationMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "account/masterList").toPromise();
   }

   getDashboard() {
      return this.http.get<Dashboard>(this.configService.selected_sys_param.apiUrl + "account/mobileDashboard");
   }

   downloadFiles(fileId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "account/dashboard/file/" + fileId, { responseType: "blob" });
   }

   loadNotificationHistory() {
      return this.http.get<NotificationHistory[]>(this.configService.selected_sys_param.apiUrl + "account/notificationHistory");
   }

}
