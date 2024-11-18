import { Component, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonPopover, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { environment } from 'src/environments/environment';
import { LoginRequest, LoginUser } from 'src/app/services/auth/login-user';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';
import { format } from 'date-fns';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { LocalItemBarcode, LocalItemMaster, LocalMarginConfig } from 'src/app/shared/models/pos-download';
import { Network } from '@capacitor/network';
import { CodeInputComponent } from 'angular-code-input';
import { Market } from '@ionic-native/market/ngx';
import { AppUpdate } from '@capawesome/capacitor-app-update';

@Component({
   selector: 'app-signin',
   templateUrl: './signin.page.html',
   styleUrls: ['./signin.page.scss'],
   providers: [Market]
})
export class SigninPage implements OnInit, ViewWillEnter, ViewDidEnter {

   loginModel: LoginRequest = { userEmail: "", password: "", loginUserType: "B" };

   current_year: number = new Date().getFullYear();
   currentVersion: string;

   signin_form: UntypedFormGroup;
   submit_attempt: boolean = false;

   rememberMe: boolean = false;

   show2FaDialog: boolean = false;
   loginResponse: LoginUser;
   @ViewChild("codeInput2Fa") codeInput !: CodeInputComponent;

   constructor(
      private authService: AuthService,
      private commonService: CommonService,
      public configService: ConfigService,
      private formBuilder: UntypedFormBuilder,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private differs: IterableDiffers,
      private market: Market
   ) {
      this.currentVersion = environment.version;
      this.newForm();
      Network.addListener("networkStatusChange", async status => {
         if (status.connected) {
            await this.loadCompanyNames();
         }
      })
   }

   newForm() {
      // Setup form
      this.signin_form = this.formBuilder.group({
         apiUrl: [this.configService.selected_sys_param ? this.configService.selected_sys_param.apiUrl : null, [Validators.required]],
         userEmail: [null, Validators.compose([Validators.email, Validators.required])],
         password: [null, Validators.compose([Validators.minLength(6), Validators.required])]
      });
   }

   async ionViewWillEnter(): Promise<void> {
      if ((await Network.getStatus()).connected) {
         await this.loadCompanyNames();
      }
   }

   async ionViewDidEnter(): Promise<void> {
      if (this.configService.selected_sys_param) {
         this.signin_form.patchValue({ apiUrl: this.configService.selected_sys_param.apiUrl });
      }

      if ((await Network.getStatus()).connected) {
         await this.openAppStore();
      }
   }

   async loadCompanyNames() {
      if (this.configService.sys_parameter && this.configService.sys_parameter.length > 0) {
         this.configService.sys_parameter.forEach(async r => {
            let companyName = await this.commonService.getCompanyProfileByUrl(r.apiUrl);
            r.companyName = companyName;
         })
      }
   }

   ngOnInit() {
      if (Capacitor.getPlatform() === "web") {
         // this.signin_form.get("userEmail").setValue("kccon@idcp.my");
         this.signin_form.get("userEmail").setValue("aychia@idcp.my");
         // this.signin_form.get("userEmail").setValue("kh@idcp.my");
         // this.signin_form.get("userEmail").setValue("testsupervisor@roncato.com.my");
         // this.signin_form.get("userEmail").setValue("john@idcp.my");
         // this.signin_form.get("userEmail").setValue("johncon@idcp.my");
         // this.signin_form.get("userEmail").setValue("aychiacon@idcp.my");
         // this.signin_form.get("userEmail").setValue("defney@idcp.my");
         // this.signin_form.get("userEmail").setValue("aychiapos@idcp.my");
         // this.signin_form.get("userEmail").setValue("hwsales12@prestar.com.my");
         // this.signin_form.get("userEmail").setValue("spv1@byford.com.my");
         // this.signin_form.get("userEmail").setValue("admin@idcp.my");
         // this.signin_form.get("userEmail").setValue("jwchin@prestar.com.my");
         // this.signin_form.get("userEmail").setValue("hwsales2@prestar.com.my");
         // this.signin_form.get("userEmail").setValue("spv1@byford.com.my");
         // this.signin_form.get("userEmail").setValue("admin@idcp.my");
         // this.signin_form.get("userEmail").setValue("cwyew@idcp.my");
         // this.signin_form.get("userEmail").setValue("wayne@idcp.my");
         // this.signin_form.get("userEmail").setValue("defneysup@idcp.my");
         // this.signin_form.get("userEmail").setValue("defneys@idcp.my");
         // this.signin_form.get("password").setValue("Live1234");
         // this.signin_form.get("password").setValue("Bmm@168spv01");
         this.signin_form.get("password").setValue("Dev8888");
         // this.signin_form.get("password").setValue("Supervisor@123");
         // this.signin_form.get("password").setValue("i@Dmin7026");
         // this.signin_form.get("password").setValue("c0nnecT#7026");
         // this.signin_form.get("password").setValue("c0nnecT@2024");
         // this.signin_form.get("password").setValue("c0nnecT=88-");
         // this.signin_form.get("password").setValue("Testing1234");
         // this.signin_form.get("password").setValue("String1234");
      } else {
         this.setSelectedParam();
      }
   }

   forgetPassword(event) {
      this.navController.navigateRoot("/forget-password")
   }

   setSelectedParam() {
      if (this.signin_form.controls.apiUrl.value) {
         this.configService.selected_sys_param = this.configService.sys_parameter.find(r => r.apiUrl === this.signin_form.controls.apiUrl.value);
         this.rememberMe = this.configService.selected_sys_param.rememberMe;
         if (this.rememberMe) {
            this.signin_form.get("userEmail").setValue(this.configService.selected_sys_param.username);
            this.signin_form.get("password").setValue(this.configService.selected_sys_param.password);
         } else {
            this.signin_form.get("userEmail").setValue(null);
            this.signin_form.get("password").setValue(null);
         }
      }
   }

   async deleteAlert() {
      if (this.configService.selected_sys_param) {
         try {
            const alert = await this.alertController.create({
               header: `Delete ${this.configService.selected_sys_param.companyName}?`,
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        if (this.configService.selected_sys_param) {
                           await this.configService.delete_Sys_Parameter();
                           await this.configService.load();
                           await this.signin_form.patchValue({ apiUrl: this.configService.selected_sys_param.apiUrl });
                           await this.setSelectedParam();
                        }
                     },
                  },
                  {
                     cssClass: "cancel",
                     text: "Cancel",
                     role: "cancel"
                  },
               ]
            });
            await alert.present();
         } catch (e) {
            console.error(e);
         }
      } else {
         this.toastService.presentToast("Please select Company", "", "top", "warning", 1000);
      }
   }

   // Sign in
   async signIn(append2Fa?: boolean, twoFactorAuthCode?: string) {
      try {
         this.configService.selected_sys_param = this.configService.sys_parameter.find(r => r.apiUrl === this.signin_form.controls.apiUrl.value);
         this.submit_attempt = true;
         await this.loadingService.showLoading();
         if (Capacitor.getPlatform() !== "web") {
            // localStorage.setItem("player_Id", await OneSignal.User.getOnesignalId())
         } else {
            // localStorage.setItem("player_Id", "6ce7134e-5a4b-426f-b89b-54de14e05eba");
         }
         // If email or password empty
         if (this.signin_form.value.email == "" || this.signin_form.value.password == "") {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Control Error", "Please input email and password", "top", "warning", 1000);
         } else {
            this.loginModel = this.signin_form.value;
            if (append2Fa) {
               this.loginModel.twoFactorType = "authenticator";
               this.loginModel.twoFactorAuthCode = twoFactorAuthCode;
            }
            localStorage.removeItem("loginUser");
            (await this.authService.signIn(this.loginModel)).subscribe(async response => {
               this.configService.loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;
               if (Capacitor.getPlatform() !== "web") {

                  /* #region update local db data */
                  this.configService.selected_sys_param.rememberMe = this.rememberMe;
                  if (this.rememberMe) {
                     this.configService.selected_sys_param.username = this.signin_form.controls.userEmail.value;
                     this.configService.selected_sys_param.password = this.signin_form.controls.password.value;
                  } else {
                     this.configService.selected_sys_param.username = "";
                     this.configService.selected_sys_param.password = "";
                  }
                  await this.configService.update_Sys_Parameter(this.configService.selected_sys_param);
                  /* #endregion */

                  if (this.configService.loginUser) {
                     if (this.configService.loginUser.loginUserGroupType === "API") {
                        this.toastService.presentToast("System Notification", "Login is not allowed.", "top", "danger", 2000);
                     } else {

                        await OneSignal.User.addEmail(this.configService.loginUser.userEmail);
                        this.show2FaDialog = false;

                        // sync item master and item barcode
                        try {
                           // update current version to db
                           this.commonService.saveVersion().subscribe(response => {

                           }, async error => {
                              await this.loadingService.dismissLoading();
                              console.error(error);
                           })

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
                           this.submit_attempt = false;
                           await this.loadingService.dismissLoading();
                           this.toastService.presentToast("", error.message, "top", "medium", 1000);
                        } finally {
                           this.submit_attempt = false;
                           await this.loadingService.dismissLoading();
                        }
                     }
                  } else {
                     this.loginResponse = response;
                     if (this.loginResponse.status === "2FA") {
                        this.show2FaDialog = true;
                     } else if (this.loginResponse.status === "IAC") {
                        this.toastService.presentToast("System Notification", "Invalid Authentication Code.", "top", "danger", 2000);
                        this.codeInput.focusOnField(5);
                        this.loginModel.twoFactorType = null;
                        this.loginModel.twoFactorAuthCode = null;
                     }
                     else {
                        this.loginModel.twoFactorType = null;
                        this.loginModel.twoFactorAuthCode = null;
                     }
                  }
               } else {
                  // for web development
                  if (this.configService.loginUser) {
                     if (this.configService.loginUser.loginUserGroupType === "API") {
                        this.toastService.presentToast("System Notification", "Login is not allowed.", "top", "danger", 2000);
                     } else {
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

                        this.show2FaDialog = false;

                        setTimeout(async () => {

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
                           this.submit_attempt = false;
                           await this.loadingService.dismissLoading();
                           await this.navController.navigateRoot("/dashboard");

                        }, 50);
                     }
                  } else {
                     this.loginResponse = response;
                     if (this.loginResponse.status === "2FA") {
                        this.show2FaDialog = true;
                     } else if (this.loginResponse.status === "IAC") {
                        this.toastService.presentToast("System Notification", "Invalid Authentication Code.", "top", "danger", 2000);
                        this.codeInput.focusOnField(5);
                        this.loginModel.twoFactorType = null;
                        this.loginModel.twoFactorAuthCode = null;
                     }
                     else {
                        this.loginModel.twoFactorType = null;
                        this.loginModel.twoFactorAuthCode = null;
                     }
                  }
               }
            }, async error => {
               this.submit_attempt = false;
               this.loginModel.twoFactorType = null;
               this.loginModel.twoFactorAuthCode = null;
               await this.loadingService.dismissLoading();
               console.error(error);
            });
         }
      } catch (error) {
         await this.loadingService.dismissLoading();
         this.loginModel.twoFactorType = null;
         this.loginModel.twoFactorAuthCode = null;
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #region more action */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   async addNewActivation() {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "New Activation?",
         buttons: [
            {
               text: "Ok",
               cssClass: "success",
               handler: async () => {
                  this.navController.navigateRoot("/welcome");
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

   /* #endregion */

   /* #region 2fa */

   on2FaDialogHide() {
      this.loginResponse = null;
   }

   isDisplayQrImage() {
      if (this.loginResponse) {
         let findAuthenticator = this.loginResponse.options.find(x => x.type === "authenticator");
         if (findAuthenticator) {
            if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.qrCodeSetupImageUrl) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   get2FAQrImage() {
      let findAuthenticator = this.loginResponse.options.find(x => x.type == 'authenticator');
      if (findAuthenticator) {
         if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.qrCodeSetupImageUrl) {
            return findAuthenticator.setupInfo.qrCodeSetupImageUrl;
         } else {
            return null;
         }
      }
   }

   get2FAManualKey() {
      let findAuthenticator = this.loginResponse.options.find(x => x.type == 'authenticator');
      if (findAuthenticator) {
         if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.manualEntryKey) {
            return findAuthenticator.setupInfo.manualEntryKey;
         } else {
            return null;
         }
      }
   }

   copyToClipboard(manualKey: string) {
      navigator.clipboard.writeText(manualKey)
         .then(() => {
            this.toastService.presentToast("Copied to clipboard.", "", "top", "success", 1000);
         }).catch(e => console.log(e));
   }

   onCodeCompleted(event: any) {
      this.signIn(true, event);
   }

   async openAppStore() {
      let id;
      if (Capacitor.getPlatform() === "android") {
         id = "io.ionic.idcp";
      } else if (Capacitor.getPlatform() === "ios") {
         id = "io.ionic.idcp";
      }
      let marketVersion = await getCurrentAppVersion();
      if (id) {
         if (marketVersion !== this.currentVersion) {
            const alert = await this.alertController.create({
               header: "Update Required!",
               message: "We have launched a new and improved version. Please update the app for better experience.",
               buttons: [
                  {
                     text: "Update Now",
                     cssClass: "success",
                     role: "confirm",
                     handler: () => {
                        this.market.open(id);
                     }
                  }
               ],
               backdropDismiss: true
            });
            await alert.present();
         }
      }
   }

   /* #endregion */

}

const getCurrentAppVersion = async () => {
   const result = await AppUpdate.getAppUpdateInfo();
   return result.currentVersionName;
   // if (Capacitor.getPlatform() === "android") {
   //    return result.currentVersionCode;
   // } else {
   //    return result.currentVersionName;
   // }
};