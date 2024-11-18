import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonDatetime, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { StockReorderRoot } from 'src/app/modules/transactions/models/stock-reorder';
import { StockReorderService } from 'src/app/modules/transactions/services/stock-reorder.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-stock-reorder-header',
   templateUrl: './stock-reorder-header.page.html',
   styleUrls: ['./stock-reorder-header.page.scss'],
})
export class StockReorderHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: UntypedFormGroup;

   constructor(
      public objectService: StockReorderService,
      public authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private toastService: ToastService,
      private formBuilder: UntypedFormBuilder
   ) {
      this.newObjectForm();
      this.setFormattedDateString();
   }

   ionViewWillEnter(): void {
      if (this.objectService.object) {
         this.objectForm.patchValue(this.objectService.object);
      }
   }

   ionViewDidEnter(): void {
   }

   newObjectForm() {
      let defaultLocation = this.configService.selected_location ?? 0;
      this.objectForm = this.formBuilder.group({
         stockReorderId: [0],
         stockReorderNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         typeCode: [null],
         locationId: [(defaultLocation ? defaultLocation : null), [Validators.required]],
         deactivated: [false],
         isCompleted: [false],
         sourceType: ["M"],
         salesOrderId: [null],
         salesOrderNum: [null],
         remark: [null],
         workFlowTransactionId: [null],
         uuid: [uuidv4()]
      })
      if (this.objectForm.controls.locationId.value) {
         this.onLocationChanged({ id: this.objectForm.controls.locationId.value });
      }
   }

   ngOnInit() {

   }

   onLocationChanged(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ locationId: event.id });
         let found = this.objectService.fullLocationMasterList.find(r => r.id === event.id);
         if (found) {
            if (found.attribute1 === "C") {
               this.objectForm.patchValue({ typeCode: "C" });
            } else {
               this.objectForm.patchValue({ typeCode: "T" });
            }
         }
      } else {
         // this.objectForm.patchValue({ typeCode: "C" });
         this.objectForm.patchValue({ locationId: null });
      }
   }

   /* #region steps */

   async nextStep() {
      try {
         let object: StockReorderRoot = this.objectForm.getRawValue();
         object.line = this.objectService.object?.line??[];
         await this.objectService.setObject(object);
         this.navController.navigateForward("/transactions/stock-reorder/stock-reorder-item");
      } catch (e) {
         console.error(e);
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
            this.objectService.resetVariables();
            this.navController.navigateBack("/transactions/stock-reorder");
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  misc */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #endregion */

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
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

}