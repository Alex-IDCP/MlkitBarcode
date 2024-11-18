import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NavController, ActionSheetController, ModalController, ViewWillEnter, AlertController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CreditInfo, CreditInfoDetails } from 'src/app/shared/models/credit-info';
import { MasterListDetails, ShippingInfo } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-backtoback-order-header',
   templateUrl: './backtoback-order-header.page.html',
   styleUrls: ['./backtoback-order-header.page.scss'],
})
export class BacktobackOrderHeaderPage implements OnInit, ViewWillEnter {

   objectForm: FormGroup;

   customPopoverOptions: any = {
      message: "Select one",
      cssClass: "popover-in-modal"
   };

   constructor(
      public objectService: BackToBackOrderService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private formBuilder: UntypedFormBuilder,
      private modalController: ModalController
   ) {
      this.newForm();
   }

   async ionViewWillEnter(): Promise<void> {
      
   }

   newForm() {
      this.objectForm = this.formBuilder.group({
         backToBackOrderId: [0],
         backToBackOrderNum: [null],
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
         shipStateId: [null],
         shipMethodId: [null],
         attention: [null],
         termPeriodId: [null],
         locationId: [null],
         toLocationId: [null],
         countryId: [null],
         currencyId: [null],
         currencyRate: [null],
         backToBackOrderUDField1: [null],
         backToBackOrderUDField2: [null],
         backToBackOrderUDField3: [null],
         backToBackOrderUDOption1: [null],
         backToBackOrderUDOption2: [null],
         backToBackOrderUDOption3: [null],
         deactivated: [null],
         workFlowTransactionId: [null],
         masterUDGroup1: [null],
         masterUDGroup2: [null],
         masterUDGroup3: [null],
         isItemPriceTaxInclusive: [null],
         isDisplayTaxInclusive: [null],
         businessModelType: [null],
         remark: [null],
         isHomeCurrency: [null],
         status: [null],
         isCompleted: [null],
         posLocationId: [null],
         posLocationCode: [null],
         sourceType: ["M"],
         isAutoPromotion: [true],
         shipName: [null],
         priceSegmentCode: [null]
      });
   }

   ngOnInit() {

   }

   restrictFields: any = {};
   restrictTrxFields: any = {};
   loadRestrictColumms() {
      let restrictedObject = {};
      let restrictedTrx = {};
      this.authService.restrictedColumn$.subscribe(obj => {
         let apiData = obj.filter(x => x.moduleName === "SM" && x.objectName === "BackToBackOrder").map(y => y.fieldName);
         apiData.forEach(element => {
            Object.keys(this.objectForm.controls).forEach(ctrl => {
               if (element.toUpperCase() === ctrl.toUpperCase()) {
                  restrictedObject[ctrl] = true;
               }
            });
         });
         if (!this.authService.isAdmin && this.objectService.systemWideDisableDocumentNumber) {
            restrictedObject["backToBackOrderNum"] = true;
         }
         this.restrictFields = restrictedObject;
         let trxDataColumns = obj.filter(x => x.moduleName === "SM" && x.objectName === "BackToBackOrderLine").map(y => y.fieldName);
         trxDataColumns.forEach(element => {
            restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
         });
         this.restrictTrxFields = restrictedTrx;
      })
   }

   setDefaultValue() {
      let defaultTermPeriod = this.objectService.termPeriodMasterList.find(item => item.isPrimary)?.id;
      if (defaultTermPeriod) {
         this.objectForm.patchValue({ termPeriodId: defaultTermPeriod });
      }
      let defaultLocation = this.objectService.locationMasterList.find(item => item.isPrimary)?.id;
      if (defaultLocation) {
         this.objectForm.patchValue({ locationId: defaultLocation });
      }
      let defaultAgent = this.objectService.salesAgentMasterList.find(item => item.isPrimary)?.id;
      if (defaultAgent) {
         this.objectForm.patchValue({ salesAgentId: defaultAgent });
      }
      let defaultCountry = this.objectService.countryMasterList.find(item => item.isPrimary)?.id;
      if (defaultCountry) {
         this.objectForm.patchValue({ countryId: defaultCountry });
      }
      let defaultCurrency = this.objectService.currencyMasterList.find(item => item.isPrimary)
      if (defaultCurrency) {
         this.objectForm.patchValue({ currencyId: defaultCurrency.id });
         this.onCurrencySelected(defaultCurrency.id);
      }
      let defaultTypeCode = this.objectService.salesTypeList.find(item => item.isPrimary)?.code;
      if (defaultTypeCode) {
         this.objectForm.patchValue({ typeCode: defaultTypeCode });
      }
      let defaultShipMethod = this.objectService.shipMethodMasterList.find(r => r.isPrimary);
      if (defaultShipMethod) {
         this.objectForm.patchValue({ shipMethodId: defaultShipMethod.id });
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
   availableAddress: ShippingInfo[] = [];
   creditInfo: CreditInfo = { creditLimit: null, creditTerms: null, isCheckCreditLimit: null, isCheckCreditTerm: null, utilizedLimit: null, pendingOrderAmount: null, outstandingAmount: null, availableLimit: null, overdueAmount: null, pending: [], outstanding: [], overdue: [] };
   async onCustomerSelected(event: SearchDropdownList, ignoreCurrencyRate?: boolean) {
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
                  locationId: parseFloat(lookupValue.attribute6), 
                  priceSegmentCode: lookupValue.attribute14,
                  toLocationId: null, 
                  isItemPriceTaxInclusive: lookupValue.attribute8 === "1" ? true : false, isDisplayTaxInclusive: lookupValue.attribute9 === "1" ? true : false 
               });
               // this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList);
               if (!ignoreCurrencyRate) {
                  this.objectForm.patchValue({ currencyId: parseFloat(lookupValue.attribute4) });
               }

               this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList)
               this.onCurrencySelected(this.objectForm.controls.currencyId.value);
               if (lookupValue.attribute5 === "T") {
                  this.objectForm.controls.toLocationId.clearValidators();
                  this.objectForm.controls.toLocationId.updateValueAndValidity();
               }
               if (lookupValue.attributeArray1.length === 1) {
                  this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
               }
               //Auto map object type code
               if (lookupValue.attribute5 === "T" || lookupValue.attribute5 === "F") {
                  this.objectForm.patchValue({ typeCode: "S" });
                  this.objectForm.controls["typeCode"].disable();
               } else {
                  this.objectForm.patchValue({ typeCode: "T" });
                  this.objectForm.controls["typeCode"].disable();
               }
               this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectForm.controls["customerId"].value).flatMap(r => r.shippingInfo);// handle location
            }
            if (!this.objectService.disableTradeTransactionGenerateGL) {
               this.objectService.getCreditInfo(this.objectForm.controls.customerId.value).subscribe(response => {
                  if (response) {
                     this.creditInfo = response;
                  }
               })
            }
            if (this.objectService.salesActivatePromotionEngine) {
               // this.loadPromotion(this.objectForm.controls.customerId.value);
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
            var lookupValue = this.objectService.currencyMasterList?.find(e => e.id === event);
            if (lookupValue != undefined) {
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
         console.error(e);
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
            this.navController.navigateBack("/transactions/backtoback-order");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         await this.objectService.setHeader(this.objectForm.getRawValue());
         this.navController.navigateForward("/transactions/backtoback-order/backtoback-order-item");
      } catch (e) {
         console.error(e);
      }
   }

}
