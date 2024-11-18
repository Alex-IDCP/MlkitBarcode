import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferOutList } from '../../models/transfer-out';
import { TransferOutService } from '../../services/transfer-out.service';
import { FilterPage } from '../filter/filter.page';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-transfer-out',
   templateUrl: './transfer-out.page.html',
   styleUrls: ['./transfer-out.page.scss'],
})
export class TransferOutPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {
   private objectDiffer: any;
   objects: TransferOutList[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   customerIds: number[] = [];
   salesAgentIds: number[] = [];

   uniqueGrouping: Date[] = [];

   constructor(
      public objectService: TransferOutService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private modalController: ModalController,
      private navController: NavController,
      private differs: IterableDiffers
   ) {
      // reload all masterlist whenever user enter listing
      this.objectDiffer = this.differs.find(this.objects).create();
   }

   ngDoCheck(): void {
      
   }

   async ionViewWillEnter(): Promise<void> {
      this.objectService.resetVariables();
      if (!this.objectService.filterStartDate) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.objectService.filterEndDate) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      if (this.configService.selected_location) {
         this.objectService.selectedLocation = this.configService.selected_location;
      }
      await this.objectService.loadRequiredMaster();
      this.objectService.selectedTypeCode = null;
      await this.loadObjects();
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

   /* #region crud */

   async loadObjects() {
      try {
         this.objects = []; // clear list
         await this.loadingService.showLoading();
         this.objectService.getObjectList(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("", "Error loading object", "top", "danger", 1000);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region add */

   async addObject() {
      this.objectService.resetVariables();
      this.navController.navigateForward("/transactions/transfer-out/transfer-out-header");
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Transfer Out",
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
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
               typeCodeFilter: true,
               typeCodeList: this.objectService.interTransferTypeList,
               selectedTypeCode: this.objectService.selectedTypeCode
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objects = [];
            this.uniqueGrouping = [];
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
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
         this.navController.navigateForward("/transactions/transfer-out/transfer-out-detail", navigationExtras);
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
   filteredObj: TransferOutList[] = [];
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
               r.transferOutNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.fromLocationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.fromLocationDesc?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationDesc?.toUpperCase().includes(searchText.toUpperCase())
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
      if(this.objectService.selectedTypeCode){
         this.filteredObj = this.filteredObj.filter(r => r.typeCode === this.objectService.selectedTypeCode);
      }
   }

}
