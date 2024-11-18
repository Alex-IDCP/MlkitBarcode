import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CreditInfo, CreditInfoDetails } from 'src/app/shared/models/credit-info';
import { MasterListDetails, ShippingInfo } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-quotation-header',
   templateUrl: './quotation-header.page.html',
   styleUrls: ['./quotation-header.page.scss'],
})
export class QuotationHeaderPage implements OnInit, ViewWillEnter {

   objectForm: FormGroup;

   customPopoverOptions: any = {
      message: 'Select one',
      cssClass: 'popover-in-modal'
   };

   constructor(
      public objectService: QuotationService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private formBuilder: FormBuilder,
   ) {
      this.newForm();
   }

   async ionViewWillEnter(): Promise<void> {

   }

   newForm() {
      try {
         this.objectForm = this.formBuilder.group({
            quotationId: [0],
            quotationNum: [null],
            salesAgentId: [null],
            trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
            typeCode: [null],
            customerId: [null, [Validators.required]],
            shipAddress: [null, [Validators.maxLength(500)]],
            shipPostCode: [null],
            shipPhone: [null],
            shipEmail: [null, [Validators.email]],
            shipFax: [null],
            shipAreaId: [null],
            shipMethodId: [null],
            attention: [null],
            termPeriodId: [null],
            locationId: [null],
            toLocationId: [null],
            countryId: [null],
            currencyId: [null],
            currencyRate: [null],
            quotationUDField1: [null],
            quotationUDField2: [null],
            quotationUDField3: [null],
            quotationUDOption1: [null],
            quotationUDOption2: [null],
            quotationUDOption3: [null],
            deactivated: [null],
            workFlowTransactionId: [null],
            masterUDGroup1: [null],
            masterUDGroup2: [null],
            masterUDGroup3: [null],
            isItemPriceTaxInclusive: [null],
            isDisplayTaxInclusive: [null],
            sourceType: ["M"],
            businessModelType: [null],
            remark: [null],
            isHomeCurrency: [null],
            isPricingApproval: [false],
            isAutoPromotion: [true],
            shipName: [null],
            priceSegmentCode: [null],
            uuid: [uuidv4()]
         });
      } catch (e) {
         console.error(e);
      }
      this.setDefaultValue();
   }

   ngOnInit() {

   }

