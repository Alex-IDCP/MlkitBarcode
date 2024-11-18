import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonPopover, IonSearchbar, NavController, ViewWillEnter } from '@ionic/angular';
import { BackToBackOrderRoot } from 'src/app/modules/transactions/models/backtoback-order';
import { OtherAmount } from 'src/app/modules/transactions/models/sales-order';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { GeneralTransactionService } from 'src/app/shared/services/general-transaction.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';

@Component({
   selector: 'app-backtoback-order-cart',
   templateUrl: './backtoback-order-cart.page.html',
   styleUrls: ['./backtoback-order-cart.page.scss'],
   providers: [GeneralTransactionService, { provide: 'apiObject', useValue: 'MobileBackToBackOrder' }]
})
export class BacktobackOrderCartPage implements OnInit, ViewWillEnter {

   Math: any;

   submit_attempt: boolean = false;
   inputType: string = "number";

   constructor(
      public objectService: BackToBackOrderService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private promotionEngineService: PromotionEngineService,
      private toastService: ToastService,
      private alertController: AlertController,
      private navController: NavController
   ) {
      this.Math = Math;
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ionViewWillEnter(): Promise<void> {
      // if (this.objectService.salesActivatePromotionEngine) {
      //    await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false, this.objectService.salesActivateTradingMargin)
      // }
      await this.validateMinOrderQty();
   }

   ngOnInit() {
      this.loadRestrictColumms();
      this.loadAvailableAddresses();
   }

   availableAddress: ShippingInfo[] = [];
   shippingInfo: ShippingInfo;
   loadAvailableAddresses() {
      try {
         this.availableAddress = [];
         if (this.objectService.objectHeader) {
            if (this.objectService.objectHeader.businessModelType === "T") {
               this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectService.objectHeader.customerId).flatMap(r => r.shippingInfo);
            } else {
               this.availableAddress = this.objectService.locationMasterList.filter(r => r.id === this.objectService.objectHeader.toLocationId).flatMap(r => r.shippingInfo);
            }
         }
         this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
         this.onAddressSelected();
      } catch (e) {
         console.error(e);
      }
   }

