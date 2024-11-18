import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditorApplicationService } from '../../../services/creditor-application.service';
import { ActionSheetController, AlertController, IonPopover, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

@Component({
   selector: 'app-creditor-application-add',
   templateUrl: './creditor-application-add.page.html',
   styleUrls: ['./creditor-application-add.page.scss'],
})
export class CreditorApplicationAddPage implements OnInit {

   objectForm: FormGroup;

   constructor(
      public objectService: CreditorApplicationService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
      private formBuilder: FormBuilder
   ) {
      this.newObjectForm();
   }

   ngOnInit() {
      this.setDefaultValue();
   }

   defaultCountry: MasterListDetails = null;
   setDefaultValue() {
      this.defaultCountry = null;
      if (this.objectService.countryMasterList && this.objectService.countryMasterList.length > 0) {
         let defaultCountry = this.objectService.countryMasterList.find(r => r.isPrimary);
         if (defaultCountry) {
            this.defaultCountry = defaultCountry;
         }
      }
   }

   newObjectForm() {
      let loginUser = JSON.parse(localStorage.getItem('loginUser'));
      this.objectForm = this.formBuilder.group({
         vendorPreId: [0],
         vendorPreCode: [null, [Validators.maxLength(100)]],
         typeCode: [null, [Validators.required]],
         name: [null, [Validators.required, Validators.maxLength(100)]],
         companyRegNum: [null, [Validators.maxLength(20)]],
         oldVendorCode: [null],
         purchaseTaxId: [null],
         taxNum: [null, [Validators.maxLength(20)]],
         currencyId: [null],
         stateId: [null],
         countryId: [null],
         paymentMethodId: [null],
         bankAcct: [null, [Validators.maxLength(100)]],
         controlAccountId: [null, [Validators.maxLength(20)]],
         locationId: [null],
         procurementAgentId: [loginUser.procurementAgentId],
         termPeriodId: [null],
         addPDLimit: [null],
         creditLimit: [null],
         email: [null, [Validators.maxLength(100)]],
         phone: [null, [Validators.maxLength(100)]],
         fax: [null, [Validators.maxLength(100)]],
         salesEmailAddress: [null, [Validators.maxLength(100)]],
         internalPurchaserEmailAddress: [null, [Validators.maxLength(100)]],
         billAddress: [null, [Validators.maxLength(500)]],
         billPostcode: [null, [Validators.maxLength(10)]],
         billContact: [null, [Validators.maxLength(100)]],
         billAreaId: [null, [Validators.maxLength(20)]],
         shipAddress: [null, [Validators.maxLength(500)]],
         shipPostcode: [null, [Validators.maxLength(10)]],
         shipContact: [null, [Validators.maxLength(100)]],
         shipAreaId: [null, [Validators.maxLength(20)]],
         masterUDGroup1: [null],
         masterUDGroup2: [null],
         masterUDGroup3: [null],
         vendorUDField1: [null, [Validators.maxLength(100)]],
         vendorUDField2: [null, [Validators.maxLength(100)]],
         vendorUDField3: [null, [Validators.maxLength(100)]],
         vendorUDOption1: [null],
         vendorUDOption2: [null],
         vendorUDOption3: [null],
         sequence: [null],
         deactivated: [null],
         isPrimary: [false],
         isItemPriceTaxInclusive: [false],
         isDisplayTaxInclusive: [false],
         etaDuration: [null],
         etdDuration: [null],
         cancelDuration: [null],
         isLocal: [false],
         purchaseControlAccountId: [null],
         isBearPromo: [null],
         isBearShortOver: [null],
         marginMode: [null],
         invoiceMode: [null],
         shortName: [null, [Validators.maxLength(20)]],
         payeeName: [null],
         payeeIdNum: [null],
         payeeEmail: [null],
         isPosVisible: [false],
         isAutoClosePO: [null],
         remark: [null],
         isCompletelyFilled: [null],
         vendorId: [null],
         workFlowTransactionId: [null],
         sourceType: ['M']
      })
   }

   onTypeCodeSelected(event) {
      this.objectForm.patchValue({ typeCode: event.code });
      this.objectForm.updateValueAndValidity();
   }

   onCountrySelected(event) {
      this.objectForm.patchValue({ countryId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   onStateSelected(event) {
      this.objectForm.patchValue({ stateId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   onTermPeriodSelected(event) {
      this.objectForm.patchValue({ termPeriodId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   onBillAreaSelected(event) {
      this.objectForm.patchValue({ billAreaId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   onShipAreaSelected(event) {
      this.objectForm.patchValue({ shipAreaId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   applyToShipping() {
      this.objectForm.patchValue({
         shipAddress: this.objectForm.controls.billAddress.value,
         shipPostcode: this.objectForm.controls.billPostcode.value,
         shipContact: this.objectForm.controls.billContact.value,
         shipAreaId: this.objectForm.controls.billAreaId.value,
      });
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
            this.navController.navigateBack('/transactions/creditor-application');
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      if (this.objectForm.valid) {
         try {
            const alert = await this.alertController.create({
               header: 'Are you sure to proceed?',
               buttons: [
                  {
                     text: 'OK',
                     cssClass: 'success',
                     role: 'confirm',
                     handler: async () => {
                        await this.insertObject();
                     },
                  },
                  {
                     text: 'Cancel',
                     cssClass: 'cancel',
                     role: 'cancel'
                  },
               ],
            });
            await alert.present();
         } catch (e) {
            console.error(e);
         }
      }
   }

   insertObject() {
      this.objectService.insertObject(this.objectForm.getRawValue()).subscribe(response => {
         if (response.status === 201) {
            this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
            this.navController.navigateRoot('/transactions/creditor-application');
         }
      }, error => {
         console.error(error);
      })
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
      let jsonObjectString = JSON.stringify(this.objectForm.getRawValue());
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
