import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ConsignmentCountEntryRoot } from 'src/app/modules/transactions/models/consignment-count-entry';
import { ConsignmentCountEntryService } from 'src/app/modules/transactions/services/consignment-count-entry.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-consignment-count-entry-header',
   templateUrl: './consignment-count-entry-header.page.html',
   styleUrls: ['./consignment-count-entry-header.page.scss'],
})
export class ConsignmentCountEntryHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;

   constructor(
      public objectService: ConsignmentCountEntryService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
   ) {
      this.newObjectForm();
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         consignmentCountEntryId: [0],
         consignmentCountEntryNum: [null],
         description: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         trxDateTime: [null],
         locationId: [this.configService.selected_location ?? 0, [Validators.required]],
         consignmentCountUDField1: [null],
         consignmentCountUDField2: [null],
         consignmentCountUDField3: [null],
         consignmentCountUDOption1: [null],
         consignmentCountUDOption2: [null],
         consignmentCountUDOption3: [null],
         remark: [null],
         printCount: [null],
         rack: [null],
         zone: [null],
         sourceType: ["M"],
         isLocal: [null],
         guid: [null],
         lastUpdated: [null]
      });
   }

   async ionViewWillEnter(): Promise<void> {
      await this.setFormattedDateString();
      if (this.objectService.object?.header === null || this.objectService.object?.header === undefined) {

      } else {
         await this.objectForm.patchValue(this.objectService.object?.header);
         this.dateValue = format(new Date(this.objectService.object?.header?.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
         await this.setFormattedDateString();
      }
   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

   async onLocationSelected(event: SearchDropdownList) {
      if (event) {
         let found = this.objectService.locationMasterList.find(r => r.id === event.id);
         if (found) {
            if (this.objectService.object?.details && this.objectService.object?.details.length > 0) {
               const alert = await this.alertController.create({
                  cssClass: "custom-alert",
                  header: "Are you sure to proceed?",
                  subHeader: "Changing Location will remove inserted lines",
                  buttons: [
                     {
                        text: "Confirm",
                        cssClass: "success",
                        handler: async () => {
                           this.objectForm.patchValue({ locationId: found.id });
                           this.objectService.object.details = [];
                        }
                     },
                     {
                        text: "Cancel",
                        role: "cancel",
                        cssClass: "cancel",
                        handler: async () => {

                        }
                     }
                  ]
               });
               await alert.present();
            } else {
               this.objectForm.patchValue({ locationId: found.id });
            }
         } else {
            this.toastService.presentToast("System Error", "Location not found", "top", "danger", 2000);
         }
      } else {
         this.objectForm.patchValue({ locationId: null });
      }
   }

   /* #region steps */

   async cancelInsert() {
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
         if (this.objectService.object?.header && this.objectService.object?.header?.consignmentCountEntryId > 0) {
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.object?.header?.consignmentCountEntryId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-detail", navigationExtras);
         }
         else {
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/consignment-count-entry");
         }
      }
   }

   async nextStep() {
      this.objectService.setObject({ header: this.objectForm.getRawValue(), details: (this.objectService.object?.details ?? []) });
      await this.configService.saveToLocaLStorage(this.objectService.trxKey, this.objectService.object);
      this.navController.navigateForward("/transactions/consignment-count-entry/consignment-count-entry-item");
   }

   /* #endregion */

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
      this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`) });
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

}