   restrictTrxFields: any = {};
   originalRestrictTrxFields: any = {};
   loadRestrictColumms() {
      try {
         let restrictedObject = {};
         let restrictedTrx = {};
         this.authService.restrictedColumn$.subscribe(obj => {
            let trxDataColumns = obj.filter(x => x.moduleName === "SM" && x.objectName === "BackToBackOrderLine").map(y => y.fieldName);
            trxDataColumns.forEach(element => {
               restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
            });
            this.restrictTrxFields = restrictedTrx;
            this.originalRestrictTrxFields = JSON.parse(JSON.stringify(this.restrictTrxFields));
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  extra info e.g. shipping and address */

   isExtraInfoModal: boolean = false;
   showExtraInfo() {
      this.isExtraInfoModal = true;
   }

   hideExtraInfo() {
      this.isExtraInfoModal = false;
   }

   selectedAddress: ShippingInfo;
   onAddressSelected() {
      try {
         if (this.selectedAddress) {
            this.objectService.objectHeader.shipAddress = this.selectedAddress.address;
            this.objectService.objectHeader.shipPostCode = this.selectedAddress.postCode;
            this.objectService.objectHeader.shipPhone = this.selectedAddress.phone;
            this.objectService.objectHeader.shipEmail = this.selectedAddress.email;
            this.objectService.objectHeader.shipFax = this.selectedAddress.fax;
            this.objectService.objectHeader.shipAreaId = this.selectedAddress.areaId;
            this.objectService.objectHeader.shipStateId = this.selectedAddress.stateId;
            this.objectService.objectHeader.attention = this.selectedAddress.attention;
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/backtoback-order/backtoback-order-item");
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         if (this.objectService.objectDetail.length > 0) {
            await this.validateMinOrderQty();
            if (this.objectService.objectDetail.filter(r => r.minOrderQtyError).length === 0) {
               const alert = await this.alertController.create({
                  header: "Are you sure to proceed?",
                  buttons: [
                     {
                        text: "OK",
                        cssClass: "success",
                        role: "confirm",
                        handler: async () => {
                           if (this.objectService.objectHeader.backToBackOrderId) {
                              await this.updateObject();
                           } else {
                              await this.insertObject();
                           }
                        },
                     },
                     {
                        text: "Cancel",
                        cssClass: "cancel",
                        role: "cancel",
                        handler: async () => {
                           this.submit_attempt = false;
                        }
                     },
                  ],
               });
               await alert.present();
            } else {
               // this.toastService.presentToast("Invalid Quantity", "Total requested quantity [" + Number(data.qtyRequest + totalQtyRequestOfSameItemInCart) + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
               this.toastService.presentToast("Invalid Quantity", `${this.objectService.objectDetail.find(r => r.minOrderQty).itemCode} does not meet minimum order quantity.`, "top", "warning", 1000);
            }
         } else {
            this.submit_attempt = false;
            this.toastService.presentToast("Control Error", "Please add at least 1 item to continue", "top", "warning", 1000);
         }
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   insertObject() {
      try {
         let trxDto: BackToBackOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
         this.objectService.insertObject(trxDto).subscribe(response => {
            let object = response.body as BackToBackOrderRoot;
            this.objectService.setSummary(object);
            this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/backtoback-order/backtoback-order-summary");
         }, error => {
            this.submit_attempt = false;
            console.error(error);
         });
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   updateObject() {
      try {
         let trxDto: BackToBackOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
            otherAmount: this.objectService.objectOtherAmt
         }
         trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
         this.objectService.updateObject(trxDto).subscribe(response => {
            let object = response.body as BackToBackOrderRoot;
            this.objectService.setSummary(object);
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
            this.navController.navigateRoot("/transactions/backtoback-order/backtoback-order-summary");
         }, error => {
            this.submit_attempt = false;
            console.error(error);
         });
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   /* #endregion */

   /* #region  misc */

   // highlight(event) {
   //    event.getInputElement().then(r => {
   //       r.select();
   //    })
   // }

   checkPricingApprovalLines(trxDto: BackToBackOrderRoot, trxLineArray: TransactionDetail[]) {
      if (trxDto.header.businessModelType === "R" || trxDto.header.businessModelType === "C") {
         trxDto.header.isPricingApproval = false;
      } else {
         trxLineArray.forEach(x => { x.isPricingApproval = false }); // cast all to false first, then only check again
         let filteredData = trxLineArray.filter(x => x.unitPrice != x.oriUnitPrice || x.unitPriceExTax != x.oriUnitPriceExTax || x.discountGroupCode != x.oriDiscountGroupCode || x.discountExpression != x.oriDiscountExpression);
         filteredData = filteredData.filter(x => !x.isPromoImpactApplied);
         if (filteredData.length > 0) {
            filteredData.forEach(x => { x.isPricingApproval = true });
            trxDto.header.isPricingApproval = true;
         } else {
            trxLineArray.forEach(x => { x.isPricingApproval = false });
            trxDto.header.isPricingApproval = false;
         }
      }
      return trxDto;
   }

   /* #endregion */

   /* #region check min order qty */

   validateMinOrderQty() {
      if (this.objectService.orderingActivateMOQControl) {
         if (this.objectService.objectHeader.businessModelType === "T" || this.objectService.objectHeader.businessModelType === "B") {
            this.objectService.objectDetail.forEach(data => {
               if (data.qtyRequest !== null && data.minOrderQty && data.qtyRequest < data.minOrderQty) {
                  let sameItemInCart = this.objectService.objectDetail.filter(r => r.itemId === data.itemId && r.uuid !== data.uuid);
                  let totalQtyRequestOfSameItemInCart = sameItemInCart.flatMap(r => (r.qtyRequest ?? 0)).reduce((a, c) => (a + c), 0);
                  if (sameItemInCart && totalQtyRequestOfSameItemInCart > 0) {
                     // check if qtyincart has same item if yes then check minorderqty again
                     if (data.qtyRequest !== null && data.minOrderQty && (data.qtyRequest + totalQtyRequestOfSameItemInCart) < data.minOrderQty) {
                        data.minOrderQtyError = true;
                     } else {
                        data.minOrderQtyError = false;
                     }
                  } else {
                     data.minOrderQtyError = true;
                  }
               } else {
                  data.minOrderQtyError = false;
               }
            })
         }
      }
   }

   /* #endregion */

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

   isPricingPopoverOpen: boolean = false;
   @ViewChild("pricingPopover", { static: false }) pricingPopover: IonPopover;
   showPricingPopover(event) {
      try {
         this.pricingPopover.event = event;
         this.isPricingPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

	/* #endregion */

	sendForDebug() {
		let trxDto: BackToBackOrderRoot = {
			header: this.objectService.objectHeader,
			details: this.objectService.objectDetail
		}
		let jsonObjectString = JSON.stringify(trxDto);
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

   onLineEditComplete(event: TransactionDetail[]) {
      this.objectService.objectDetail = JSON.parse(JSON.stringify(event));
   }

   onTrxOtherAmountEditComplete(event: OtherAmount[]) {
      this.objectService.setOtherAmt(event);
   }

   /* #region remark */

   remarkModal: boolean = false;
   remarkSearchText: string;
   remarkSearchDropdownList: SearchDropdownList[] = [];
   remarkTempDropdownList: SearchDropdownList[] = [];
   selectedRemark: SearchDropdownList;
   async showRemarkModal() {
      this.remarkSearchDropdownList = [];
      for await (const r of this.objectService.remarkMasterList) {
         this.remarkSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      }
      this.remarkTempDropdownList = this.remarkSearchDropdownList;
      this.remarkModal = true;
   }

   @ViewChild("remarkSearchBar", { static: false }) remarkSearchBar: IonSearchbar;
   setFocus() {
      if (this.remarkSearchBar) {
         this.remarkSearchBar.setFocus();
      }
   }

   async onRemarkKeyDown(event) {
      if (event.keyCode === 13) {
         await this.searchItem();
      }
   }

   startIndex: number = 0;
   readonly size: number = 20;
   searchItem() {
      this.startIndex = 0;
      this.remarkTempDropdownList = []
      this.assignToTemp(this.startIndex, this.size);
   }

   resetRemarkFilter() {
      this.remarkSearchText = "";
      this.startIndex = 0;
      this.remarkTempDropdownList = [];
      this.assignToTemp(this.startIndex, this.size);
   }

   assignToTemp(startIndex: number, size: number) {
      if (this.remarkSearchText && this.remarkSearchText.length > 0) {
         this.remarkTempDropdownList = [...this.remarkTempDropdownList, ...this.remarkSearchDropdownList.filter(r => r.code?.toLowerCase().includes(this.remarkSearchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.remarkSearchText.toLowerCase()) || r.description?.toLowerCase().includes(this.remarkSearchText.toLowerCase())).slice(this.startIndex, startIndex + size)];
         if (this.remarkTempDropdownList && this.remarkTempDropdownList.length === 1) {
            this.remarkChooseThis(this.remarkTempDropdownList[0]);
         }
      } else {
         this.remarkTempDropdownList = [...this.remarkTempDropdownList, ...this.remarkSearchDropdownList.slice(startIndex, startIndex + size)];
      }
   }

   remarkChooseThis(object: SearchDropdownList) {
      if (this.selectedRemark && this.selectedRemark.id === object.id) {
         this.hideRemarkModal(this.selectedRemark, false);
      } else {
         this.selectedRemark = object;
         this.hideRemarkModal(object, true);
      }
   }

   applyRemark() {
      this.hideRemarkModal(null);
   }

   clearRemark() {
      this.hideRemarkModal(null, true);
   }

   hideRemarkModal(object: SearchDropdownList, triggerOutput: boolean = false) {
      this.remarkSearchText = "";
      this.remarkTempDropdownList = [];
      if (object) {
         this.objectService.objectHeader.remark = object.description;
      } else {
         this.objectService.objectHeader.remark = null;
      }
      this.remarkModal = false;
   }

   /* #endregion */

}
