import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ActionSheetController, AlertController, ViewWillEnter, ViewWillLeave, Platform, IonDatetime } from '@ionic/angular';
import { TransferOutService } from 'src/app/modules/transactions/services/transfer-out.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-transfer-out-header',
   templateUrl: './transfer-out-header.page.html',
   styleUrls: ['./transfer-out-header.page.scss'],
})
export class TransferOutHeaderPage implements OnInit, ViewWillEnter, ViewWillLeave {

   objectForm: UntypedFormGroup;
   objectId: number = null;

   systemWideEAN13IgnoreCheckDigit: boolean = false;

   constructor(
      public objectService: TransferOutService,
      public authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private formBuilder: UntypedFormBuilder,
      private route: ActivatedRoute,
      private platform: Platform,
   ) {
      this.newObjectForm();
   }

   async ionViewWillEnter(): Promise<void> {
      // await this.bindLocationList();
      if (this.objectService.objectHeader && this.objectService.objectHeader?.transferOutId > 0) {
         this.dateValue = format(new Date(this.objectService.objectHeader?.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
         this.objectForm.patchValue(this.objectService.objectHeader);
      }
      await this.setFormattedDateString();
      if (this.configService.selected_location) {
         this.objectService.selectedLocation = this.configService.selected_location;
      }
   }

   ionViewWillLeave(): void {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         transferOutId: [0],
         transferOutNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         typeCode: [null, [Validators.required]],
         locationId: [(this.objectService.selectedLocation ? this.objectService.selectedLocation : null), [Validators.required]],
         toLocationId: [null, [Validators.required]],
         deactivated: [false],
         isCompleted: [false],
         sourceType: ["M"],
         interTransferNum: [null],
         totalCarton: [null],
         remark: [null],
         workFlowTransactionId: [null],
         grnNum: [null],
         uuid: [uuidv4()],
         handleBy: [null],
         totalBag: [null]
      })
      if (this.objectForm.controls.locationId.value) {
         this.onLocationChanged({ id: this.objectForm.controls.locationId.value });
      }
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   pickingQtyControl: string = "0";
   systemWideScanningMethod: string;
   editableTrxDate: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
         }
         let allowEditTrxDate = this.moduleControl.find(x => x.ctrlName === "MobileTransferOutTrxDateEditable");
         if (allowEditTrxDate != undefined) {
            this.editableTrxDate = allowEditTrxDate.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
      })
   }

   onTypeCodeChange(event:any){
      if(event){
         this.objectForm.patchValue({ typeCode: event.code });
      }
   }

   onLocationChanged(event: any) {
      if (event) {
         this.objectService.selectedLocation = event.id;
         this.objectForm.patchValue({ locationId: event.id });
         let found = this.objectService.fullLocationMasterList.find(r => r.id === event.id);
         if (found) {
            if (found.attribute1 === "C") {
               this.objectForm.patchValue({ typeCode: "C" });
            } else {
               this.objectForm.patchValue({ typeCode: "IL" });
            }
         }
      } else {
         this.objectService.selectedLocation = null;
         // this.objectForm.patchValue({ typeCode: "C" });
         this.objectForm.patchValue({ locationId: null });
      }
   }

   onToLocationChanged(event: any) {
      if (event) {
         this.objectForm.patchValue({ toLocationId: event.id });
      } else {
         this.objectForm.patchValue({ toLocationId: null });
      }
   }

   /* #region steps */

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
            if (this.objectService?.objectHeader?.transferOutId > 0) {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.transferOutId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
            } else {
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/transfer-out");
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/transfer-out/transfer-out-item");
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

   /* #endregion */

}
