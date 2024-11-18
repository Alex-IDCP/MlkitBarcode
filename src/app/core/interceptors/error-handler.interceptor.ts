import { Injectable } from '@angular/core';
import {
   HttpRequest,
   HttpHandler,
   HttpEvent,
   HttpInterceptor,
   HttpContextToken,
   HttpContext
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoginUser } from 'src/app/services/auth/login-user';
import { UserReloginPage } from 'src/app/shared/pages/user-relogin/user-relogin.page';

const BACKGROUND_LOAD = new HttpContextToken<boolean>(() => false);

export function background_load() {
   return new HttpContext().set(BACKGROUND_LOAD, true);
}

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

   constructor(
      private toastService: ToastService,
      private navController: NavController,
      private modalController: ModalController,
      private activatedRoute: ActivatedRoute
   ) { }

   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      if (request.headers.get('skip')) {
         const authReq = request.clone({
            headers: request.headers.delete('skip')
         });
         return next.handle(authReq);
      }
      // static ɵcmp: i0.ɵɵComponentDeclaration<NgxSpinnerComponent, "ngx-spinner", never, { "bdColor": "bdColor"; "size": "size"; "color": "color"; "type": "type"; "fullScreen": "fullScreen"; "name": "name"; "zIndex": "zIndex"; "template": "template"; "showSpinner": "showSpinner"; "disableAnimation": "disableAnimation"; }, {}, never, ["*"]>;

      const authToken = 'Bearer ' + JSON.parse(localStorage.getItem('loginUser'))?.token
      const overrideAuthToken = request.headers.get('Authorization');
      const authReq = request.clone({
         headers: request.headers.set('Authorization', overrideAuthToken ? overrideAuthToken : authToken)
      });

      //Display spinner after 0.3seconds
      let finished = false;

      //Check Http request context, if background load set to true, do not display spinner
      if (request.context.get(BACKGROUND_LOAD)) {
         finished = true;
      }

      setTimeout(() => {
         if (!finished) {

         }
      }, 800);

      return next.handle(authReq).pipe(
         catchError(error => {
            if (error) {
               switch (error.status) {
                  case 400:
                     if (error.error) {
                        const modalStateErrors = [];
                        for (const key in error.error) {
                           if (error.error[key]) {
                              modalStateErrors.push(error.error[key])
                           }
                        }
                        throw modalStateErrors.flat();

                     } else {
                        this.toastService.presentToast("Bad request error", error.status + ':' + error.statusText, "top", "danger", 2000);
                     }
                     break;
                  case 401:
                     if (error.error && error.error.code) {
                        let errorCode = error.error.code;
                        let errorPrompt: string;
                        if (error.error.description) {
                           errorPrompt = error.error.description;
                        } else {
                           errorPrompt = "Error 401";
                        }
                        switch (errorCode) {
                           case "TokenExpired":
                              this.promptUserRelogin(errorPrompt);
                              break;
                           case "RefreshTokenExpired":
                              this.promptUserRelogin(errorPrompt);
                              break;
                           case "TokenRevoked":
                              this.toastService.presentToast("Token Revoked", errorPrompt, "top", "danger", 2000);
                              localStorage.removeItem("loginUser");
                              this.navController.navigateRoot("/login");
                              break;
                           case "InvalidToken":
                              this.toastService.presentToast("Invalid Token", errorPrompt, "top", "danger", 2000);
                              break;
                           default:
                              this.toastService.presentToast("Unauthorised", errorPrompt, "top", "danger", 2000);
                              break;
                        }
                     } else {
                        if (error.error) {
                           this.toastService.presentToast("Unauthorised", error.error, "top", "danger", 2000);
                        } else {
                           this.toastService.presentToast("Unauthorised", "Error 401", "top", "danger", 2000);
                        }
                     }
                     break;
                  case 404:
                     this.toastService.presentToast("No result", "Resources not found.", "top", "danger", 2000);
                     break;
                  case 405:
                     this.toastService.presentToast("Method Not Allowed", "API function not implemented.", "top", "danger", 2000);
                     break;
                  case 500:
                     this.toastService.presentToast("Internal server error 500", error.error.message, "top", "danger", 2000);
                     break;
                  case 503:
                     this.toastService.presentToast("System Validation", error.error.message, "top", "danger", 2000);
                     break;
                  default:
                     this.toastService.presentToast("Something went wrong", "", "top", "danger", 2000);
                     console.log(error);
                     break;
               }
            }
            return throwError(error);
         }),
         //Clear spinner
         finalize(() => {
            finished = true;
         })
      );
   }

   async promptUserRelogin(errorPrompt: string) {
      if (this.activatedRoute.snapshot["_routerState"].url == "/login") {
         this.toastService.presentToast("Token Expired", errorPrompt, "top", "danger", 2000);
         if ((await this.modalController.getTop()) && (await this.modalController.getTop()).id.includes("userReloginModal")) {
            this.modalController.dismiss();
         }
      } else {
         const loginUser: LoginUser = JSON.parse(localStorage.getItem("loginUser"));
         if (loginUser) {
            if (loginUser.tokenExpiredBehavior === "1" || loginUser.tokenExpiredBehavior === "2") {
               if (!(await this.modalController.getTop()) || ((await this.modalController.getTop()) && !(await this.modalController.getTop()).id.includes("userReloginModal"))) {
                  const modal = await this.modalController.create({
                     id: "userReloginModal",
                     component: UserReloginPage,
                     cssClass: "ion-custom-modal",
                     componentProps: {
                        title: "Login Expired",
                        loginUser: loginUser
                     },
                     backdropDismiss: false,
                     animated: false
                  });

                  await modal.present();
               }
            } else {
               this.toastService.presentToast("Token Expired", errorPrompt, "top", "danger", 2000);
            }
         } else {
            this.toastService.presentToast("Unauthorised", errorPrompt, "top", "danger", 2000);
         }
      }
   }

}
