import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtPayload, jwtDecode } from "jwt-decode";
import { ConfigService } from '../config/config.service';
import { CustomToken, ForgotPasswordRequest, LoginRequest, LoginUser, ResetPassword, TokenRequest } from './login-user';
import { NavController } from '@ionic/angular';
import { MenuHierarchy } from './menu-hierarchy';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { MenuItem, MenuItemRoot } from './menu-item';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { RestrictedColumn } from 'src/app/shared/models/restricted-column';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { MasterList } from 'src/app/shared/models/master-list';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class AuthService {

   isDebug: string = "False";
   isLoggedIn: boolean = false;
   isAdmin: boolean = false;
   showSearchResult: boolean = false;
   restrictedColumn: RestrictedColumn[];
   moduleControlConfig: ModuleControl[];
   masterDefinedGroup: MasterList[];
   model: MenuItem[];
   precisionList: PrecisionList[];

   hideFooter: boolean = false;

   configExtracted: boolean;
   systemWideGetCustomerUponLogin: boolean = false;
   customerMasterList: MasterListDetails[];

   // dashboardItem: MenuItem;

   // 1 is the size of buffer
   private currentUserSource = new ReplaySubject<LoginUser>(1);
   currentUser$ = this.currentUserSource.asObservable();

   private currentUserTokenSource = new ReplaySubject<CustomToken>(1);
   currentUserToken$ = this.currentUserTokenSource.asObservable();

   // Create menuItemSubject to observe from value of HTTP Get for MenuHierarchy
   private menuItemSubject = new ReplaySubject<MenuItemRoot[]>(1);
   menuModel$ = this.menuItemSubject.asObservable();

   //Create restrictedColumnSubject to observe from value of HTTP Get for RestrictedColumn
   private restrictedColumnSubject = new ReplaySubject<any[]>(1);
   restrictedColumn$ = this.restrictedColumnSubject.asObservable();

   // Create moduleControlSubject to observe from value of HTTP Get for frontEndModuleControl
   private moduleControlSubject = new ReplaySubject<ModuleControl[]>(1);
   moduleControlConfig$ = this.moduleControlSubject.asObservable();

   //Create masterDefinedGroupSubject to observe from value of HTTP Get for User Defined Group
   private masterDefinedGroupSubject = new ReplaySubject<MasterList[]>(1);
   masterDefinedGroup$ = this.masterDefinedGroupSubject.asObservable();

   // Create precisionListSubject to observe from value of HTTP Get for Precision Config
   private precisionListSubject = new ReplaySubject<PrecisionList[]>(1);
   precisionList$ = this.precisionListSubject.asObservable();

   private customerMasterListSubject = new ReplaySubject<MasterListDetails[]>(1);
   customerMasterList$ = this.customerMasterListSubject.asObservable();

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private navController: NavController,
      private ngZone: NgZone
   ) {
      if (Capacitor.getPlatform() === "web") {
         
      } else {
         Keyboard.addListener("keyboardWillShow", () => {
            console.log("keyboardWillShow");
            this.ngZone.run(() => {
               this.hideFooter = true;
            })
         })
         Keyboard.addListener("keyboardWillHide", () => {
            console.log("keyboardWillHide");
            this.ngZone.run(() => {
               this.hideFooter = false;
            })
         })
      }
      
      if (!this.isTokenExpired()) {
         if (this.configService.selected_sys_param && this.configService.loginUser) {
            this.buildAllObjects(true);
         }
         this.customerMasterListSubject.next(null);
      }
   }

   // Sign in
   async signIn(loginModel: LoginRequest) {
      // return this.http.post(this.configService.selected_sys_param.apiUrl + "account/login?testmode=ShortLifeToken,ShortLifeRefreshToken", loginModel).pipe(
      return this.http.post(this.configService.selected_sys_param.apiUrl + "account/login", loginModel).pipe(
         map((response: LoginUser) => {
            const loginUser = response;
            if (!(loginUser.token === null || loginUser.token === undefined)) {
               localStorage.setItem("loginUser", JSON.stringify(loginUser));
               this.currentUserSource.next(loginUser);
               this.setCurrentUserToken(loginUser.token);
               this.buildAllObjects();
               this.setDebugMode(loginUser.token);
               this.isLoggedIn = true;
               this.checkAdminRights(loginUser.token);
               // this.updatePlayerId(loginUser);
            } else {
               return response;
            }
         })
      )
   }

   // updatePlayerId(loginUser: LoginUser) {
   //    let user = this.getDecodedToken(loginUser.token);
   //    if (loginUser.playerId !== localStorage.getItem("player_Id")) {
   //       this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDownload/playerId/" + Number(user.nameid) + "/" + localStorage.getItem("player_Id"), httpObserveHeader).subscribe(response => {
   //       }, error => {
   //          console.log(error);
   //       });
   //    }
   // }

   refreshToken(tokenRequest: TokenRequest) {
      // return this.http.post(this.configService.selected_sys_param.apiUrl + "account/refreshToken?testmode=ShortLifeToken,ShortLifeRefreshToken", tokenRequest).pipe(
      return this.http.post(this.configService.selected_sys_param.apiUrl + "account/refreshToken", tokenRequest).pipe(
         map((response: LoginUser) => {
            const loginUser = response;
            if (loginUser.token != null) {
               localStorage.setItem("loginUser", JSON.stringify(loginUser));
               this.currentUserSource.next(loginUser);
               this.setCurrentUserToken(loginUser.token);
               this.isLoggedIn = true;
               this.checkAdminRights(loginUser.token);
            }
         })
      )
   }

   setCurrentUserToken(token: string) {
      let decodedToken = this.getDecodedToken(JSON.stringify(token));
      this.currentUserTokenSource.next(decodedToken);
      this.isLoggedIn = true;
   }

   getDecodedToken(token: string) {
      const decoded = jwtDecode<CustomToken>(token);
      return decoded;
   }

   setDebugMode(token: string) {
      const decoded = jwtDecode<CustomToken>(token);
      //After decode, assign debug mode variable
      this.isDebug = decoded.debug_mode;
   }

   checkAdminRights(token: string) {
      const decoded = jwtDecode<CustomToken>(token);
      if (decoded.role == "Admin") {
         this.isAdmin = true;
      }
   }

   buildAllObjects(skipRetrieve?: boolean) {
      this.buildMenuModel();
      this.buildRestrictColumnsObject();
      this.buildModuleControlObject(skipRetrieve);
      this.buildMasterDefinedGroup();
      this.buildPrecisionList();
   }

   buildMasterDefinedGroup() {
      this.getMasterDefinedGroup().subscribe(response => {
         this.masterDefinedGroup = response;
         this.setMasterDefinedGroup(this.masterDefinedGroup);
      });
   }

   async buildMasterList(skipRetrieve?: boolean) {
      if (!skipRetrieve) {
         try {
            this.getMasterList().subscribe(async response => {
               let masterList = response;
               this.customerMasterList = masterList.filter(x => x.objectName === "Customer").flatMap(src => src.details);
               this.setCustomerMasterList(this.customerMasterList);
            }, async error => {
               console.error(JSON.stringify(error));
            });
         } catch (error) {
            console.error(JSON.stringify(error));
         } finally {
            
         }
      }
   }

   buildMenuModel() {
      this.getMenuHierachy().subscribe(response => {
         this.model = response;
         // Manually add dashboard item and move it to the beginning of array
         // this.dashboardItem = { label: "Dashboard", icon: "pi pi-home", routerLink: ["/"], tabindex: "1" };
         // this.model.push(this.dashboardItem);
         // Only display menu which is not under Mobile Apps Module
         this.model = this.model.filter(x => x.fragment === "M");
         this.model = this.model.sort((a, b) => Number(a.tabindex) - Number(b.tabindex));
         this.setMenuHierarchy(this.model);
      }, error => {
         console.error(JSON.stringify(error));
      });
   }

   buildRestrictColumnsObject() {
      this.getRestrictedColumn().subscribe(response => {
         this.restrictedColumn = response;
         this.setRestrictedColumn(this.restrictedColumn);
      });
   }

   buildModuleControlObject(skipRetrieve?: boolean) {
      this.getModuleControl().subscribe(response => {
         this.configExtracted = true;
         this.moduleControlConfig = response;
         this.setModuleControl(this.moduleControlConfig);
         let getCustomerList = this.moduleControlConfig.find(x => x.ctrlName === "SystemWideGetCustomerUponLogin");
         if (getCustomerList && getCustomerList.ctrlValue.toUpperCase() === "Y") {
            this.systemWideGetCustomerUponLogin = true;
            this.buildMasterList(skipRetrieve);
         } else {
            this.systemWideGetCustomerUponLogin = false;
         }
      });
   }

   rebuildCustomerList() {
      if (!this.configExtracted) {
         this.buildModuleControlObject();
      } else {
         if (this.systemWideGetCustomerUponLogin) {
            this.buildMasterList();
         }
      }
   }

   buildPrecisionList() {
      this.getPrecisionList().subscribe(response => {
         this.precisionList = response;
         this.setPrecisionList(this.precisionList);
      });
   }

   getMenuHierachy() {
      return this.http.get<MenuHierarchy[]>(this.configService.selected_sys_param.apiUrl + "account/menu").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      )
   }

   setMenuHierarchy(item: any) {
      this.menuItemSubject.next(item);
   }

   getRestrictedColumn() {
      return this.http.get<RestrictedColumn[]>(this.configService.selected_sys_param.apiUrl + "account/restrictedColumns").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      )
   }

   setRestrictedColumn(item: any) {
      this.restrictedColumnSubject.next(item);
   }

   getModuleControl() {
      return this.http.get<ModuleControl[]>(this.configService.selected_sys_param.apiUrl + "account/frontEndModuleControl").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      )
   }

   setModuleControl(item: any) {
      this.moduleControlSubject.next(item);
      let showSearchResult = item.find(x => x.ctrlName === "ShowSearchResult");
      if (showSearchResult) {
         this.showSearchResult = (showSearchResult.ctrlValue === "0") ? false : true;
      }
   }

   getPrecisionList() {
      return this.http.get<PrecisionList[]>(this.configService.selected_sys_param.apiUrl + "account/precision");
   }

   setPrecisionList(item: any) {
      this.precisionListSubject.next(item);
   }

   getMasterDefinedGroup() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "account/masterDefinedGroup").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      )
   }

   setMasterDefinedGroup(item: any) {
      this.masterDefinedGroupSubject.next(item);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "account/customerlist");
   }

   setCustomerMasterList(item: any) {
      this.customerMasterListSubject.next(item);
   }

   isTokenExpired(token?: string): boolean {
      if (!token) token = this.getToken();
      if (!token) return true;

      const tokenExpiryDate = this.getTokenExpirationDate(token);
      if (tokenExpiryDate === undefined) return true;
      return !(tokenExpiryDate.valueOf() > new Date().valueOf());
   }

   getToken(): string {
      return JSON.parse(localStorage.getItem("loginUser"))?.token;
   }

   getTokenExpirationDate(token: string): Date {
      const decoded: JwtPayload = jwtDecode(token);
      if (decoded.exp === undefined) return null;

      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date;
   }

   // Sign out
   async signOut(isAddNew: boolean = false, isSwitchCompany: boolean = false) {
      localStorage.removeItem("loginUser");
      this.currentUserSource.next(null);
      this.currentUserTokenSource.next(null);
      this.menuItemSubject.next(null);
      this.precisionListSubject.next(null);
      this.configExtracted = false;
      this.customerMasterListSubject.next(null);
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.configService.loginUser = null;
      if (isAddNew) {
         this.navController.navigateRoot("/welcome");
      } else {
         if (!isSwitchCompany) {
            this.navController.navigateRoot("/signin");
         }
      }
   }

   getCompanyName() {
      return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "account/companyInfo");
   }

   forgotPassword(passwordResetRequest: ForgotPasswordRequest) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "account/forgotPassword", passwordResetRequest, httpObserveHeader);
   }

   resetPassword(passwordResetDto: ResetPassword) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "account/resetPassword", passwordResetDto, httpObserveHeader);
   }

}