import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController } from '@ionic/angular';
import { CodeInputComponent } from 'angular-code-input';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginRequest, LoginUser } from 'src/app/services/auth/login-user';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
   selector: 'app-user-relogin',
   templateUrl: './user-relogin.page.html',
   styleUrls: ['./user-relogin.page.scss'],
})
export class UserReloginPage implements OnInit {
   title: string = "Login";
   tokenExpiredBehavior: string;
   displayMode: number = 0; //0: Login, 1: Login Complete
   loginError: string = "";
   inputRequired: string = "";
   loginModel: LoginRequest = { userEmail: "", password: "", loginUserType: "B" };
   show2FaDialog: boolean = false;
   loginResponse: LoginUser;
   loginUser: LoginUser;
   currentLoginUser: LoginUser;
   @ViewChild("inputPassword") inputPasswordElement: IonInput;
   @ViewChild("codeInput2Fa") codeInput !: CodeInputComponent;

   constructor(
      private accountService: AuthService,
      private toastService: ToastService,
      private modalController: ModalController
   ) { }

   ngOnInit() {
      this.currentLoginUser = this.loginUser;
      const token = {
         accessToken: this.currentLoginUser?.token,
         refreshToken: this.currentLoginUser?.refreshToken
      }
      this.loginModel.userEmail = this.currentLoginUser.userEmail;
      this.tokenExpiredBehavior = this.currentLoginUser.tokenExpiredBehavior;
      if (this.tokenExpiredBehavior === "2") {
         this.accountService.refreshToken(token).subscribe(response => {
            this.accountService.buildAllObjects();
            this.displayMode = 1;
         }, error => {
            console.log(error);
            this.displayMode = 0;
            setTimeout(() => {
               this.inputPasswordElement.setFocus();
            }, 100);
         });
      } else {
         this.displayMode = 0;
         setTimeout(() => {
            this.inputPasswordElement.setFocus();
         }, 100);
      }
   }

   async login(append2Fa?: boolean, twoFactorAuthCode?: string) {
      this.inputRequired = "";
      if (this.loginModel.userEmail === "" || this.loginModel.password === "") {
         this.inputRequired = "Please login with your email & password"
      } else {
         if (append2Fa) {
            this.loginModel.twoFactorType = "authenticator";
            this.loginModel.twoFactorAuthCode = twoFactorAuthCode;
         }
         localStorage.removeItem("loginUser");
         (await this.accountService.signIn(this.loginModel)).subscribe(async response => {
            const loginUser: LoginUser = JSON.parse(localStorage.getItem("loginUser"));
            if (loginUser) {
               if (loginUser.loginUserGroupType === "API") {
                  this.toastService.presentToast("System Notification", "Login is not allowed.", "top", "danger", 2000);
               } else {
                  if (this.show2FaDialog) {
                     this.show2FaDialog = false;
                  } else {
                     try {
                        await this.modalController.dismiss(null, null, "userReloginModal");
                     } catch (error) {
                        console.error(error);
                     }
                  }
                  this.toastService.presentToast("Logged in successfully", "", "top", "success", 2000);
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
            //upon successful login, route to main page
         }, error => {
            console.log(error);
            this.loginError = error.error;
            this.loginModel.twoFactorType = null;
            this.loginModel.twoFactorAuthCode = null;
         })
      }
   }

   handleKeyUpLogin(e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         this.login();
      }
   }

   async on2FaDialogHide() {
      this.loginResponse = null;
      try {
         await this.modalController.dismiss(null, null, "userReloginModal");
      } catch (error) {
         console.error(error);
      }
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
      let findAuthenticator = this.loginResponse.options.find(x => x.type === "authenticator");
      if (findAuthenticator) {
         if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.qrCodeSetupImageUrl) {
            return findAuthenticator.setupInfo.qrCodeSetupImageUrl;
         } else {
            return null;
         }
      }
   }

   get2FAManualKey() {
      let findAuthenticator = this.loginResponse.options.find(x => x.type === "authenticator");
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
            this.toastService.presentToast("", "Copied to clipboard.", "top", "success", 1000);
         }).catch(e => console.log(e));
   }

   onCodeCompleted(event: any) {
      this.login(true, event);
   }

   closeRef() {
      this.modalController.dismiss();
   }

}
