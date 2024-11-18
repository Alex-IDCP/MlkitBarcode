import { Injectable, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, Subject, Subscription } from 'rxjs';
import { bufferDebounceTime } from './bufferDebounceTimeOperator';
import { concatMap, filter } from 'rxjs/operators';

interface ToastData {
   header: string,
   message: string,
   color: string,
   duration: number,
   icon: string,
}

@Injectable({
   providedIn: 'root'
})
export class ToastService { //implements OnDestroy {

   toastSubject: Subject<ToastData> = new Subject<ToastData>();

   groupedByDebounceSubscription: Subscription;
   debouncedSubscription: Subscription;

   constructor(
      private toastController: ToastController
   ) {
      this.toastSubject = new Subject<ToastData>();
      const toastObservable: Observable<ToastData> = this.toastSubject.asObservable();

      this.groupedByDebounceSubscription = toastObservable
         .pipe(
            bufferDebounceTime(50),
            filter(x => x.length > 0),
            concatMap(x => this.present({
               header: x[0].header,
               message: x.map(i => i.message).join("<br/><br/>"),
               duration: x[0].duration,
               color: x[0].color,
               icon: x[0].icon
            })),
         )
         .subscribe();
   }

   ngOnDestroy(): void {
      this.groupedByDebounceSubscription.unsubscribe();
   }

   // show(message: string, color: string = null, duration: number = 1000) {
   //   this.toastSubject.next({
   //     message,
   //     color,
   //     duration
   //   })
   // }

   async present(x: ToastData) {
      const toast = await this.toastController.create({
         header: x.header,
         message: x.message,
         duration: x.duration,
         position: "top",
         color: x.color,
         buttons: [
            {
               text: "Ok",
               role: "cancel"
            }
         ],
      });

      await toast.present();
      const t = await toast.onDidDismiss();
      return true;
   }

   async presentToast(header: string, message: string, position: any, color: string, duration: number, showSearchResult: boolean = false, icon?: string) {
      if (!icon) {
         switch (color) {
            case "success":
               icon = "checkmark-outline";
               break;
            case "medium":
            case "warning":
               icon = "information-circle-outline";
               break;
            case "danger":
               icon = "warning-outline";
               break;
         }
      }
      if (!showSearchResult && (header === "Search Complete" || message === "Search Complete")) {

      } else {
         this.toastSubject.next({
            header,
            message,
            duration,
            color,
            icon
         })
      }
   }

}