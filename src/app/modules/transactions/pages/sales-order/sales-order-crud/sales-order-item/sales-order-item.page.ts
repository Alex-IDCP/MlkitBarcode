import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import Decimal from 'decimal.js';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesItemInfoRoot } from 'src/app/shared/models/sales-item-info';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-sales-order-item',
   templateUrl: './sales-order-item.page.html',
   styleUrls: ['./sales-order-item.page.scss'],
   providers: [DatePipe, SearchItemService, { provide: 'apiObject', useValue: 'mobileSalesOrder' }]
})
export class SalesOrderItemPage implements OnInit, ViewWillEnter {

   constructor(
      public objectService: SalesOrderService,
      private authService: AuthService,
      private promotionEngineService: PromotionEngineService,
      private navController: NavController,
      private commonService: CommonService,
      private toastService: ToastService,
      private actionSheetController: ActionSheetController
   ) { }

   ionViewWillEnter(): void {
      // this.objectService.loadRequiredMaster();
      try {
         if (!this.objectService.objectHeader || this.objectService.objectHeader === undefined || this.objectService.objectHeader === null) {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
            this.navController.navigateBack("/transactions/sales-order/sales-order-header");
         }
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   async onItemAdded(event: TransactionDetail) {
      if (event.variationTypeCode === "0") {
         if (event.qtyRequest === null || event.qtyRequest === undefined || event.qtyRequest === 0) {
            return;
         }
      } else {
         if (event.variationDetails.flatMap(r => r.details).filter(r => ((r.qtyRequest ?? 0) !== 0)).length === 0) {
            return;
         }
      }
      try {
         let trxLine = JSON.parse(JSON.stringify(event));
         trxLine = this.assignTrxItemToDataLine(trxLine);
         if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
            await this.computeUnitPriceExTax(trxLine);
         } else {
            await this.computeUnitPrice(trxLine);
         }
         await this.objectService.objectDetail.push(trxLine);
         await this.computeAllAmount(this.objectService.objectDetail[0]);
         if (this.objectService.salesActivatePromotionEngine && this.objectService.objectHeader.isAutoPromotion && (this.objectService.objectHeader.businessModelType === "T" || this.objectService.objectHeader.businessModelType === "B")) {
            await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false, this.objectService.salesActivateTradingMargin)
         }
         await this.assignSequence();
         this.toastService.presentToast("", "Item added", "top", "success", 1000);
      } catch (e) {
         console.error(e);
      }
   }

   onHistoryCopied(event: SalesItemInfoRoot) {
      try {
         if (event) {
            if (this.objectService.objectSalesHistory === null || this.objectService.objectSalesHistory === undefined) {
               this.objectService.objectSalesHistory = [];
            }
            this.objectService.objectSalesHistory = [...this.objectService.objectSalesHistory, event];
         }
   } catch (e) {
         console.error(e);
      }
   }

   assignSequence() {
      let index = 0;
      this.objectService.objectDetail.forEach(r => {
         r.sequence = index;
         if (r.typeCode === "AS" && r.assembly && r.assembly.length > 0) {
            r.assembly.forEach(rr => {
               rr.sequence = index;
            })
         }
         index++;
      })
   }

   /* #region  toggle show image */

   showImage: boolean = false;
   toggleShowImage() {
      this.showImage = !this.showImage;
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

   /* #endregion */

   /* #region  tax handle here */

   async computeAllAmount(trxLine: TransactionDetail) {
      try {
         if (trxLine.assembly && trxLine.assembly.length > 0) {
            this.computeAssemblyQty(trxLine);
         }
         await this.computeDiscTaxAmount(trxLine);
         if (this.objectService.salesActivateTradingMargin) {
            this.computeTradingMarginAmount(trxLine);
         }
      } catch (e) {
         console.error(e);
      }
   }

   computeAssemblyQty(trxLine: TransactionDetail) {
      trxLine.assembly.forEach(assembly => {
         if (trxLine.qtyRequest) {
            assembly.qtyRequest = new Decimal(assembly.itemComponentQty).mul(trxLine.qtyRequest).toNumber();
         } else {
            assembly.qtyRequest = null;
         }
      });
   }

   computeTradingMarginAmount(trxLine: TransactionDetail) {
      trxLine = this.commonService.computeTradingMargin(trxLine, this.objectService.systemWideActivateTaxControl, trxLine.taxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax);
   }

   getVariationSum(trxLine: TransactionDetail) {
      try {
         if (trxLine.variationTypeCode === "1" || trxLine.variationTypeCode === "2") {
            trxLine.qtyRequest = trxLine.variationDetails.flatMap(r => r.details).filter(r => r.qtyRequest && r.qtyRequest > 0).flatMap(r => r.qtyRequest).filter(r => r > 0).reduce((a, c) => Number(a) + Number(c));
         }
      } catch (e) {
         console.error(e);
      }
   }

   computeUnitPriceExTax(trxLine: TransactionDetail) {
      try {
         trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);
         this.computeDiscTaxAmount(trxLine);
      } catch (e) {
         console.error(e);
      }
   }

