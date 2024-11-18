import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { InboundScanService } from '../../services/inbound-scan.service';
import { ActionSheetController, ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MultiInboundListObject } from '../../models/inbound-scan';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-inbound-scan',
   templateUrl: './inbound-scan.page.html',
   styleUrls: ['./inbound-scan.page.scss'],
})
export class InboundScanPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter, ViewDidLeave {

   objects: MultiInboundListObject[] = [];

   uniqueGrouping: Date[] = [];

	currentPage: number = 1;
	itemsPerPage: number = 20;

   constructor(
      private objectService: InboundScanService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private navController: NavController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.filterStartDate === null || this.objectService.filterStartDate === undefined) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (this.objectService.filterEndDate === null || this.objectService.filterEndDate === undefined) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      this.itemSearchText = null;
   }

   async ionViewDidEnter(): Promise<void> {
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

   /* #region  crud */

   async loadObjects() {
      try {
         this.objects = [];
         await this.loadingService.showLoading();
         this.objectService.getObjectList(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
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

   /* #endregion */

   /* #region add inbound scan */

   async addObject() {
      try {
         if (this.objectService.hasWarehouseAgent()) {
            this.objectService.resetVariables();
            this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-header");
         } else {
            this.toastService.presentToast("", "Warehouse Agent not set", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Inbound scan",
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

   goToDetail(objectId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId
            }
         }
         this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-detail", navigationExtras);
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
	filteredObj: MultiInboundListObject[] = [];
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
               r.multiInboundNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.customerCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.customerName?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.warehouseAgentName?.toUpperCase().includes(searchText.toUpperCase())
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