   setDefaultValue() {
      try {
         let defaultShipMethod = this.objectService.shipMethodMasterList.find(r => r.isPrimary);
         if (defaultShipMethod) {
            this.objectForm.patchValue({ shipMethodId: defaultShipMethod.id });
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onCustomerConfirmation(event: SearchDropdownList) {
      if (event) {
         var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
         if (lookupValue) {
            if (lookupValue.attribute14 && this.objectForm.controls.customerId.value && this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
               if (lookupValue.attribute14 !== this.objectForm.controls.priceSegmentCode.value) {
                  const alert = await this.alertController.create({
                     cssClass: "custom-alert",
                     header: "Price Segment changes detected!",
                     subHeader: `Changing to this customer ${lookupValue.code} will remove item(s) in cart, this action cannot be undone.`,
                     buttons: [{
                        text: "Proceed",
                        cssClass: "danger",
                        handler: async () => {
                           await this.objectService.removeLine();
                           await this.onCustomerSelected(event);
                        },
                     },
                     {
                        text: "Cancel",
                        role: "cancel",
                        cssClass: "cancel",
                        handler: async () => {
                           this.onCustomerSelected({ id: this.objectForm.controls.customerId.value });
                        }
                     }]
                  });
                  await alert.present();
               } else {
                  this.onCustomerSelected(event);
               }
            } else {
               this.onCustomerSelected(event);
            }
         } else {
            this.toastService.presentToast("Unable to lookup Customer", "Please contact administrator", "top", "danger", 1000);
         }
      } else {
         if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Alert!",
               subHeader: `Unselect Customer will remove item(s) in cart, this action cannot be undone.`,
               buttons: [{
                  text: "Proceed",
                  cssClass: "danger",
                  handler: async () => {
                     await this.objectService.removeLine();
                     await this.onCustomerSelected(null);
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "cancel",
                  handler: async () => {
                     this.onCustomerSelected({ id: this.objectForm.controls.customerId.value });
                  }
               }]
            });
            await alert.present();
         } else {
            await this.onCustomerSelected(null);
         }
      }
   }

   @ViewChild("customersd", { static: false }) customersd: SearchDropdownPage;
   selectedCustomer: Customer;
   selectedCustomerLocationList: MasterListDetails[] = [];
   creditInfo: CreditInfo = { creditLimit: null, creditTerms: null, isCheckCreditLimit: null, isCheckCreditTerm: null, utilizedLimit: null, pendingOrderAmount: null, outstandingAmount: null, availableLimit: null, overdueAmount: null, pending: [], outstanding: [], overdue: [] };
   availableAddress: ShippingInfo[] = [];
   async onCustomerSelected(event: SearchDropdownList) {
      try {
         if (event) {
            var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
            var lookupValue2 = this.objectService.customers?.find(r => r.customerId === event.id);
            if (lookupValue != undefined) {
               this.objectForm.patchValue({ customerId: lookupValue.id });
               if (this.customersd) {
                  await this.customersd.manuallyTrigger();
               }
               this.objectForm.patchValue({ shipName: lookupValue.description });
               this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
               if (lookupValue.attributeArray1.length > 0) {
                  this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
               } else {
                  this.selectedCustomerLocationList = [];
               }
               this.objectForm.patchValue({
                  salesAgentId: parseFloat(lookupValue.attribute1),
                  termPeriodId: parseFloat(lookupValue.attribute2),
                  countryId: parseFloat(lookupValue.attribute3),
                  currencyId: parseFloat(lookupValue.attribute4),
                  locationId: parseFloat(lookupValue.attribute6),
                  priceSegmentCode: lookupValue.attribute14,
                  toLocationId: null,
                  isItemPriceTaxInclusive: lookupValue.attribute8 == "1" ? true : false,
                  isDisplayTaxInclusive: lookupValue.attribute9 == "1" ? true : false
               });

               this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList)

               await this.onCurrencySelected(lookupValue.attribute4);
               if (lookupValue.attribute5 == "T") {
                  this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectForm.controls["customerId"].value).flatMap(r => r.shippingInfo);
                  this.objectForm.controls.toLocationId.clearValidators();
                  this.objectForm.controls.toLocationId.updateValueAndValidity();
               } else {
                  this.availableAddress = [];
               }
               if (lookupValue.attributeArray1.length == 1) {
                  this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
               }
               //Auto map object type code
               if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
                  this.objectForm.patchValue({ typeCode: "S" });
               } else {
                  this.objectForm.patchValue({ typeCode: "T" });
               }
            }
            if (!this.objectService.disableTradeTransactionGenerateGL) {
               this.objectService.getCreditInfo(this.objectForm.controls.customerId.value).subscribe(response => {
                  if (response) {
                     this.creditInfo = response;
                  }
               })
            }
            if (lookupValue2) { // check here if the customer is universal, if yes, then assign to login's salesAgentId
               if (lookupValue2.isUniversal) {
                  this.objectForm.patchValue({ salesAgentId: this.configService.loginUser.salesAgentId });
               }
            }
         } else {
            this.objectForm.patchValue({ customerId: null });
            this.objectForm.patchValue({ shipName: null });
            this.objectForm.patchValue({ businessModelType: null });
            this.objectForm.patchValue({
               salesAgentId: null,
               termPeriodId: null,
               countryId: null,
               currencyId: null,
               locationId: null,
               toLocationId: null,
               isItemPriceTaxInclusive: null,
               isDisplayTaxInclusive: null
            });
            this.objectForm.patchValue({ toLocationId: null });
            this.objectForm.patchValue({ typeCode: null });
            this.onCurrencySelected(null);
            this.creditInfo = null;
         }
      } catch (e) {
         console.error(e);
      }
   }

   onCurrencySelected(event: any) {
      try {
         if (event) {
            var lookupValue = this.objectService.currencyMasterList?.find(e => e.id == event);
            if (lookupValue !== undefined) {
               this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
               if (lookupValue.attribute2 === "Y") {
                  this.objectForm.patchValue({ isHomeCurrency: true });
               } else {
                  this.objectForm.patchValue({ isHomeCurrency: false });
               }
            }
         } else {
            this.objectForm.patchValue({ currencyRate: null });
            this.objectForm.patchValue({ isHomeCurrency: null });
         }
      } catch (e) {
         console.error(e);
      }
   }

   displayModal: boolean = false;
   creditInfoType: string = "";
   tableValue: CreditInfoDetails[] = [];
   displayDetails(tableValue: CreditInfoDetails[], infoType: string) {
      try {
         this.displayModal = true;
         this.creditInfoType = infoType;
         this.tableValue = [];
         this.tableValue = [...tableValue];
      } catch (e) {
         console.log(e);
      }
   }

   hideItemModal() {
      this.displayModal = false;
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
            this.navController.navigateBack("/transactions/quotation");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         await this.objectService.setHeader(this.objectForm.getRawValue());
         this.navController.navigateForward("/transactions/quotation/quotation-item");
      } catch (e) {
         console.error(e);
      }
   }

}
