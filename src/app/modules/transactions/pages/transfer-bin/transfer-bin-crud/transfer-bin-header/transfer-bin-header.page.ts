import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { TransferBinRoot } from 'src/app/modules/transactions/models/transfer-bin';
import { TransferBinService } from 'src/app/modules/transactions/services/transfer-bin.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-transfer-bin-header',
   templateUrl: './transfer-bin-header.page.html',
   styleUrls: ['./transfer-bin-header.page.scss'],
})
export class TransferBinHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;
   objectRoot: TransferBinRoot;

   constructor(
      public objectService: TransferBinService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute
   ) {
      this.newObjectForm();
   }

   async ionViewWillEnter(): Promise<void> {
      await this.setFormattedDateString();
      // await this.bindLocationList();
      if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {

      } else {
         await this.objectForm.patchValue(this.objectService.objectHeader);
         this.dateValue = format(new Date(this.objectService.objectHeader.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
         await this.setFormattedDateString();
      }
   }

   ionViewDidEnter(): void {
      ;
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         transferBinId: [0],
         transferBinNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         locationId: [null, [Validators.required]],
         warehouseAgentId: [null],
         remark: [null],
         masterUDGroup1: [null],
         masterUDGroup2: [null],
         masterUDGroup3: [null],
         binCode: [null],
         deactivated: [null],
         sourceType: ["M"]
      });
   }

   ngOnInit() {
   }

   async onLocationSelected(event) {
      if (event) {
         if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to proceed?",
               subHeader: "Changing Location will remove inserted lines",
               buttons: [
                  {
                     text: "Confirm",
                     cssClass: "success",
                     handler: async () => {
                        // reload bin list
                        this.objectForm.patchValue({ locationId: event.id });
                        await this.objectService.onLocationChanged(this.objectForm.controls.locationId.value);
                        this.objectService.removeLines();
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
            // reload bin list
            this.objectForm.patchValue({ locationId: event.id });
            await this.objectService.onLocationChanged(this.objectForm.controls.locationId.value);
            this.objectService.removeLines();            
         }
      } else {
         this.objectForm.patchValue({ locationId: null });
         await this.objectService.onLocationChanged(this.objectForm.controls.locationId.value);
      }
   }

   onWarehouseAgentSelected(event) {
      if (event) {
         this.objectForm.patchValue({ warehouseAgentId: event.id });
      } else {
         this.objectForm.patchValue({ warehouseAgentId: null });
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
         if (this.objectService.objectHeader && this.objectService.objectHeader?.transferBinId > 0) {
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.objectHeader.transferBinId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
         }
         else {
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-bin");
         }
      }
   }

   async nextStep() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      let data: TransferBinRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
      await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      this.navController.navigateForward("/transactions/transfer-bin/transfer-bin-item");
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
