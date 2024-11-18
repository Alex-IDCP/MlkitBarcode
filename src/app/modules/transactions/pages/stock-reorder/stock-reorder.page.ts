import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockReorderList } from '../../models/stock-reorder';
import { StockReorderService } from '../../services/stock-reorder.service';
import { FilterPage } from '../filter/filter.page';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-stock-reorder',
   templateUrl: './stock-reorder.page.html',
   styleUrls: ['./stock-reorder.page.scss'],
})
export class StockReorderPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

   private objectDiffer: any;
   objects: StockReorderList[] = [];

   startDate: Date;
   endDate: Date;
   customerIds: number[] = [];
   salesAgentIds: number[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private authService: AuthService,
      private commonService: CommonService,
      public objectService: StockReorderService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController,
      private toastService: ToastService,
      private differs: IterableDiffers
   ) {
      this.objectDiffer = this.differs.find(this.objects).create();
   }

   ngDoCheck(): void {
      const objectChanges = this.objectDiffer.diff(this.objects);
      if (objectChanges) {
         this.resetFilteredObj();
      }
   }

   async ionViewWillEnter(): Promise<void> {
      this.objectService.resetVariables();
      this.objects = []; // clear list when enter
      if (!this.startDate) {
         this.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.endDate) {
         this.endDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
      this.objectService.selectedTypeCode = null;
      await this.loadObjects();
      this.itemSearchText = null;
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

   /* #region crud */

   async loadObjects() {
      try {
         this.objectService.getObjectList(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
            this.resetFilteredObj();
         }, async error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("", "Error loading object.", "top", "danger", 1000);
      }
   }

   /* #endregion */

   /* #region add */

   async addObject() {
      this.objectService.resetVariables();
      this.navController.navigateForward("/transactions/stock-reorder/stock-reorder-header");
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Stock Reorder",
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

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.startDate,
               endDate: this.endDate,
               typeCodeFilter: true,
               typeCodeList: this.objectService.salesTypeMasterList,
               selectedTypeCode: this.objectService.selectedTypeCode
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objects = [];
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.objectService.selectedTypeCode = data.selectedTypeCode;
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   goToDetail(objectId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId
            }
         }
         this.navController.navigateForward("/transactions/stock-reorder/stock-reorder-detail", navigationExtras);
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
   filteredObj: StockReorderList[] = [];
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
               r.stockReorderNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationDesc?.toUpperCase().includes(searchText.toUpperCase()) 
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
      if (this.objectService.selectedTypeCode) {
         this.filteredObj = this.filteredObj.filter(r => r.typeCode === this.objectService.selectedTypeCode);
      }
   }

}
