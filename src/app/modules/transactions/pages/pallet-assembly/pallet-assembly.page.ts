import { Component, OnInit, ViewChild } from '@angular/core';
import { PalletAssemblyService } from '../../services/pallet-assembly.service';
import { ActionSheetController, IonSearchbar, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
import { PalletAssemblyList, PalletItemList } from '../../models/pallet-assembly';
import { CommonService } from 'src/app/shared/services/common.service';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { NavigationExtras } from '@angular/router';

@Component({
   selector: 'app-pallet-assembly',
   templateUrl: './pallet-assembly.page.html',
   styleUrls: ['./pallet-assembly.page.scss'],
})
export class PalletAssemblyPage implements OnInit, ViewWillEnter, ViewDidEnter {

   @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;

   objects: PalletAssemblyList[] = [];
   filteredObj: PalletAssemblyList[] = [];
	currentPage: number = 1;
	itemsPerPage: number = 20;

   constructor(
      private objectService: PalletAssemblyService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private modalController: ModalController,
      private navController: NavController,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      this.searchbar.value = null;
      this.objects = [];
      this.filteredObj = [];
      if (!this.objectService.filterStartDate) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.objectService.filterEndDate) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      await this.loadObjects();
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {
   }

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListing(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
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

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objects = [];
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
            await this.loadObjects();
         }
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
                  text: "Add Pallet Assembly",
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
      this.navController.navigateRoot("/transactions/pallet-assembly/pallet-assembly-header");
   }

	goToDetail(objectId: number) {
		let navigationExtras: NavigationExtras = {
			queryParams: {
				objectId: objectId
			}
		}
		this.navController.navigateForward("/transactions/pallet-assembly/pallet-assembly-detail", navigationExtras);
	}

	async onKeyDown(event, searchText) {
		if (event.keyCode === 13) {
			await this.search(searchText, true);
		}
	}

	itemSearchText: string;
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
				this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r => r.palletAssemblyNum?.toUpperCase().includes(searchText.toUpperCase()))));
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
