import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { ModalController } from '@ionic/angular';

@Injectable({
   providedIn: 'root',
})
export class AuthGuard implements CanActivate {

   constructor(
      private readonly authService: AuthService,
      private readonly modalController: ModalController,
      private readonly router: Router
   ) { }

   canActivate(): Observable<boolean> {
      if (this.authService.isTokenExpired()) {
         const token = {
            accessToken: JSON.parse(localStorage.getItem('loginUser'))?.token,
            refreshToken: JSON.parse(localStorage.getItem('loginUser'))?.refreshToken
         }
         //Define Observable<boolean> to return to method canActivate
         return new Observable<boolean>(obs => {
            if (!token.accessToken || !token.refreshToken) {               
               this.router.navigateByUrl("/signin");
               obs.next(false);
            } else {
               this.authService.refreshToken(token).subscribe(response => {
                  console.log("Refresh token acquired");
                  this.authService.buildAllObjects();
                  obs.next(true);
               }, error => {
                  console.log(error);
                  this.authService.signOut();
                  obs.next(true);
               });
            }
         })
      } else {
         return this.authService.currentUser$.pipe(
            map(loginUser => {
               if (loginUser) {
                  return true;
               }
            })
         )
      }
   }

}