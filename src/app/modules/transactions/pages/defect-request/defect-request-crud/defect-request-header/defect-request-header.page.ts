import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { DefectRequestService } from 'src/app/modules/transactions/services/defect-request.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CopyFromSIHeader, CopyFromSILine } from 'src/app/shared/models/copy-from-si';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-defect-request-header',
   templateUrl: './defect-request-header.page.html',
   styleUrls: ['./defect-request-header.page.scss'],
})
export class DefectRequestHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;
   copyFromSIHeaderList: CopyFromSIHeader[] = [];
   copyFromSILineList: CopyFromSILine[] = [];

   constructor(
      public objectService: DefectRequestService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder
   ) {
      this.newForm();
   }

   ionViewWillEnter(): void {

   }

   ionViewDidEnter(): void {
      if (!this.objectService.object?.header?.defectRequestId) {
         this.setDefaultValue();
      }
   }

   ngOnInit() {

   }

   newForm() {
      this.objectForm = this.formBuilder.group({
         defectRequestId: [0],
         defectRequestNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
         typeCode: [null],
         customerId: [null],
         shipAddress: [null, [Validators.maxLength(500)]],
         shipPostCode: [null],
         shipPhone: [null],
         shipEmail: [null, [Validators.email]],
         shipFax: [null],
         shipName: [null],
         shipAreaId: [null],
         shipStateId: [null],
         attention: [null],
         locationId: [null],
         toLocationId: [null],
         countryId: [null],
         currencyId: [null],
         currencyRate: [null],
         defectRequestUDField1: [null],
         defectRequestUDField2: [null],
         defectRequestUDField3: [null],
         defectRequestUDOption1: [null],
         defectRequestUDOption2: [null],
         defectRequestUDOption3: [null],
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
         salesAgentId: [null],
         parentObject: [null],
         createdBy: [null],
         modifiedBy: [null],
         reasonId: [null],
         defectRequestCategoryId: [null],
      });
   }

   setDefaultValue() {
      let defaultLocation = this.objectService.fLocationMasterList.find(item => item.isPrimary)?.id;
      if (defaultLocation) {
         this.objectForm.patchValue({ locationId: defaultLocation });
      } else {
         let findWh = this.objectService.fLocationMasterList.find(r => r.attribute1 === "W");
         if (findWh) {
            this.objectForm.patchValue({ locationId: findWh.id });
         }
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
   }

   selectedCustomerLocationList: MasterListDetails[] = [];
   onCustomerSelected(event: SearchDropdownList, ignoreCurrencyRate?: boolean) {
      if (event) {
         this.copyFromSIHeaderList = [];
         var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
         if (lookupValue) {
            this.objectForm.patchValue({ customerId: lookupValue.id });
            this.objectForm.patchValue({ shipName: lookupValue.description });
            this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
            if (lookupValue.attributeArray1.length > 0) {
               this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
            } else {
               this.selectedCustomerLocationList = [];
            }
            this.objectForm.patchValue({ salesAgentId: parseFloat(lookupValue.attribute1), countryId: parseFloat(lookupValue.attribute3), isItemPriceTaxInclusive: lookupValue.attribute8 === "1" ? true : false, isDisplayTaxInclusive: lookupValue.attribute9 === "1" ? true : false });

            this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList)

            if (!ignoreCurrencyRate) {
               this.objectForm.patchValue({ currencyId: parseFloat(lookupValue.attribute4) });
            }
            this.onCurrencySelected(this.objectForm.controls.currencyId.value);
            if (lookupValue.attribute5 === "T") {
               this.objectForm.patchValue({ locationId: parseInt(lookupValue.attribute6), toLocationId: null });
               this.objectForm.controls.toLocationId.clearValidators();
               this.objectForm.controls.toLocationId.updateValueAndValidity();
               if (lookupValue.attribute10) {
                  this.objectForm.patchValue({ masterUDGroup1: parseInt(lookupValue.attribute10) });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup1 = parseInt(lookupValue.attribute10));
                  }
               } else {
                  this.objectForm.patchValue({ masterUDGroup1: null });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup1 = null);
                  }
               }
               if (lookupValue.attribute12) {
                  this.objectForm.patchValue({ masterUDGroup2: parseInt(lookupValue.attribute12) });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup2 = parseInt(lookupValue.attribute12));
                  }
               } else {
                  this.objectForm.patchValue({ masterUDGroup2: null });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup2 = null);
                  }
               }
               if (lookupValue.attribute13) {
                  this.objectForm.patchValue({ masterUDGroup3: parseInt(lookupValue.attribute13) });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup3 = parseInt(lookupValue.attribute13));
                  }
               } else {
                  this.objectForm.patchValue({ masterUDGroup3: null });
                  if (this.objectService.object?.details?.length > 0) {
                     this.objectService.object?.details?.forEach(r => r.masterUDGroup3 = null);
                  }
               }
            } else {
               this.objectForm.patchValue({ toLocationId: null });
            }
            if (lookupValue.attributeArray1.length === 1) {
               this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
            }
            //Auto map object type code
            if (lookupValue.attribute5 === "T" || lookupValue.attribute5 === "F" || lookupValue.attribute5 === "B") {
               this.objectForm.patchValue({ typeCode: "S" });
               this.objectForm.controls["typeCode"].disable();
            } else {
               this.objectForm.patchValue({ typeCode: "T" });
               this.objectForm.controls["typeCode"].disable();
            }
            this.objectService.fLocationMasterList = this.objectService.locationMasterList;
         }
      }
      else {
         this.objectForm.patchValue({ customerId: null });
         this.objectForm.patchValue({ businessModelType: null });
         this.selectedCustomerLocationList = [];
         this.objectForm.patchValue({ salesAgentId: null, countryId: null, isItemPriceTaxInclusive: null, isDisplayTaxInclusive: null });
         this.objectForm.patchValue({ locationId: null, toLocationId: null });
         this.objectForm.patchValue({ masterUDGroup1: null });
         this.objectForm.patchValue({ masterUDGroup2: null });
         this.objectForm.patchValue({ masterUDGroup3: null });
         if (this.objectService.object?.details?.length > 0) {
            this.objectService.object?.details?.forEach(r => r.masterUDGroup1 = null);
            this.objectService.object?.details?.forEach(r => r.masterUDGroup2 = null);
            this.objectService.object?.details?.forEach(r => r.masterUDGroup3 = null);
         }
         this.objectForm.patchValue({ typeCode: null });
      }
   }

   onCurrencySelected(event: any) {
      var lookupValue = this.objectService.currencyMasterList?.find(e => e.id === event);
      if (lookupValue) {
         this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
         if (lookupValue.attribute2 === "Y") {
            this.objectForm.patchValue({ isHomeCurrency: true });
            this.objectForm.controls.currencyRate.disable();
         } else {
            this.objectForm.patchValue({ isHomeCurrency: false });
            this.objectForm.controls.currencyRate.enable();
            this.commonService.lookUpCurrency(this.objectForm, this.objectService.currencyMasterList);
         }
      }
   }

   onLocationSelected(event: SearchDropdownList) {
      if (event) {
         if (this.objectService.object?.details?.length > 0) {
            this.objectForm.patchValue({ locationId: event.id });
            this.objectService.object?.details?.forEach(r => r.locationId = event.id);
         }
      } else {
         if (this.objectService.object?.details?.length > 0) {
            this.objectForm.patchValue({ locationId: null });
            this.objectService.object?.details?.forEach(r => r.locationId = null);
         }
      }
   }

   onCustomerLocationSelected(event: any) {
      let lookupValue = this.objectService.locationMasterList.find(r => r.id === this.objectForm.controls["toLocationId"].value);
      //To patch location id if selected location is mapped to location warehouse
      if (lookupValue && lookupValue.attribute15) {
         this.objectForm.patchValue({ locationId: parseInt(lookupValue.attribute15) });
      } else {
         this.objectForm.patchValue({ locationId: null });
      }
   }

   onReasonSelected(event: SearchDropdownList) {
      if (event) {
         let found = this.objectService.reasonMasterList.find(r => r.id === event.id);
         if (found) {
            this.objectForm.patchValue({ reasonId: found.id });
         } else {
            this.toastService.presentToast("System Error", "Reason not found", "top", "danger", 1000);
         }
      } else {
         this.objectForm.patchValue({ reasonId: null });
      }
   }

   onCategorySelected(event: SearchDropdownList) {
      if (event) {
         let found = this.objectService.defectRequestCategoryMasterList.find(r => r.id === event.id);
         if (found) {
            this.objectForm.patchValue({ defectRequestCategoryId: found.id });
         } else {
            this.toastService.presentToast("System Error", "Category not found", "top", "danger", 1000);
         }
      } else {
         this.objectForm.patchValue({ defectRequestCategoryId: null });
      }
   }


   async copyFromSI() {
      this.copyFromSIHeaderList = [];
      if (this.objectForm.controls.customerId.value) {
         this.objectService.getSIListByCustomerId(this.objectForm.controls.customerId.value).subscribe({
            next: (response) => {
               this.copyFromSIHeaderList = response;
            },
            error: (error) => {
               console.error(error);
            }
         })
      } else {
         this.toastService.presentToast("Control Error", "Please select Customer", "top", "warning", 1000);
      }
   }

   selectSI(rowData: CopyFromSIHeader) {
      this.copyFromSIHeaderList.filter(r => r.salesInvoiceId !== rowData.salesInvoiceId).forEach(r => {
         r.isSelected = false;
      })
      rowData.isSelected = !rowData.isSelected;
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
            this.navController.navigateBack("/transactions/defect-request");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         if (this.copyFromSIHeaderList && this.copyFromSIHeaderList.filter(r => r.isSelected).length > 0) {
            this.objectService.getSIDetail(this.copyFromSIHeaderList.find(r => r.isSelected).salesInvoiceId).subscribe({
               next: (response) => {
                  this.copyFromSILineList = response;
                  this.showSILinePreview();
               },
               error: (error) => {
                  console.error(error);
               }
            })
         } else {
            this.objectForm.patchValue({ parentObject: null });
            this.objectForm.patchValue({ workFlowTransactionId: null })
            this.objectService.setObject({ header: this.objectForm.getRawValue(), details: this.objectService.object?.details ?? [] });
            this.navController.navigateForward("/transactions/defect-request/defect-request-item");
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

   /* #region copy from si line preview */   

   isModalOpen: boolean = false;
   showSILinePreview() {
      this.isModalOpen = true;
   }

   hidePreviewModal() {
      this.isModalOpen = false;
   }

   async onModalHide() {
      
   }

   async proceedWithSI() {
      await this.hidePreviewModal();
      this.objectForm.patchValue({ parentObject: "SM_SalesInvoice"});
      // this.objectForm.patchValue({ workFlowTransactionId: this.copyFromSIHeaderList.find(r => r.isSelected)?.workFlowTransactionId });
      this.objectService.setObject({ header: this.objectForm.getRawValue(), details: this.objectService.object?.details ?? [] });
      await this.transformCopyFromSI(this.copyFromSILineList);
      setTimeout(() => {
         this.navController.navigateForward("/transactions/defect-request/defect-request-item");         
      }, 50);
   }

   transformCopyFromSI(data: CopyFromSILine[]) {
      // check if already inserted
      data.filter(r => !this.objectService.object?.details?.flatMap(rr => rr.parentLineId).includes(r.salesInvoiceLineId)).forEach((r, index) => {
         this.objectService.object?.details?.push({
            lineId: 0,
            headerId: this.objectService.object?.header?.defectRequestId,
            locationId: r.locationId,
            itemId: r.itemId,
            itemCode: r.itemCode,
            description: r.description,
            extendedDescription: r.extendedDescription,
            itemUomId: r.itemUomId,
            qtyRequest: r.qtyRequest,
            unitPrice: r.unitPrice,
            discountGroupCode: r.discountGroupCode,
            discountExpression: r.discountExpression,
            discountAmt: null,
            subTotal: null,
            remark: null,
            lineUDDate: null,
            masterUDGroup1: r.masterUDGroup1 ? r.masterUDGroup1 : (this.objectForm.controls.masterUDGroup1.value ? this.objectForm.controls.masterUDGroup1.value : null),
            masterUDGroup2: r.masterUDGroup2 ? r.masterUDGroup2 : (this.objectForm.controls.masterUDGroup2.value ? this.objectForm.controls.masterUDGroup2.value : null),
            masterUDGroup3: r.masterUDGroup3 ? r.masterUDGroup3 : (this.objectForm.controls.masterUDGroup3.value ? this.objectForm.controls.masterUDGroup3.value : null),
            parentId: r.salesInvoiceId,
            parentLineId: r.salesInvoiceLineId,
            parentNum: r.salesInvoiceNum,
            sequence: index,
            variationTypeCode: r.variationTypeCode,
            variationDetails: r.variationDetails,
            variationX: r.variationX,
            variationY: r.variationY
         })
      })
   }

   /* #endregion */

}
