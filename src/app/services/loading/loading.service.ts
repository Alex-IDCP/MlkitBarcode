import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
   providedIn: 'root'
})
export class LoadingService {

   loading: HTMLIonLoadingElement;
   isShowing: boolean = false;

   constructor(
      public loadingController: LoadingController
   ) { }

   async showLoading(message: string = "Loading", backdropDismiss: boolean = true) {
      if (!this.isShowing && (this.loading === undefined || this.loading === null)) {
         this.isShowing = true;
         this.loading = await this.loadingController.create({
            cssClass: "default-loading",
            message: `${message}... Please be patient.`,
            spinner: "crescent",
            backdropDismiss: backdropDismiss
         });
         this.loading.present();
      } else {
         // If loader is showing, only change text, won't create a new loader.
         this.isShowing = true;
         this.loading = null;
         this.loading = await this.loadingController.create({
            cssClass: "default-loading",
            message: `${message}... Please be patient.`,
            spinner: "crescent",
            backdropDismiss: backdropDismiss
         });
         this.loading.present();
      }
   }

   dismissLoading() {
      this.isShowing = false;
      this.loading?.dismiss();
   }

}
