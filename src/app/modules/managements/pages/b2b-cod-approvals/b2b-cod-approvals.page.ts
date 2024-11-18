import { Component, OnInit } from '@angular/core';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { format, parseISO } from 'date-fns';
import { TransactionProcessingService } from 'src/app/shared/services/transaction-processing.service';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { TransactionProcessingDoc } from 'src/app/shared/models/transaction-processing';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-b2b-cod-approvals',
  templateUrl: './b2b-cod-approvals.page.html',
  styleUrls: ['./b2b-cod-approvals.page.scss'],
  providers: [TransactionProcessingService, { provide: "apiObject", useValue: "MobileB2bCodApprove" }]
})
export class B2bCodApprovalsPage implements OnInit, ViewWillEnter {

  pendingObjects: TransactionProcessingDoc[] = [];
  completedObjects: TransactionProcessingDoc[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private authService: AuthService,
    private transactionProcessingService: TransactionProcessingService,
    private toastService: ToastService,
    private modalController: ModalController,
    private commonService: CommonService
  ) { }

  // make sure refresh when back to this page
  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  ngOnInit() {

  }

  loadObjects() {
    try {
      this.transactionProcessingService.getProcessingDocumentByDateRange(format(parseISO(this.startDate.toISOString()), "yyyy-MM-dd"), format(parseISO(this.endDate.toISOString()), "yyyy-MM-dd")).subscribe(response => {
        this.pendingObjects = response.filter(r => !r.isComplete && !r.deactivated);
        this.completedObjects = response.filter(r => r.isComplete);
        this.toastService.presentToast("", "Search Complete", "top", "success", 1000, this.authService.showSearchResult);
      }, error => {
        console.error(error);
      })
    } catch (error) {
      this.toastService.presentToast("", "Error Loading", "top", "danger", 1000);
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
