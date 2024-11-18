import { Component, OnInit, ViewChild } from '@angular/core';
import { SalesAgentAllPerformanceObject } from '../../../models/rp-sa-performance-listing';
import { ReportsService } from '../../../services/reports.service';
import { IonDatetime, ViewWillEnter } from '@ionic/angular';
import { CommonService } from '../../../../../shared/services/common.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-rp-sales-performance',
  templateUrl: './rp-sales-performance.page.html',
  styleUrls: ['./rp-sales-performance.page.scss'],
})
export class RpSalesPerformancePage implements OnInit, ViewWillEnter {

  objects: SalesAgentAllPerformanceObject[] = [];

  columns: any;

  constructor(
    private reportService: ReportsService,
    private commonService: CommonService,
    private toastService: ToastService
  ) { 
    this.setFormattedDateString();
  }

  ionViewWillEnter(): void {

  }

  ngOnInit() {
    this.columns = [
      { prop: 'salesAgentName', name: 'SA Name', draggable: false },
      { prop: 'invoiceAmt', name: 'Invoice', draggable: false },
      { prop: 'cnAmount', name: 'Credit Note', draggable: false },
      { prop: 'soAmount', name: 'SO Amount', draggable: false },
      { prop: 'netAmount', name: 'Net Amount', draggable: false }
    ]
  }

  loadReport() {
    if (!(this.startDateValue || this.endDateValue)) {
      this.toastService.presentToast('Error', 'Invalid Date', 'top', 'warning', 1000);
    } else {
      try {
        this.reportService.getAllSalesPerformance(format(new Date(this.startDateValue), 'yyyy-MM-dd'), format(new Date(this.endDateValue), 'yyyy-MM-dd')).subscribe(response => {
          this.objects = response;
          this.objects.forEach(r => {
            r.netAmount = r.invoiceAmt - r.cnAmount + r.soAmount;
          })
          this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 300, true);
        }, error => {
          console.error(error);
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  sampleFunc(cells: any[]) {
    // Custom summary calculation logic
    const sum = cells.reduce((total, cell) => total + cell, 0);
    return Number(sum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  countSum(field: string) {
    let sum = 0;
    // switch(field) {
    //   case "invoiceAmt":
        sum = this.objects.flatMap(r => r[field]).reduce((total, cell) => total + cell, 0);
        // break;
        // case "cnAmount":
        //   sum = this.objects.flatMap(r => r.cnAmount).reduce((total, cell) => total + cell, 0);
        //   break;
        //   case "soAmount":
        //     sum = this.objects.flatMap(r => r.soAmount).reduce((total, cell) => total + cell, 0);
        //     break;
        //     case "netAmount":
        //       sum = this.objects.flatMap(r => r.netAmount).reduce((total, cell) => total + cell, 0);
        //       break;
    // }
    return Number(sum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
  }

  /* #region calendar handle here */

  formattedStartDateString: string = "";
  startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
  maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
  @ViewChild("datetime") datetime: IonDatetime
  setFormattedDateString() {
    this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
    this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
  }
  
  onStartDateSelected(value: any) {
    this.startDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
  }

  startDateDismiss() {
    this.datetime.cancel(true);
  }

  startDateSelect() {
    this.datetime.confirm(true);
  }

  formattedEndDateString: string = "";
  endDateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";  
  onEndDateSelected(value: any) {
    this.endDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
  }

  endDateDismiss() {
    this.datetime.cancel(true);
  }

  endDateSelect() {
    this.datetime.confirm(true);
  }

  /* #endregion */

}
