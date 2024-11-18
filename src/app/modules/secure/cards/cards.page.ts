import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { AlertController, IonSearchbar, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LocalItemBarcode, LocalItemMaster, LocalMarginConfig } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { format } from 'date-fns';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { Sys_Parameter, Sys_ParameterJsonConfig } from 'src/app/shared/database/tables/tables';
import { LoginUser } from 'src/app/services/auth/login-user';

SwiperCore.use([Pagination]);

@Component({
   selector: 'app-cards',
   templateUrl: './cards.page.html',
   styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit, AfterContentChecked, ViewWillEnter {

   @ViewChild("swiper") swiper: SwiperComponent;

   // Swiper config
   config: SwiperOptions = {
      slidesPerView: 1,
      spaceBetween: 50,
      pagination: { clickable: false },
      allowTouchMove: true
   }

   last_sync_datetime: Date;

   companyInfo: any;
   loginName: string;
   loginEmail: string;
   userType: string;
   current_year: number = new Date().getFullYear();
   currentVersion: string;

   constructor(
      public dashboardService: DashboardService,
      public configService: ConfigService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController
   ) {
      this.currentVersion = environment.version;
   }

   ionViewWillEnter(): void {
      this.commonService.getCompanyProfile().subscribe(response => {
         this.companyInfo = response;
      }, error => {
         console.log(error);
      })
   }

   ngOnInit(): void {
      if (this.configService.loginUser.loginUserType === "B") {
         this.userType = "Base User";
      } else if (this.configService.loginUser.loginUserType === "C") {
         this.userType = "Consignment User";
      } else if (this.configService.loginUser.loginUserType === "P") {
         this.userType = "POS User";
      }
      this.authService.currentUserToken$.subscribe(obj => {
         let decodedToken = obj;
         if (decodedToken != null) {
            this.loginName = decodedToken.unique_name;
            this.loginEmail = decodedToken.email;
         }
      })
      this.loadMasterList();
   }

   ngAfterContentChecked(): void {
      if (this.swiper) {
         this.swiper.updateSwiper({});
      }
      this.last_sync_datetime = this.configService.selected_sys_param.lastDownloadAt;
   }

   procurementAgentMasterList: MasterListDetails[] = [];
   warehouseAgentMasterList: MasterListDetails[] = [];
   salesAgentMasterList: MasterListDetails[] = [];
   loadMasterList() {
      this.commonService.getAgentsMasterList().subscribe(response => {
         this.procurementAgentMasterList = response.filter(x => x.objectName == "ProcurementAgent" && x.details != null).flatMap(src => src.details);
         this.warehouseAgentMasterList = response.filter(x => x.objectName == "WarehouseAgent" && x.details != null).flatMap(src => src.details);
         this.salesAgentMasterList = response.filter(x => x.objectName == "SalesAgent" && x.details != null).flatMap(src => src.details);
      }, error => {
         console.error(error);
      })
   }

   // Sync
   async sync() {
      if (Capacitor.getPlatform() !== "web") {
         try {
            await this.loadingService.showLoading();
            if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length > 1) {
               if (this.configService.selected_location) {
                  let response = await this.commonService.syncInboundConsignment(this.configService.selected_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
                  let itemMaster: LocalItemMaster[] = response["itemMaster"];
                  let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
                  await this.configService.syncInboundData(itemMaster, itemBarcode);

                  this.configService.selected_location = this.configService.loginUser.locationId[0];
                  let response2 = await this.commonService.syncMarginConfig(this.configService.loginUser.locationId[0]);
                  let marginConfig: LocalMarginConfig[] = response2;
                  await this.configService.syncMarginConfig(marginConfig);
                  await this.loadingService.dismissLoading();
               } else {
                  await this.loadingService.dismissLoading();
                  this.toastService.presentToast("Control Error", "Please select location before sync", "top", "warning", 1000);
                  this.showLocationModal();
               }
            }
            else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 1) {
               // sync by location since only 1 location
               let response = await this.commonService.syncInboundConsignment(this.configService.loginUser.locationId[0], format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
               let itemMaster: LocalItemMaster[] = response["itemMaster"];
               let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
               await this.configService.syncInboundData(itemMaster, itemBarcode);

               this.configService.selected_location = this.configService.loginUser.locationId[0];
               let response2 = await this.commonService.syncMarginConfig(this.configService.loginUser.locationId[0]);
               let marginConfig: LocalMarginConfig[] = response2;
               await this.configService.syncMarginConfig(marginConfig);
               await this.loadingService.dismissLoading();
            } else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 0) {
               // show error if consignment user but no location set
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Control Error", "Location not set, please contact adminstrator", "top", "warning", 1000);
            } else {
               // download item master for other user
               let response = await this.commonService.syncInbound();
               let itemMaster: LocalItemMaster[] = response["itemMaster"];
               let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
               await this.configService.syncInboundData(itemMaster, itemBarcode);
               await this.loadingService.dismissLoading();
            }
         } catch (error) {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast(error.message, "", "top", "medium", 1000);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }
   }

   /* #region select location modal */

   selectLocationModal: boolean = false;
   @ViewChild("searchBar") searchBar: IonSearchbar;
   showLocationModal() {
      this.tempDropdownList = [];
      this.selectLocationModal = true;
      this.searchText = null;
      this.assignToTemp();
   }

   hideLocationModal() {
      this.selectLocationModal = false;
   }

   async setDefaultLocation(location: MasterListDetails) {
      this.configService.selected_location = location.id;
      this.hideLocationModal();
      if (Capacitor.getPlatform() !== "web") {
         try {
            await this.loadingService.showLoading("Downloading resources");
            let response = await this.commonService.syncInboundConsignment(this.configService.selected_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
            let itemMaster: LocalItemMaster[] = response["itemMaster"];
            let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
            await this.configService.syncInboundData(itemMaster, itemBarcode);

            // if (this.configService.loginUser.loginUserType === "C") {
            let response2 = await this.commonService.syncMarginConfig(this.configService.selected_location);
            let marginConfig: LocalMarginConfig[] = response2;
            await this.configService.syncMarginConfig(marginConfig);
            // }
            await this.loadingService.dismissLoading();
         } catch (e) {
            await this.loadingService.dismissLoading();
            console.error(e);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }
   }

   /* #endregion */

   localConfigModal: boolean = false;
   showLocalConfig() {
      this.localConfigModal = true;
   }

   hideLocalConfig() {
      this.localConfigModal = false;
   }

   getAvailableJsonConfig() {
      return (JSON.parse(this.configService.sys_parameter.find(r => r.apiUrl === this.configService.selected_sys_param.apiUrl)?.jsonConfig) as Sys_ParameterJsonConfig[]);
   }

   async addNewActivation() {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "New Activation?",
         subHeader: "You'll be signed out to do this!",
         buttons: [
            {
               text: "Sign-out",
               cssClass: "danger",
               handler: async () => {
                  this.authService.signOut(true);
               }
            },
            {
               text: "Cancel",
               role: "cancel",
               cssClass: "cancel"
            }
         ]
      });
      await alert.present();
   }

   switchCompanyModal: boolean = false;
   async switchCompany() {
      if (this.configService.sys_parameter && this.configService.sys_parameter.length > 1) {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Switch Company?",
            subHeader: "You'll be signed out after choosing company.",
            buttons: [
               {
                  text: "Proceed",
                  cssClass: "success",
                  handler: async () => {
                     this.showSwitchCompanyModal();
                  }
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "cancel"
               }
            ]
         });
         await alert.present();
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator.", "top", "danger", 1000);
      }
   }

   async signOut() {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Sign-out?",
         buttons: [
            {
               text: "Sign-out",
               cssClass: "danger",
               handler: async () => {
                  await this.authService.signOut();
                  await this.configService.signOut();
               }
            },
            {
               text: "Cancel",
               role: "cancel",
               cssClass: "cancel"
            }
         ]
      });
      await alert.present();
   }

   /* #region switch company */

   showSwitchCompanyModal() {
      this.switchCompanyModal = true;
   }

   hideSwitchCompanyModal() {
      this.switchCompanyModal = false;
   }

   getAvailableSysParameters() {
      return this.configService.sys_parameter.filter(r => r.apiUrl !== this.configService.selected_sys_param.apiUrl).filter(r => r.rememberMe && r.username && r.password);
   }

   async chooseCompany(rowData: Sys_Parameter) {
      await this.hideSwitchCompanyModal();
      await this.loadingService.showLoading();
      setTimeout(async () => {
         await this.authService.signOut(false, true);
         await this.configService.signOut();
         this.configService.selected_sys_param = rowData;
         (await this.authService.signIn({ loginUserType: null, userEmail: rowData.username, password: rowData.password })).subscribe(async response => {
            if (Capacitor.getPlatform() !== "web") {
               // sync item master and item barcode
               try {
                  // update current version to db
                  this.commonService.saveVersion().subscribe(response => {

                  }, async error => {
                     await this.loadingService.dismissLoading();
                     console.error(error);
                  })

                  this.configService.loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;

                  if (this.configService.loginUser.loginUserType === "C") {
                     if (this.configService.loginUser.locationId && this.configService.loginUser.locationId.length > 1) {
                        // for consignment user more than 1 location, go to dashboard and let user select then only sync
                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     }
                     else if (this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 1) {
                        // sync by location since only 1 location
                        this.configService.selected_location = this.configService.loginUser.locationId[0];
                        await this.loadingService.showLoading("Downloading resources", false);

                        let response = await this.commonService.syncInboundConsignment(this.configService.loginUser.locationId[0], format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
                        let itemMaster: LocalItemMaster[] = response["itemMaster"];
                        let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
                        await this.configService.syncInboundData(itemMaster, itemBarcode);

                        let response2 = await this.commonService.syncMarginConfig(this.configService.loginUser.locationId[0]);
                        let marginConfig: LocalMarginConfig[] = response2;
                        await this.configService.syncMarginConfig(marginConfig);

                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     } else {
                        // show error if consignment user but no location set, error shown in dashboard page
                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     }
                  } else if (this.configService.loginUser.loginUserType === "P") {
                     if (this.configService.loginUser.locationId && this.configService.loginUser.locationId.length > 1) {
                        // for consignment user more than 1 location, go to dashboard and let user select then only sync
                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     }
                     else if (this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 1) {
                        // sync by location since only 1 location
                        this.configService.selected_location = this.configService.loginUser.locationId[0];
                        await this.loadingService.showLoading("Downloading resources", false);

                        let response = await this.commonService.syncInboundConsignment(this.configService.loginUser.locationId[0], format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
                        let itemMaster: LocalItemMaster[] = response["itemMaster"];
                        let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
                        await this.configService.syncInboundData(itemMaster, itemBarcode);

                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     } else {
                        // show error if consignment user but no location set, error shown in dashboard page
                        await this.loadingService.dismissLoading();
                        await this.navController.navigateRoot("/dashboard");
                     }
                  } else { // for base user
                     await this.loadingService.showLoading("Downloading resources", false);
                     let response = await this.commonService.syncInbound();
                     let itemMaster: LocalItemMaster[] = response["itemMaster"];
                     let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
                     await this.configService.syncInboundData(itemMaster, itemBarcode);
                     await this.loadingService.dismissLoading();
                     await this.navController.navigateRoot("/dashboard");
                  }
               } catch (error) {
                  await this.loadingService.dismissLoading();
                  this.toastService.presentToast("", error.message, "top", "medium", 1000);
               } finally {
                  await this.loadingService.dismissLoading();
               }
            } else { // for web development
               this.configService.loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;
               if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length > 1) {
                  // for consignment user more than 1 location, go to dashboard and let user select then only sync
               }
               else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 1) {
                  this.configService.selected_location = this.configService.loginUser.locationId[0];
               } else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 0) {
                  // show error if consignment user but no location set
                  this.toastService.presentToast("", "Consignment Location not set", "top", "warning", 1000);
               } else {

               }
               await this.loadingService.dismissLoading();
               await this.navController.navigateRoot("/dashboard");
            }
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         });
      }, 100);
   }

   /* #endregion */

   /* #region location filter */

   searchText: string = "";
   async onKeyDown(event) {
      if (event.keyCode === 13) {
         await this.searchItem();
      }
   }

   tempDropdownList: MasterListDetails[] = [];
   searchItem() {
      this.tempDropdownList = []
      this.assignToTemp();
   }

   resetFilter() {
      this.searchText = "";
      this.tempDropdownList = [];
      this.assignToTemp();
   }

   assignToTemp() {
      if (this.searchText && this.searchText.length > 0) {
         this.tempDropdownList = [...this.tempDropdownList, ...this.dashboardService.locationMasterList.filter(r => r.code?.toLowerCase().includes(this.searchText.toLowerCase()) || r.description?.toLowerCase().includes(this.searchText.toLowerCase()))];
         if (this.tempDropdownList && this.tempDropdownList.length === 1) {
            this.setDefaultLocation(this.tempDropdownList[0]);
         }
      } else {
         this.tempDropdownList = [...this.tempDropdownList, ...this.dashboardService.locationMasterList];
      }
   }

   /* #endregion */
   
}
