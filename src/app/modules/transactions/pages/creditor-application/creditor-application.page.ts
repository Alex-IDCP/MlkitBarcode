import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, ViewWillEnter } from '@ionic/angular';
import { CreditorApplicationList } from '../../models/creditor-application';
import { CreditorApplicationService } from '../../services/creditor-application.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-creditor-application',
  templateUrl: './creditor-application.page.html',
  styleUrls: ['./creditor-application.page.scss'],
})
export class CreditorApplicationPage implements OnInit, ViewWillEnter {

  objects: CreditorApplicationList[] = [];

  constructor(
    private authService: AuthService,
    private objectService: CreditorApplicationService,
    private commonService: CommonService,
    private toastService: ToastService,
    private actionSheetController: ActionSheetController,
    private navController: NavController
  ) { }

  async ionViewWillEnter(): Promise<void> {
    await this.objectService.loadRequiredMaster();
    await this.loadObjects();
  }

  ngOnInit() {

  }

  uniqueGrouping: Date[] = [];
  loadObjects() {
    this.objectService.getObjects().subscribe(async response => {
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

  goToDetail(objectId: number) {
    try {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: objectId
        }
      }
      this.navController.navigateForward("/transactions/creditor-application/creditor-application-detail", navigationExtras);
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
            text: "Add Creditor App.",
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
      if (this.objectService.hasProcurementAgent()) {
        this.navController.navigateForward("/transactions/creditor-application/creditor-application-add");
      }
      else {
        this.toastService.presentToast("System Error", "Procurement Agent not set.", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

}
