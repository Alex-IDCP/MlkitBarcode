import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-consignment-sales-header',
   templateUrl: './consignment-sales-header.page.html',
   styleUrls: ['./consignment-sales-header.page.scss'],
})
export class ConsignmentSalesHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;

   constructor(
      public objectService: ConsignmentSalesService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private formBuilder: FormBuilder
   ) {
      this.newObjectForm();
   }

   async ionViewWillEnter(): Promise<void> {
      if (this.objectService.objectHeader && this.objectService.objectHeader.consignmentSalesId > 0) {
         this.objectForm.patchValue(this.objectService.objectHeader);
         this.onTrxDateSelected(this.objectService.objectHeader.trxDate);         
      } else {
         await this.setFormattedDateString();
      }
   }

   ionViewDidEnter(): void {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         consignmentSalesId: [0],
         consignmentSalesNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         customerId: [null],
         locationId: [null],
         toLocationId: [this.configService.selected_location ?? 0, [Validators.required]],
         toLocationCode: [null, [Validators.required]],
         currencyId: [null],
         currencyRate: [null],
         salesAgentId: [null],
         isHomeCurrency: [null],
         isItemPriceTaxInclusive: [null],
         isDisplayTaxInclusive: [null],
         maxPrecision: [null],
         maxPrecisionTax: [null],
         sourceType: ["M"],
         typeCode: ["S"],
         businessModelType: [null],
         isBearPromo: [null],
         marginMode: [null],
         grossPromoMarginCategoryCode: [null],
         isEntryCompleted: [false],
         uuid: [uuidv4()]
      })
      if (this.configService.selected_location) {
         let findLocation = this.objectService.locationMasterList.find(r => r.id === this.configService.selected_location);
         let customerId = Number(this.objectService.locationMasterList.find(r => r.id === this.configService.selected_location)?.attribute13);
         if (customerId) {
            this.onCustomerChanged(customerId)
         }
         this.onLocationChanged({ id: this.configService.selected_location, code: findLocation.code });
      }
   }

   ngOnInit() {
      this.bindMasterList();
   }
   
   customerSearchDropdownList: SearchDropdownList[] = [];
   salesAgentSearchDropdownList: SearchDropdownList[] = [];
   bindMasterList() {
      try {
         this.objectService.customerMasterList.forEach(r => {
            this.customerSearchDropdownList.push({
               id: r.id,
               code: r.code,
               description: r.description
            })
         })
         this.objectService.salesAgentMasterList.forEach(r => {
            this.salesAgentSearchDropdownList.push({
               id: r.id,
               code: r.code,
               description: r.description
            })
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
      this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`) });
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

   onCustomerChanged(customerId: number) {
      try {
         if (customerId) {
            let lookupValue = this.objectService.customerMasterList.find(r => r.id === customerId);
            if (lookupValue) {
               this.objectForm.patchValue({ customerId: lookupValue.id });
               this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
               this.objectForm.patchValue({
                  // salesAgentId: parseFloat(lookupValue.attribute1),
                  currencyId: parseFloat(lookupValue.attribute4),
                  isItemPriceTaxInclusive: lookupValue.attribute8 === "1" ? true : false,
                  isDisplayTaxInclusive: lookupValue.attribute9 === "1" ? true : false
               });
               this.onCurrencySelected(lookupValue.attribute4);
               if (lookupValue.attribute5 === "T") {
                  this.objectForm.controls.toLocationId.clearValidators();
                  this.objectForm.controls.toLocationId.updateValueAndValidity();
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   onCurrencySelected(event) {
      try {
         if (event) {
            var lookupValue = this.objectService.currencyMasterList?.find(e => e.id === event);
            if (lookupValue != undefined) {
               this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
               if (lookupValue.attribute2 === "Y") {
                  this.objectForm.patchValue({ isHomeCurrency: true });
                  this.objectForm.patchValue({ maxPrecision: this.objectService.precisionSales.localMax });
                  this.objectForm.patchValue({ maxPrecisionTax: this.objectService.precisionTax.localMax });
               } else {
                  this.objectForm.patchValue({ isHomeCurrency: false });
                  this.objectForm.patchValue({ maxPrecision: this.objectService.precisionSales.foreignMax });
                  this.objectForm.patchValue({ maxPrecisionTax: this.objectService.precisionTax.foreignMax });
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onLocationChanged(event: SearchDropdownList) {
      if (event) {
         let findLocation = this.objectService.fullLocationMasterList.find(x => x.id === event.id);
         if (findLocation) {
            this.objectForm.patchValue({ toLocationId: findLocation.id, toLocationCode: findLocation.code, salesAgentId: parseInt(findLocation.attribute17) });
            if (findLocation.attribute13) {
               let findCustomer = this.objectService.customerMasterList.find(x => x.id === parseInt(findLocation.attribute13));
               if (!findCustomer) {
                  this.objectForm.patchValue({ toLocationId: null, customerId: null });
                  this.toastService.presentToast("Selection Denied", findLocation.description + " is not mapped to consignment customer.", "top", "warning", 1000);
               } else {
                  this.objectForm.patchValue({ customerId: parseInt(findLocation.attribute13) });
                  this.objectForm.controls["customerId"].disable();
               }
            } else {
               this.objectForm.patchValue({ toLocationId: null, customerId: null });
               this.objectForm.controls["customerId"].enable();
               this.toastService.presentToast("Selection Denied", findLocation.description + " is not mapped to any customer.", "top", "warning", 1000);
            }
            this.onCustomerChanged(this.objectForm.controls.customerId.value);
            this.objectForm.patchValue({
               toLocationId: findLocation.id,
               toLocationCode: findLocation.code,
               isBearPromo: findLocation.attribute6 === "1" ? true : false,
               marginMode: findLocation.attribute8,
               grossPromoMarginCategoryCode: findLocation.attribute22
            })
         }
      } else {
         this.objectForm.patchValue({
            isBearPromo: null,
            marginMode: null,
            grossPromoMarginCategoryCode: null
         })
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
            if (this.objectService.objectHeader && this.objectService.objectHeader.consignmentSalesId > 0) {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.consignmentSalesId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
            }
            else {
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales");
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         if (this.objectForm.valid) {
            this.objectService.setHeader(this.objectForm.getRawValue());
            this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-item");
         }
      } catch (e) {
         console.error(e);
      }
   }

}
