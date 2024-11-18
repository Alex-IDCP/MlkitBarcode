import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { DefectRequestService } from '../../services/defect-request.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { format } from 'date-fns';
import { DefectRequestList } from '../../models/defect-request';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FilterPage } from '../filter/filter.page';
import { NavigationExtras } from '@angular/router';

@Component({
   selector: 'app-defect-request',
   templateUrl: './defect-request.page.html',
   styleUrls: ['./defect-request.page.scss'],
})
export class DefectRequestPage implements OnInit, ViewWillEnter, ViewDidEnter, ViewDidLeave {

   objects: DefectRequestList[] = [];
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private objectService: DefectRequestService,
      private authService: AuthService,
      private commonService: CommonService,
      private modalController: ModalController,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private loadingService: LoadingService,
      private toastService: ToastService
   ) { }

   ngOnInit(
   ) {
   }

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   async ionViewWillEnter(): Promise<void> {
      try {
         if (!this.objectService.filterStartDate) {
            this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
         }
         if (!this.objectService.filterEndDate) {
            this.objectService.filterEndDate = this.commonService.getTodayDate();
         }
         await this.objectService.resetVariables();
         await this.objectService.loadRequiredMaster();
         await this.loadObjects();
      } catch (e) {
         console.error(e);
      }
   }

   ionViewDidEnter(): void {
      
   }

   async ionViewDidLeave(): Promise<void> {
      await this.objectService.stopListening();
   }

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListByDate(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }
   
   goToDetail(objectId: number) {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: objectId
         }
      }
      this.navController.navigateForward("/transactions/defect-request/defect-request-detail", navigationExtras);
   }


   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Defect Request",
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

   addObject() {
      this.objectService.resetVariables();
      this.navController.navigateForward("/transactions/defect-request/defect-request-header");
   }

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

	async onKeyDown(event, searchText) {
		if (event.keyCode === 13) {
			await this.search(searchText, true);
		}
	}

   itemSearchText: string;
   filteredObj: DefectRequestList[] = [];
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
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r => r.defectRequestNum?.toUpperCase().includes(searchText.toUpperCase()))));
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

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

}
