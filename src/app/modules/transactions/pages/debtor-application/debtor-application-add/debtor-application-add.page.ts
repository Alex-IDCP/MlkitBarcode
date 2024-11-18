import { Component, OnInit, ViewChild } from '@angular/core';
import { DebtorApplicationService } from '../../../services/debtor-application.service';
import { ActionSheetController, AlertController, IonPopover, NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

@Component({
   selector: 'app-debtor-application-add',
   templateUrl: './debtor-application-add.page.html',
   styleUrls: ['./debtor-application-add.page.scss'],
})
export class DebtorApplicationAddPage implements OnInit {

   objectForm: FormGroup;

   constructor(
      public objectService: DebtorApplicationService,
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
            this.navController.navigateBack('/transactions/debtor-application');
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
            this.navController.navigateRoot('/transactions/debtor-application');
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
