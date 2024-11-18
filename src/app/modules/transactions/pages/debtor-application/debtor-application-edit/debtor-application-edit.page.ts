import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController, AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { DebtorApplicationService } from '../../../services/debtor-application.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-debtor-application-edit',
   templateUrl: './debtor-application-edit.page.html',
   styleUrls: ['./debtor-application-edit.page.scss'],
})
export class DebtorApplicationEditPage implements OnInit {

   objectId: number;
   objectForm: FormGroup;

   constructor(
      private route: ActivatedRoute,
      public objectService: DebtorApplicationService,
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
            this.navController.navigateBack('/transactions/debtor-application');
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
         customerPreId: [0],
         customerPreCode: [null, [Validators.maxLength(100)]],
         businessModelType: [null],
         name: [null, [Validators.required, Validators.maxLength(100)]],
         companyRegNum: [null, [Validators.maxLength(20)]],
         oldCustomerCode: [null],
         supplyTaxId: [null],
         taxNum: [null, [Validators.maxLength(20)]],
         currencyId: [null],
         stateId: [null],
         countryId: [null],
         paymentMethodId: [null],
         bankAcct: [null, [Validators.maxLength(100)]],
         controlAccountId: [null, [Validators.maxLength(20)]],
         locationId: [null],
         salesAgentId: [loginUser.salesAgentId],
         latestSalesAgentId: [{ value: null, disabled: true }],
         termPeriodId: [null],
         gracePeriodInDay: [null],
         priceSegmentCode: [null],
         creditLimit: [null],
         outstanding: [null],
         addPDLimit: [null],
         statementType: [null, [Validators.maxLength(20)]],
         billEmail: [null, [Validators.maxLength(100), Validators.email]],
         billPhone: [null, [Validators.maxLength(100)]],
         billFax: [null, [Validators.maxLength(100)]],
         shipEmail: [null, [Validators.maxLength(100), Validators.email]],
         shipPhone: [null, [Validators.maxLength(100)]],
         shipFax: [null, [Validators.maxLength(100)]],
         billDescription: [null, [Validators.maxLength(100)]],
         billAddress: [null, [Validators.maxLength(500)]],
         billPostCode: [null, [Validators.maxLength(10)]],
         billAreaId: [null, [Validators.maxLength(20)]],
         billStateId: [null],
         shipDescription: [null, [Validators.maxLength(100)]],
         shipAddress: [null, [Validators.maxLength(500)]],
         shipPostCode: [null, [Validators.maxLength(10)]],
         shipAreaId: [null, [Validators.maxLength(20)]],
         shipStateId: [null],
         masterUDGroup1: [null],
         customerUDField1: [null, [Validators.maxLength(100)]],
         customerUDField2: [null, [Validators.maxLength(100)]],
         customerUDField3: [null, [Validators.maxLength(100)]],
         customerUDOption1: [null],
         customerUDOption2: [null],
         customerUDOption3: [null],
         billAttention: [null, [Validators.maxLength(100)]],
         shipAttention: [null, [Validators.maxLength(100)]],
         sequence: [null],
         deactivated: [null],
         isPrimary: [false],
         isItemPriceTaxInclusive: [false],
         isDisplayTaxInclusive: [false],
         isPosVisible: [null],
         isCheckCreditLimit: [true],
         isCheckCreditTerm: [true],
         isLocal: [false],
         isMonthEndDueDate: [false],
         salesControlAccountId: [null],
         remark: [null],
         isCompletelyFilled: [null],
         customerId: [null],
         workFlowTransactionId: [null],
         sourceType: ['M']
      })
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

   onBillStateSelected(event) {
      this.objectForm.patchValue({ billStateId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   onShipStateSelected(event) {
      this.objectForm.patchValue({ shipStateId: event.id });
      this.objectForm.updateValueAndValidity();
   }

   applyToShipping() {
      this.objectForm.patchValue({
         shipAddress: this.objectForm.controls.billAddress.value,
         shipAttention: this.objectForm.controls.billAttention.value,
         shipEmail: this.objectForm.controls.billEmail.value,
         shipPhone: this.objectForm.controls.billPhone.value,
         shipStateId: this.objectForm.controls.billStateId.value,
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
               this.navController.navigateRoot('/transactions/debtor-application/debtor-application-detail', navigationExtras);
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
               this.navController.navigateRoot('/transactions/debtor-application/debtor-application-detail', navigationExtras);
            } catch (e) {
               console.error(e);
            }
         }
      }, error => {
         console.error(error);
      })
   }

   test(event) {
      console.log("🚀 ~ DebtorApplicationEditPage ~ test ~ event:", event)
      if (event.target.value) {         
         event.target.value = Intl.NumberFormat("en-EN", { minimumFractionDigits: 2 }).format(Number(event.target.value.replaceAll(",", "")));
      }
   }

}
