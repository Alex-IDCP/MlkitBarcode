import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonPopover, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TruckLoadingDetail, TruckLoadingRoot } from '../../../models/truck-loading';
import { TruckLoadingService } from '../../../services/truck-loading.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

@Component({
   selector: 'app-truck-loading-add',
   templateUrl: './truck-loading-add.page.html',
   styleUrls: ['./truck-loading-add.page.scss'],
})
export class TruckLoadingAddPage implements OnInit {

   objectForm: FormGroup;
   lineObjects: TruckLoadingDetail[] = [];

   constructor(
      public objectService: TruckLoadingService,
      private formBuilder: FormBuilder,
      private commonService: CommonService,
      private toastService: ToastService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private navController: NavController
   ) {
      this.date_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
      this.date = format(this.commonService.getTodayDate(), 'MMM d, yyyy');
      this.newObjectForm();
   }

   ngOnInit() {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         truckLoadingId: 0,
         truckLoadingNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
         typeCode: [null, [Validators.required]],
         vendorId: [null, [Validators.required]],
         plateNumber: [null],
         shipMethodId: [null],
         remark: [null],
         sourceType: ['M'],
      })
   }

   /* #region barcode scanner */

   docNumInput: string = '';
   handleKeyDown(e: any, key: string) {
      if (e.keyCode === 13) {
         this.validateDocNum(key);
         e.preventDefault();
      }
   }

   @ViewChild('barcodeInput', { static: false }) barcodeInput: ElementRef;
   async validateDocNum(docNum: string) {
      try {
         if (docNum) {
            this.docNumInput = '';
            let trxExist = this.lineObjects.findIndex(r => r.trxNum === docNum);
            if (trxExist > -1) {
               this.toastService.presentToast('Document already selected.', '', 'top', 'danger', 1000);
            } else {
               this.objectService.getLineDetailsByTrxNum(docNum).subscribe(response => {
                  this.lineObjects.push({
                     truckLoadingLineId: 0,
                     truckLoadingId: 0,
                     trxNum: response.trxNum,
                     trxId: response.trxId,
                     trxType: response.trxType,
                     customerName: response.customerName,
                     fromLocation: response.fromLocation,
                     toLocation: response.toLocation,
                     qty: response.qty,
                     totalCarton: response.totalCarton,
                     sequence: this.lineObjects.length
                  })
               }, error => {
                  console.log(error);
               })
            }
         }
         this.barcodeInput.nativeElement.focus();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  date part */

   date_active: boolean = false;

   date: any;
   date_value: Date;

   // Toggle date
   toggleDate() {
      this.date_active = this.date_active ? false : true;
   }

   // On date select
   onDateSelect(event: any) {
      let date = new Date(event.detail.value);
      this.date_value = this.commonService.convertUtcDate(date);
      this.date = format(date, 'MMM d, yyyy');
      this.date_active = false;
      this.bindDateTimeToForm();
   }

   bindDateTimeToForm() {
      this.objectForm.patchValue({ depositDateTime: new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), 0, 0, 0) })
   }

   /* #endregion */

   /* #region line delete */

   async presentDeleteAlert(rowIndex) {
      try {
         const alert = await this.alertController.create({
            cssClass: 'custom-alert',
            header: 'Are you sure to delete?',
            buttons: [
               {
                  text: 'OK',
                  role: 'confirm',
                  cssClass: 'danger',
                  handler: (data) => {
                     this.lineObjects.splice(rowIndex, 1);
                  },
               },
               {
                  text: 'Cancel',
                  role: 'cancel'
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   nextStep() {
      try {
         let object: TruckLoadingRoot = {
            header: this.objectForm.getRawValue(),
            details: this.lineObjects,
            otp: null
         }
         this.objectService.insertObject(object).subscribe(response => {
            if (response.status === 201) {
               let ret = response.body as TruckLoadingRoot;
               this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: ret.header.truckLoadingId
                  }
               }
               this.navController.navigateRoot('/transactions/truck-loading/truck-loading-detail', navigationExtras);
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: 'Are you sure to cancel?',
            subHeader: 'Changes made will be discard.',
            cssClass: 'custom-action-sheet',
            buttons: [
               {
                  text: 'Yes',
                  role: 'confirm',
               },
               {
                  text: 'No',
                  role: 'cancel',
               }]
         });
         await actionSheet.present();
         const { role } = await actionSheet.onWillDismiss();
         if (role === 'confirm') {
            this.navController.navigateBack('/transactions/truck-loading');
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   sendForDebug() {
      let object: TruckLoadingRoot = {
         header: this.objectForm.getRawValue(),
         details: this.lineObjects,
         otp: null
      }
      let jsonObjectString = JSON.stringify(object);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

}
