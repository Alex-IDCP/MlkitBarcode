import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from '../../../../shared/services/common.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
   selector: 'app-filter',
   templateUrl: './filter.page.html',
   styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit, OnChanges {

   filters: any;

   date_from_active: boolean = false;
   date_to_active: boolean = false;

   date_from: any;
   date_to: any;
   startDate: Date;
   endDate: Date;

   customerFilter: boolean = false;
   customerList: SearchDropdownList[] = [];

   salesAgentFilter: boolean = false;
   salesAgentList: SearchDropdownList[] = [];

   locationFilter: boolean = false;
   locationList: SearchDropdownList[] = [];

   typeCodeFilter: boolean = false;
   typeCodeList: MasterListDetails[] = [];

   useDraft: boolean = false;
   showDraftOnly: boolean = true;

   useShowClosed: boolean = false;
   showClosed: boolean = true;

   constructor(
      private commonService: CommonService,
      private modalController: ModalController
   ) { }
   
   ngOnChanges(changes: SimpleChanges): void {
      throw new Error('Method not implemented.');
   }

   ngOnInit() {
      this.date_from = format(parseISO(this.startDate.toISOString()), 'MMM d, yyyy');
      this.date_to = format(parseISO(this.endDate.toISOString()), 'MMM d, yyyy');
   }

   // Toggle date from
   toggleDateFrom() {
      this.date_from_active = this.date_from_active ? false : true;
      this.date_to_active = false;
   }

   // Toggle date to
   toggleDateTo() {
      this.date_to_active = this.date_to_active ? false : true;
      this.date_from_active = false;
   }

   // On date from select
   onDateFromSelect(event: any) {
      let date = new Date(event.detail.value);
      this.startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
      this.date_from = format(parseISO(event.detail.value), 'MMM d, yyyy');
      // this.date_from_active = false;
   }

   // On date to select
   onDateToSelect(event: any) {
      let date = new Date(event.detail.value);
      this.endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
      this.date_to = format(parseISO(event.detail.value), 'MMM d, yyyy');
      // this.date_to_active = false;
   }

   selectedCustomerId: number[] = [];
   onCustomerSelected(event) {
      this.selectedCustomerId = [];
      if (event) {
         event.forEach(r => {
            this.selectedCustomerId.push(r.id)
         });
      }
   }

   selectedLocationId: number[] = [];
   onLocationSelected(event) {
      this.selectedLocationId = [];
      if (event) {
         event.forEach(r => {
            this.selectedLocationId.push(r.id)
         });
      }
   }

   selectedSalesAgentId: number[] = [];
   onSalesAgentSelected(event) {
      this.selectedSalesAgentId = [];
      if (event) {
         event.forEach(r => {
            this.selectedSalesAgentId.push(r.id);
         });
      }
   }

   selectedTypeCode: string = null
   onTypeCodeSelected(event){
      if (event) {
         this.selectedTypeCode = event.code;
      } else {
         this.selectedTypeCode = null;
      }
   }

   // Cancel
   cancel() {
      // Dismiss modal
      this.filters = null;
      
      this.modalController.dismiss(this.filters);
   }

   // Apply filter
   apply() {
      this.filters = { startDate: this.startDate, endDate: this.endDate, customerIds: this.selectedCustomerId, locationIds: this.selectedLocationId, salesAgentIds: this.selectedSalesAgentId, selectedTypeCode: this.selectedTypeCode, showDraftOnly: this.showDraftOnly, showClosed: this.showClosed };

      // Dismiss modal and apply filters
      this.modalController.dismiss(this.filters);
   }

}
