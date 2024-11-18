import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { BinCountBatchList } from 'src/app/modules/transactions/models/bin-count';
import { BinCountService } from 'src/app/modules/transactions/services/bin-count.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-bin-count-header',
   templateUrl: './bin-count-header.page.html',
   styleUrls: ['./bin-count-header.page.scss'],
})
export class BinCountHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;

   constructor(
      public objectService: BinCountService,
      private commonService: CommonService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute
   ) {
      this.newObjectForm();
   }

   ionViewWillEnter(): void {
      if (this.objectService.objectHeader !== null && this.objectService.objectHeader?.binCountId > 0) {
         this.objectForm.patchValue(this.objectService.objectHeader);
         this.dateValue = format(this.objectService.objectHeader.trxDate, "yyyy-MM-dd") + "T08:00:00.000Z";
         this.setFormattedDateString();
         if (this.objectService.objectHeader?.binCountId > 0) {
            this.onLocationSelected({ id: this.objectService.objectHeader.locationId });
         }
      }
      this.setFormattedDateString();
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         binCountId: [0],
         binCountNum: [null],
         description: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         locationId: [null, [Validators.required]],
         locationZoneId: [null],
         binCountBatchId: [null, [Validators.required]],
         sectionCode: [null],
         rackCode: [null],
         zoneId: [null],
         levelCode: [null],
         remark: [null, [Validators.maxLength(1000)]],
         sourceType: ["M"]
      })
   }

   binCountBatchlist: BinCountBatchList[] = [];
   binCountBatchDdl: SearchDropdownList[] = [];
   @ViewChild("binCountBatchSdd", { static: false }) binCountBatchSdd: SearchDropdownPage;
   async onLocationSelected(event: SearchDropdownList) {
      try {
         if (event) {
            if (this.objectService.objectHeader?.binCountId === null || this.objectService.objectHeader?.binCountId === undefined) {
               this.binCountBatchSdd.clearSelected();
            }
            if (event) {
               this.objectForm.patchValue({ locationId: event.id });
               await this.objectService.onLocationChanged(this.objectForm.controls.locationId.value);
               this.binCountBatchDdl = [];
               this.objectService.getBinCountBatchByLocationId(this.objectForm.controls.locationId.value).subscribe(response => {
                  this.binCountBatchlist = response;
                  if (this.objectService.objectHeader) {
                     this.objectService.objectHeader.binCountBatchNum = this.binCountBatchlist.find(r => r.binCountBatchId === this.objectService.objectHeader.binCountBatchId)?.binCountBatchNum;
                     this.objectService.objectHeader.binCountBatchDescription = this.binCountBatchlist.find(r => r.binCountBatchId === this.objectService.objectHeader.binCountBatchId)?.description;
                  }
                  if (this.binCountBatchlist.length > 0) {
                     let temp: SearchDropdownList[] = [];
                     this.binCountBatchlist.forEach(r => {
                        temp.push({
                           id: r.binCountBatchId,
                           code: r.binCountBatchNum,
                           description: r.description
                        })
                     })
                     this.binCountBatchDdl = JSON.parse(JSON.stringify(temp));
                  }
               }, error => {
                  console.error(error);
               })
            }
         } else {
            this.objectForm.patchValue({ locationId: null });
            this.binCountBatchDdl = [];
            this.binCountBatchSdd.clearSelected();
         }
      } catch (e) {
         console.error(e);
      }
   }

   onBinCountBatchChanged(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ binCountBatchId: event.id });
      } else {
         this.objectForm.patchValue({ binCountBatchId: null });
      }
   }

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
            subHeader: "Changes made will be discard.",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
               },
               {
                  text: "No",
                  role: "cancel",
               }]
         });
         await actionSheet.present();

         const { role } = await actionSheet.onWillDismiss();

         if (role === "confirm") {
            if (this.objectService.objectHeader?.binCountId && this.objectService.objectHeader?.binCountId > 0) {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader?.binCountId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/bin-count/bin-count-detail", navigationExtras);
            } else {
               this.navController.navigateRoot("/transactions/bin-count");
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   nextStep() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/bin-count/bin-count-item");
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
      this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`) });
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

}
