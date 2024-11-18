import { Component, OnInit } from '@angular/core';
import { LocationApplicationList } from '../../models/location-application';
import { ActionSheetController, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { LocationApplicationService } from '../../services/location-application.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavigationExtras } from '@angular/router';
import { format } from 'date-fns';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-location-application',
  templateUrl: './location-application.page.html',
  styleUrls: ['./location-application.page.scss'],
})
export class LocationApplicationPage implements OnInit, ViewWillEnter, ViewDidEnter {

  objects: LocationApplicationList[] = [];

  constructor(
    private authService: AuthService,
    public objectService: LocationApplicationService,
    private commonService: CommonService,
    private toastService: ToastService,
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
  }
  
  async ionViewDidEnter(): Promise<void> {
    await this.objectService.loadRequiredMaster();
    await this.loadObjects();
  }


  ngOnInit() {

  }

  uniqueGrouping: Date[] = [];
  loadObjects() {
    this.objectService.getObjects(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
      this.objects = response;
      let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.createdAt))))];
      this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
      await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
      this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
    }, error => {
      console.error(error);
    })
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.createdAt).getMonth() === date.getMonth() && new Date(r.createdAt).getFullYear() === date.getFullYear() && new Date(r.createdAt).getDate() === date.getDate());
  }


  /* #endregion */

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
        this.uniqueGrouping = [];
        this.objectService.filterStartDate = new Date(data.startDate);
        this.objectService.filterEndDate = new Date(data.endDate);
        await this.loadObjects();
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
      this.navController.navigateForward("/transactions/location-application/location-application-detail", navigationExtras);
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
            text: "Add Location App.",
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


  async addObject() {
    try {
      if (this.objectService.hasSalesAgent()) {
        this.navController.navigateForward("/transactions/location-application/location-application-add");
      }
      else {
        this.toastService.presentToast("System Error", "Sales Agent not set.", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

}
