import { Component, OnInit } from '@angular/core';
import { InterTransferService } from '../../services/inter-transfer.service';
import { InterTransferList } from '../../models/inter-transfer';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { format } from 'date-fns';
import { FilterPage } from '../filter/filter.page';
import { NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-inter-transfer',
   templateUrl: './inter-transfer.page.html',
   styleUrls: ['./inter-transfer.page.scss'],
})
export class InterTransferPage implements OnInit, ViewWillEnter {

   startDate: Date = null;
   endDate: Date = null;

   objects: InterTransferList[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private authService: AuthService,
      private objectService: InterTransferService,
      private commonService: CommonService,
      private toastService: ToastService,
      private modalController: ModalController,
      private navController: NavController,
      private actionSheetController: ActionSheetController
   ) {
      // reload all masterlist whenever user enter listing
      this.objectService.loadRequiredMaster();
   }

   async ionViewWillEnter(): Promise<void> {
      if (!this.startDate) {
         this.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.endDate) {
         this.endDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
      this.loadObjects();
   }

   ngOnInit() {

   }

   loadMasterList() {

   }

   loadObjects() {
      if (this.startDate && this.endDate) {
         this.objectService.getObjectList(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
            this.resetFilteredObj();
         })
      } else {
         this.toastService.presentToast("Invalid Search", "Please Select Date Range.", "top", "danger", 1000);
      }
   }

   goToDetail(objectId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId
            }
         }
         this.navController.navigateForward("/transactions/inter-transfer/inter-transfer-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

   async addObject() {
      try {
         this.objectService.resetVariables();
         this.navController.navigateForward("/transactions/inter-transfer/inter-transfer-header");
      } catch (e) {
         console.error(e);
      }
   }

   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Inter Transfer",
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

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.startDate,
               endDate: this.endDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
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
   filteredObj: InterTransferList[] = [];
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
               r.interTransferNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationDescription?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationDescription?.toUpperCase().includes(searchText.toUpperCase())
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
