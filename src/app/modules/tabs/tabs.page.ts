import { Component } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { moduleCode, reportAppCode } from 'src/app/shared/models/acl-const';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  showTrxTab: boolean = false;
  showMagTab: boolean = false;
  showRepTab: boolean = false;

  constructor(
    private authService: AuthService,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private navController: NavController
  ) {
    this.authService.menuModel$.subscribe(obj => {
      if (obj) {
        this.showTrxTab = obj.flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.transaction)?.length > 0

        this.showMagTab = obj.flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.approval)?.length > 0

        this.showRepTab = obj.flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.report)?.length > 0
      }
    })
  }

}
