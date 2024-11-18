import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { Customer } from '../models/customer';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Subscription } from 'rxjs';
import { CashDepositHeader, CashDepositRoot } from '../models/cash-deposit';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class CashDepositService {

   customers: Customer[] = [];

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
         await this.loadCustomer();
         await this.loadMasterList();
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
   paymentMethodMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   customerMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName == "PaymentMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName == "Customer").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.custSubscription = this.authService.customerMasterList$.subscribe(async obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            await this.authService.rebuildCustomerList();
         }
      })
      // attribute6 = locationId
   }

   async loadCustomer() {
      this.customers = await this.getCustomerList();
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
   }

   getObjects() {
      return this.http.get<CashDepositHeader[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit");
   }

   insertObject(object) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
   }

   updateObject(object) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
   }

   getObject(objectId: number) {
      return this.http.get<CashDepositRoot>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/" + objectId);
   }

   deleteObject(objectId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/" + objectId, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/deactivate/" + objectId, null, httpObserveHeader);
   }

   // upload file

   // update collection

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/customer").toPromise();
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/masterlist").toPromise();
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/slipUpload/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(fileId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/imageFile/" + fileId, { responseType: 'blob' });
   }

   deleteFile(fileId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/imageFile/" + fileId, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/jsonDebug", debugObject, httpObserveHeader);
   }

}
