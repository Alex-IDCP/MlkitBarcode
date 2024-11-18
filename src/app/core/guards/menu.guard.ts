import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuItemRoot } from 'src/app/services/auth/menu-item';
import { ToastService } from 'src/app/services/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class MenuGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return new Observable<boolean>(obs => {
      if (state.url != '/') {
        let stateUrlWithoutParam = state.url.split('?')[0];
        //Check routerLinkAccess based on target Url
        this.authService.menuModel$.subscribe(obj => {
          //If user is admin, allow to access report designer
          if (this.authService.isAdmin) {
            if (stateUrlWithoutParam == "/rp/report-designer") {
              obs.next(true);
            }
          }
          if (this.checkRouterLinkAccess(obj, stateUrlWithoutParam)) {
            obs.next(true);
          } else {
            //Check whether user is still logged in. If already logout, do not prompt unauthorized error
            if (!this.authService.isLoggedIn) {
              // this.messageService.add({ severity: 'error', summary: 'Unauthorized', detail: "Insufficient privileges to access." });
              console.log("Unauthorized to access:" + state.url)
            }
            obs.next(false);
          }
        })
      } else {
        //Always return true if user is to browse root '/'
        obs.next(true);
      }
    })
  }

  checkRouterLinkAccess(menuItem: MenuItemRoot[], stateUrl: string): boolean {
    let grantedAccess: boolean = false;
    //Check whether menuModel is available. If available, loop till the 3rd level to check whether granted routerLink is available
    if (menuItem) {
      menuItem.forEach(moduleMenu => {
        // if (moduleMenu.items) {
        //   moduleMenu.items.forEach(subModuleItem => {
        //     if (subModuleItem.items) {
        //       subModuleItem.items.forEach(appMenu => {
        //         if (appMenu.routerLink === stateUrl) {
        //           grantedAccess = true;
        //         }
        //       })
        //     }
        //   })
        // }
      })
    }
    //Skip checking for access to report viewer
    // if (stateUrl == "/rp/report-viewer") {
    //   grantedAccess = true;
    // }
    return grantedAccess;
  }

}
