import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CashDepositService } from '../../services/cash-deposit.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { CashDepositHeader } from '../../models/cash-deposit';

@Component({
   selector: 'app-cash-deposit',
   templateUrl: './cash-deposit.page.html',
   styleUrls: ['./cash-deposit.page.scss'],
})
export class CashDepositPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidLeave {

   objects: CashDepositHeader[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private authService: AuthService,
      private objectService: CashDepositService,
      private commonService: CommonService,
      private toastService: ToastService,
      private actionSheetController: ActionSheetController,
      private navController: NavController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      await this.loadObjects();
   }

   async ionViewDidLeave(): Promise<void> {
      await this.objectService.stopListening();
   }

   ngOnInit() {

   }

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   loadObjects() {
      try {
         this.objectService.getObjects().subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  add object */

   async addObject() {
      this.navController.navigateForward("/transactions/cash-deposit/cash-deposit-add");
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Cash Deposit",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   goToDetail(objectId: number) {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: objectId
         }
      }
      this.navController.navigateForward("/transactions/cash-deposit/cash-deposit-detail", navigationExtras);
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: CashDepositHeader[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r =>
               r.posCashDepositNum?.toUpperCase().includes(searchText.toUpperCase())
            )));
            this.currentPage = 1;
         } else {
            this.resetFilteredObj();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objects));
      this.filteredObj = this.filteredObj.sort((a, b) => new Date(b.trxDate).getTime() - new Date(a.trxDate).getTime());
   }

}
