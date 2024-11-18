import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { Item } from 'src/app/modules/transactions/models/item';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CustomConsignmentSalesReportObject } from '../../models/consignment-sales-report';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../services/reports.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConfigService } from 'src/app/services/config/config.service';
import { SortType } from '@swimlane/ngx-datatable';

@Component({
   selector: 'app-custom-consignment-sales-report',
   templateUrl: './custom-consignment-sales-report.page.html',
   styleUrls: ['./custom-consignment-sales-report.page.scss'],
})
export class CustomConsignmentSalesReportPage implements OnInit, ViewWillEnter {

   itemList: Item[] = [];
   itemSearchDropDown: SearchDropdownList[] = [];
   selectedItem: number[] = [];

   sortType: SortType = SortType.multi;

   selectedItemBrand: number[] = [];
   selectedItemCategory: number[] = [];
   selectedItemGroup: number[] = [];

   location: ConsignmentSalesLocation[] = [];
   locationSearchDropDown: SearchDropdownList[] = [];
   selectedLocation: number[] = [];

   object: CustomConsignmentSalesReportObject[] = [];

   constructor(
      private objectService: ReportsService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController
   ) {
      this.setFormattedDateString();
   }

   async ionViewWillEnter(): Promise<void> {
      setTimeout(async () => {
         await this.loadingService.showLoading();
         await this.loadMasterList();
         await this.loadLocation();
         await this.loadItem();
         await this.loadingService.dismissLoading();
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

   fullMasterList: MasterList[] = [];
   itemBrandMasterList: MasterListDetails[] = [];
   itemCategoryMasterList: MasterListDetails[] = [];
   itemGroupMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.objectService.getMasterList().subscribe({
         next: (response) => {
            this.fullMasterList = response;
            this.itemBrandMasterList = this.fullMasterList.filter(x => x.objectName === "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated === 0);
            this.itemCategoryMasterList = this.fullMasterList.filter(x => x.objectName === "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated === 0);
            this.itemGroupMasterList = this.fullMasterList.filter(x => x.objectName === "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   async loadReport() {
      try {
         await this.loadingService.showLoading();
         this.object = [];
         this.objectService.getCustomConsignmentSalesReport({
            dateStart: new Date(format(new Date(this.startDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            dateEnd: new Date(format(new Date(this.endDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
            locationId: this.selectedLocation,
            itemId: this.selectedItem,
            itemBrandId: this.selectedItemBrand,
            itemCategoryId: this.selectedItemCategory,
            itemGroupId: this.selectedItemGroup
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

   onLocationChanged(event: any) {
      if (event) {
         this.selectedLocation = event.flatMap(r => r.id);
      } else {
         this.selectedLocation = [];
      }
   }

   onItemSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItem = event.flatMap(r => r.id);
      } else {
         this.selectedItem = [];
      }
   }

   onItemBrandSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemBrand = event.flatMap(r => r.id);
      } else {
         this.selectedItemBrand = [];
      }
   }

   onItemCategorySelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemCategory = event.flatMap(r => r.id);
      } else {
         this.selectedItemCategory = [];
      }
   }

   onItemGroupSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemGroup = event.flatMap(r => r.id);
      } else {
         this.selectedItemGroup = [];
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

   countSum(field: string) {
      let sum = 0;
      sum = this.object.flatMap(r => r[field]).reduce((total, cell) => total + cell, 0);
      return Number(sum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   }

}
