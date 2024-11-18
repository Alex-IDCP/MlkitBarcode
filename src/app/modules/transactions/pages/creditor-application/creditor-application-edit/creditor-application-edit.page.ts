import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditorApplicationService } from '../../../services/creditor-application.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-creditor-application-edit',
   templateUrl: './creditor-application-edit.page.html',
   styleUrls: ['./creditor-application-edit.page.scss'],
})
export class CreditorApplicationEditPage implements OnInit {

   objectId: number;
   objectForm: FormGroup;

   constructor(
      private route: ActivatedRoute,
      public objectService: CreditorApplicationService,
      private commonService: CommonService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
      private formBuilder: FormBuilder
   ) {
      this.newObjectForm();
      this.route.queryParams.subscribe(params => {
         this.objectId = params['objectId'];
         if (!this.objectId) {
            this.navController.navigateBack('/transactions/creditor-application');
         }
      })
   }

   ngOnInit() {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
         let object = response;
         let objectHeader = this.commonService.convertObjectAllDateType(object.header);
         this.objectForm.patchValue(objectHeader);
      }, error => {
         console.error(error);
      })
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
         cancelDuration: [true],
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

   async cancelUpdate() {
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
            try {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectId
                  }
               }
               this.navController.navigateRoot('/transactions/creditor-application/creditor-application-detail', navigationExtras);
            } catch (e) {
               console.error(e);
            }
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
                        await this.updateObject();
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

   updateObject() {
      this.objectService.updateObject(this.objectForm.getRawValue()).subscribe(response => {
         if (response.status === 201) {
            this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
            try {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectId
                  }
               }
               this.navController.navigateRoot('/transactions/creditor-application/creditor-application-detail', navigationExtras);
            } catch (e) {
               console.error(e);
            }
         }
      }, error => {
         console.error(error);
      })
   }
}
