import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../services/reports.service';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { SalesAnalysisObject } from '../../models/sales-analysis';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Item } from 'src/app/modules/transactions/models/item';

@Component({
   selector: 'app-sales-analysis',
   templateUrl: './sales-analysis.page.html',
   styleUrls: ['./sales-analysis.page.scss'],
})
export class SalesAnalysisPage implements OnInit, ViewWillEnter {

   type: SearchDropdownList[] = [];
   selectedType: SearchDropdownList = null;

   itemList: Item[] = [];
   itemSearchDropDown: SearchDropdownList[] = [];
   selectedItem: number[] = [];

   location: ConsignmentSalesLocation[] = [];
   locationSearchDropDown: SearchDropdownList[] = [];
   selectedLocation: SearchDropdownList = null;

   object: SalesAnalysisObject[] = [];

   constructor(
      private objectService: ReportsService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController
   ) {
      this.setFormattedDateString();
   }

   async ionViewWillEnter(): Promise<void> {
      this.type = [];
      setTimeout(async () => {
         await this.loadingService.showLoading();
         await this.loadLocation();
         await this.loadItem();
         await this.loadingService.dismissLoading();
         this.type.push(
            { id: 0, code: "SDI", description: "Sales by Discount Code, Item Code" },
            { id: 1, code: "SDD", description: "Sales by Trx Date, Discount Code" },
            { id: 2, code: "IXY", description: "Sales by Item Code, X Code, Y Code" },
            { id: 3, code: "SMC", description: "Sales by Discount Code (Margin Cat.)" },
            { id: 4, code: "SDC", description: "Sales by Discount Code" },
            { id: 5, code: "SQA", description: "Sales, Qty., Amt." },
            { id: 6, code: "STI", description: "Sales By Transaction, Item" }
         );
      }, 0);
   }

   ngOnInit() {
   }

   loadItem() {
      this.itemList = [];
      this.itemSearchDropDown = [];
      this.objectService.getItems().subscribe({
         next: (response) => {
            this.itemList = response;
            this.itemList.forEach(r => {
               this.itemSearchDropDown.push({
                  id: r.itemId,
                  code: r.itemCode,
                  description: r.description
               })
            })
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   loadLocation() {
      this.location = [];
      this.locationSearchDropDown = [];
      this.objectService.getConsignmentLocation().subscribe(response => {
         this.location = response;
         this.location.forEach(r => {
            this.locationSearchDropDown.push({
               id: r.locationId,
               code: r.locationCode,
               description: r.locationDescription
            })
         })
      }, error => {
         console.error(error);
      })
   }

   objects: any[] = [];
   async loadReport() {
      try {
         console.log("🚀 ~ SalesAnalysisPage ~ loadReport ~ this.selectedItem:", this.selectedItem)
         if (this.selectedType?.id === 6) {
            if (this.selectedItem.length === 0) {
               this.toastService.presentToast("Control Error", "Please select at least one item.", "top", "warning", 1000, true);
               return;
            }
         }
         await this.loadingService.showLoading();
         this.object = [];
         this.objectService.getSalesAnalysis({
            reportType: this.selectedType?.id,
            dateStart: new Date(format(new Date(this.startDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            dateEnd: new Date(format(new Date(this.endDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            locationId: this.selectedLocation.id,
            itemid: this.selectedItem
         }).subscribe(async response => {
            this.object = response;
            this.toastService.presentToast("Search Complete", `${this.object.length} record(s) found.`, "top", "success", 300, true);
         }, async error => {
            console.error(error);
         })
      } catch (error) {
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   onTypeChanged(event: any) {
      this.object = [];
      this.selectedType = event;
   }

   onLocationChanged(event: any) {
      this.object = [];
      this.selectedLocation = event;
   }

   onItemSelected(event: SearchDropdownList[]) {
      console.log("🚀 ~ SalesAnalysisPage ~ onItemSelected ~ event:", event)
      if (event) {
         this.selectedItem = event.flatMap(r => r.id);
         console.log("🚀 ~ SalesAnalysisPage ~ onItemSelected ~ this.selectedItem:", this.selectedItem)
      } else {
         this.selectedItem = [];
      }
   }

   /* #region calendar handle here */

   formattedStartDateString: string = "";
   startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("startdatetime") startdatetime: IonDatetime
   @ViewChild("enddatetime") enddatetime: IonDatetime
   setFormattedDateString() {
      this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onStartDateSelected(value: any) {
      this.startDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   startDateDismiss() {
      this.startdatetime.cancel(true);
   }

   startDateSelect() {
      this.startdatetime.confirm(true);
   }

   formattedEndDateString: string = "";
   endDateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   onEndDateSelected(value: any) {
      this.endDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   endDateDismiss() {
      this.enddatetime.cancel(true);
   }

   endDateSelect() {
      this.enddatetime.confirm(true);
   }

   /* #endregion */

}
