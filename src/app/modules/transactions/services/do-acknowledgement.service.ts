import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { DOAcknowledegementRequest, DoAcknowledgement } from '../models/do-acknowledgement';
import { LoadingService } from 'src/app/services/loading/loading.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class DoAcknowledgementService {

   fullMasterList: MasterList[] = [];
   vehicleMasterList: MasterListDetails[] = [];
   // customerMasterList: MasterListDetails[] = [];

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService,
      private loadingService: LoadingService
   ) { }

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
   }

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.vehicleMasterList = this.fullMasterList.filter(x => x.objectName === "Vehicle").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/masterlist", { context: background_load() }).toPromise();
   }

   loadObjects(request: DOAcknowledegementRequest) {
      return this.http.post<DoAcknowledgement[]>(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/listing", request, httpObserveHeader);
   }

   getSignature(fileId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/signatureDownload/" + fileId, { responseType: 'blob' });
   }

   postFile(formData: FormData, objectId: number, fileId: number, customObj?: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/signatureUpload/" + objectId + '/' + fileId, formData);
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(keyId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/downloadFile/" + keyId, { responseType: "blob" });
   }

}
