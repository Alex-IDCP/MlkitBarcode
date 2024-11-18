import { Component, OnInit, ViewChild } from '@angular/core';
import { SalesByCustomer, SalesByCustomerRequest } from '../../../models/rp-sales-customer';
import { ReportsService } from '../../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { IonDatetime, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-rp-sales-customer',
  templateUrl: './rp-sales-customer.page.html',
  styleUrls: ['./rp-sales-customer.page.scss'],
})
export class RpSalesCustomerPage implements OnInit, ViewWillEnter {

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];

  objects: SalesByCustomer[] = [];

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
    this.loadCustomers();
    this.columns = [
      { prop: 'customerCode', name: 'Debtor Code', draggable: false },
      { prop: 'customerName', name: 'Debtor Name', draggable: false },
      { prop: 'trxMonth', name: 'Trx Month', draggable: false },
      { prop: 'salesAmount', name: 'Sales Amount', draggable: false }
    ]
  }

  loadCustomers() {
    this.reportService.getCustomers().subscribe(async response => {
      this.customers = response;
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
      this.customers.forEach(r => {
        this.customerSearchDropdownList.push({
          id: r.customerId,
          code: r.customerCode,
          oldCode: r.oldCustomerCode,
          description: r.name
        })
      })
    }, error => {
      console.log(error);
    })
  }

  loadReport() {
    if (!(this.startDateValue || this.endDateValue)) {
      this.toastService.presentToast('Error', 'Invalid Date', 'top', 'warning', 1000);
    } else {
      let obj: SalesByCustomerRequest = {
        customerId: this.customerIds,
        dateStart: format(new Date(this.startDateValue), 'yyyy-MM-dd'),
        dateEnd: format(new Date(this.endDateValue), 'yyyy-MM-dd'),
      }
      try {
        this.reportService.getSalesByCustomer(obj).subscribe(response => {
          this.objects = response;
          this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 300, true);
        }, error => {
          console.error(error);
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  customerIds: number[] = [];
  onCustomerSelected(event: any[]) {
    if (event && event !== undefined) {
      this.customerIds = event.flatMap(r => r.id);
    }
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
