import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
import { TransferBinService } from '../../services/transfer-bin.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { format } from 'date-fns';
import { TransferBinList } from '../../models/transfer-bin';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavigationExtras } from '@angular/router';

@Component({
   selector: 'app-transfer-bin',
   templateUrl: './transfer-bin.page.html',
   styleUrls: ['./transfer-bin.page.scss'],
})
export class TransferBinPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objects: TransferBinList[] = [];
	uniqueGrouping: Date[] = [];

   constructor(
      private objectService: TransferBinService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if (!this.objectService.filterStartDate) {
         this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.objectService.filterEndDate) {
         this.objectService.filterEndDate = this.commonService.getTodayDate();
      }
      await this.objectService.loadRequiredMaster();
      await this.loadObject();
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         // this.objectService.getObjects().subscribe(async response => {
         this.objectService.getObjects(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {            
            this.objects = response;
            let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
            this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
            await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
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

	getObjects(date: Date) {
		return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
	}

	// Select action
	async selectAction() {
		try {
			const actionSheet = await this.actionSheetController.create({
				header: "Choose an action",
				cssClass: "custom-action-sheet",
				buttons: [
					{
						text: "Add Transfer Bin",
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
		this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-header");
	}

	goToDetail(objectId: number) {
		let navigationExtras: NavigationExtras = {
			queryParams: {
				objectId: objectId
			}
		}
		this.navController.navigateForward("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
	}

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate,
               customerFilter: false,
               salesAgentFilter: false,
               useDraft: false
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
            await this.loadObject();
         }
      } catch (e) {
         console.error(e);
      }
   }

}
