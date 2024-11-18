import { Component, OnInit } from '@angular/core';
import { ViewWillEnter, ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PosApproval } from 'src/app/shared/models/pos-approval-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { PosApprovalProcessingService } from 'src/app/shared/services/pos-approval-processing.service';

@Component({
  selector: 'app-refund-approvals',
  templateUrl: './refund-approvals.page.html',
  styleUrls: ['./refund-approvals.page.scss'],
  providers: [PosApprovalProcessingService, { provide: "apiObject", useValue: "MobileRefundApprove" }]
})
export class RefundApprovalsPage implements OnInit, ViewWillEnter {

  fullDocList: PosApproval[] = [];
  pendingDocList: PosApproval[] = [];
  completedDocList: PosApproval[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private transactionProcessingService: PosApprovalProcessingService,
    private authService: AuthService,
    private commonService: CommonService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private modalController: ModalController,
  ) { }

  // make sure refresh when back to this page
  async ionViewWillEnter(): Promise<void> {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    await this.loadObjects();
  }

  ngOnInit() {
    
  }

  async loadObjects() {
    try {
      await this.loadingService.showLoading();
      this.transactionProcessingService.getObjects(format(parseISO(this.startDate.toISOString()), "yyyy-MM-dd"), format(parseISO(this.endDate.toISOString()), "yyyy-MM-dd")).subscribe(async response => {
        this.fullDocList = response;
        this.pendingDocList = this.fullDocList.filter(r => r.isApproved === null);
        this.completedDocList = this.fullDocList.filter(r => (r.isApproved === true || r.isApproved === false));
        await this.loadingService.dismissLoading();
        this.toastService.presentToast("", "Search Complete", "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        await this.loadingService.dismissLoading();
        console.error(error);
      })
    } catch (error) {
      await this.loadingService.dismissLoading();
      this.toastService.presentToast("", "Error Loading", "top", "danger", 1000);
    } finally {
      await this.loadingService.dismissLoading();
    }
  }

  onObjectUpdated(event) {
    this.loadObjects();
  }

  async filter() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
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
  }
  
}
