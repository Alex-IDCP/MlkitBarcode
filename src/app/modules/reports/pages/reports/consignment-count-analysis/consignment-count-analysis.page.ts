import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ConsignmentCountAnalysisObject, ConsignmentCountAnalysisRequestObject } from '../../../models/consignment-count-analysis';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { ReportsService } from '../../../services/reports.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-consignment-count-analysis',
   templateUrl: './consignment-count-analysis.page.html',
   styleUrls: ['./consignment-count-analysis.page.scss'],
})
export class ConsignmentCountAnalysisPage implements OnInit, ViewWillEnter {

   Math: any;

   objects: ConsignmentCountAnalysisObject[] = [];
   columns: any;

   locationMasterList: MasterListDetails[] = [];

   request: ConsignmentCountAnalysisRequestObject = { dateStart: null, dateEnd: null, locationId: [] };

   constructor(
      private objectService: ReportsService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService
   ) {
      this.Math = Math;
   }

   async ionViewWillEnter(): Promise<void> {
      await this.setFormattedDateString();
      await this.setFormattedDateString2();
      await this.loadingService.showLoading();
      await this.loadMasterList();
      await this.loadingService.dismissLoading();
   }

   ngOnInit() {
      this.columns = [
         { prop: "itemCode", name: "Item Code", draggable: false },
         { prop: "itemDesc", name: "Item Desc.", draggable: false },
         { prop: "xCode", name: "X Code", draggable: false },
         { prop: "xDesc", name: "X Desc.", draggable: false },
         { prop: "yCode", name: "Y Code", draggable: false },
         { prop: "yDesx", name: "Y Desc.", draggable: false },
         { prop: "qtyRequest", name: "Qty.", draggable: false },
      ]
   }

   loadMasterList() {
      this.objectService.getMasterList().subscribe({
         next: (response) => {
            let masterList = response;
            this.locationMasterList = masterList.filter(s => s.objectName === "Location").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id) || this.configService.loginUser.locationId.length === 0);
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   loadReport() {
      setTimeout(async () => {
         try {
            if (this.request.dateStart === null || this.request.dateStart === undefined) {
               this.toastService.presentToast("Control Error", "Please select a date.", "top", "warning", 1000);
               return;
            }
            await this.loadingService.showLoading();
            await this.objectService.getConsignmentCountAnalysis(this.request).subscribe({
               next: (response) => {
                  this.objects = response;
               },
               error: (error) => {
                  console.error(error);
               }
            })
         } catch (error) {
            console.error(error);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }, 0);
   }

   onLocationSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.locationId = event.flatMap(r => r.id);
         } else {
            this.request = {
               dateStart: this.request.dateStart,
               dateEnd: this.request.dateEnd,
               locationId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.locationId = []
         } else {
            this.request = {
               dateStart: this.request.dateStart,
               dateEnd: this.request.dateEnd,
               locationId: []
            }
         }
      }
   }

   @ViewChild("myTable") table: any;
   groupExpansionDefaultStatus: boolean = true;
   toggleExpandGroup(group) {
      this.groupExpansionDefaultStatus = false;
      this.table.groupHeader.toggleExpandGroup(group);
   }

   onDetailToggle(event) {

   }


   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      if (this.request) {
         this.request.dateStart = format(new Date(this.dateValue), "yyyy-MM-dd")
      } else {
         this.request = {
            dateStart: null,
            dateEnd: this.request.dateEnd,
            locationId: this.request.locationId
         }
      }
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }
   
   formattedDateString2: string = "";
   dateValue2 = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime2") datetime2: IonDatetime
   setFormattedDateString2() {
      this.formattedDateString2 = format(parseISO(format(new Date(this.dateValue2), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      if (this.request) {
         this.request.dateEnd = format(new Date(this.dateValue2), "yyyy-MM-dd")
      } else {
         this.request = {
            dateStart: this.request.dateStart,
            dateEnd: null,
            locationId: this.request.locationId
         }
      }
   }

   onTrxDateSelected2(value: any) {
      this.dateValue2 = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString2();
   }

   dateDismiss2() {
      this.datetime2.cancel(true);
   }

   dateSelect2() {
      this.datetime2.confirm(true);
   }

   /* #endregion */

}