   computeUnitPrice(trxLine: TransactionDetail) {
      try {
         trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);
         this.computeDiscTaxAmount(trxLine);
      } catch (e) {
         console.error(e);
      }
   }

   async computeDiscTaxAmount(trxLine: TransactionDetail) {
      try {
         await this.getVariationSum(trxLine);
         trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax);
      } catch (e) {
         console.error(e);
      }
   }

   assignTrxItemToDataLine(trxLine: TransactionDetail): TransactionDetail {
      console.log("🚀 ~ SalesOrderItemPage ~ assignTrxItemToDataLine ~ trxLine:", trxLine)
      try {
         trxLine.lineId = 0;
         trxLine.headerId = this.objectService.objectHeader.salesOrderId;
         if (this.objectService.systemWideActivateTaxControl) {
            if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
               trxLine.unitPrice = trxLine.itemPricing.unitPrice;
               trxLine.unitPriceExTax = this.commonService.computeAmtExclTax(new Decimal(trxLine.itemPricing.unitPrice ? trxLine.itemPricing.unitPrice : 0), trxLine.taxPct).toNumber();
            } else {
               trxLine.unitPrice = this.commonService.computeAmtInclTax(new Decimal(trxLine.itemPricing.unitPrice ? trxLine.itemPricing.unitPrice : 0), trxLine.taxPct).toNumber();
               trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
            }
         } else {
            trxLine.unitPrice = trxLine.itemPricing.unitPrice;
            trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
         }
         trxLine.discountGroupCode = trxLine.itemPricing.discountGroupCode;
         trxLine.discountExpression = trxLine.itemPricing.discountExpression;
         trxLine.unitPrice = this.commonService.roundToPrecision(trxLine.unitPrice, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);
         trxLine.unitPriceExTax = this.commonService.roundToPrecision(trxLine.unitPriceExTax, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);

         if (this.objectService.salesActivatePromotionEngine) {
            trxLine.uuid = uuidv4();
            let discPct = Number(trxLine.discountExpression?.replace("%", ""));
            if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
               trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPrice * ((100 - discPct) / 100), this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax) : trxLine.unitPrice;
            } else {
               trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPriceExTax * ((100 - discPct) / 100), this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax) : trxLine.unitPriceExTax;
            }
            if (trxLine.itemGroupInfo) {
               trxLine.brandId = trxLine.itemGroupInfo.brandId;
               trxLine.groupId = trxLine.itemGroupInfo.groupId;
               trxLine.seasonId = trxLine.itemGroupInfo.seasonId;
               trxLine.categoryId = trxLine.itemGroupInfo.categoryId;
               trxLine.deptId = trxLine.itemGroupInfo.deptId;
               trxLine.oriDiscId = trxLine.itemPricing.discountGroupId;
            }
         }        

         // for isPricingApproval
         trxLine.oriUnitPrice = trxLine.unitPrice;
         trxLine.oriUnitPriceExTax = trxLine.unitPriceExTax;
         trxLine.oriDiscountGroupCode = trxLine.discountGroupCode;
         trxLine.oriDiscountExpression = trxLine.discountExpression;

         //Handle Multi UOM
         if (trxLine.multiUom && trxLine.multiUom.length > 0) {
            let primaryUom = trxLine.multiUom.find(x => x.isPrimary == true);
            if (primaryUom) {
               trxLine.baseRatio = primaryUom.ratio;
               trxLine.uomRatio = primaryUom.ratio;
            } else {
               trxLine.baseRatio = 1;
               trxLine.uomRatio = 1;
            }
            trxLine.ratioExpr = "1";
            trxLine.uomMaster = [];
            trxLine.uomMaster = trxLine.multiUom;
         } else {
            trxLine.baseRatio = 1;
            trxLine.uomRatio = 1;
            trxLine.ratioExpr = "1";
            trxLine.uomMaster = [];
         }

         // update qtyToShip
         trxLine.qtyToShip = trxLine.qtyRequest;
         console.log("🚀 ~ SalesOrderItemPage ~ assignTrxItemToDataLine ~ trxLine:", trxLine)

         return trxLine;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  steps */

   async nextStep() {
      try {
         this.navController.navigateForward("/transactions/sales-order/sales-order-cart");
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/sales-order/sales-order-header");
      } catch (e) {
         console.error(e);
      }
   }

   async backToDetail() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
            subHeader: "Changes made will be discard.",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
                  cssClass: "danger",
               },
               {
                  text: "No",
                  role: "cancel",
               }]
         });
         await actionSheet.present();
         const { role } = await actionSheet.onWillDismiss();
         if (role === "confirm") {
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.objectHeader.salesOrderId,
                  isDraft: this.objectService.isDraft,
                  draftTransactionId: this.objectService.draftObject ? this.objectService.draftObject.draftTransactionId : null
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/sales-order/sales-order-detail", navigationExtras);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
