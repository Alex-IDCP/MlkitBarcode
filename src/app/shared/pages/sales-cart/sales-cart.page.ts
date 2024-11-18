import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, asNativeElements } from '@angular/core';
import { TransactionDetail } from '../../models/transaction-detail';
import { SalesHistoryInfo, SalesItemInfoRoot } from '../../models/sales-item-info';
import { AlertController, IonInput, IonPopover, ModalController } from '@ionic/angular';
import { ItemSalesHistoryPage } from '../item-sales-history/item-sales-history.page';
import { MasterListDetails } from '../../models/master-list-details';
import { PrecisionList } from '../../models/precision-list';
import { PromotionMaster } from '../../models/promotion-engine';
import { PromotionEngineService } from '../../services/promotion-engine.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../services/common.service';
import Decimal from 'decimal.js';
import { Capacitor } from '@capacitor/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { InnerVariationDetail } from '../../models/variation-detail';
import { GeneralTransactionService } from '../../services/general-transaction.service';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from '../../models/module-control';
import { OtherAmount } from 'src/app/modules/transactions/models/sales-order';

@Component({
   selector: 'app-sales-cart',
   templateUrl: './sales-cart.page.html',
   styleUrls: ['./sales-cart.page.scss'],
})
export class SalesCartPage implements OnInit, OnChanges {

   Math: any;

   inputType: string = "number";
   discExprRegex: RegExp = /[\d./+%]+/;
   discExprRegex2: RegExp = /[-\d.+%]+/;

   @Input() objectHeader: any;
   @Input() objectDetail: TransactionDetail[] = [];
   @Input() objectHistory: SalesItemInfoRoot[] = [];
   @Input() objectOtherAmount: OtherAmount[] = [];

   @Input() isQuotation: boolean = false;
   @Input() isSalesOrder: boolean = false;
   @Input() isBackToBackOrder: boolean = false;
   @Input() isConsignmentInvoice: boolean = false;
   @Input() showLatestPrice: boolean = false;
   @Input() isAutoPromotion: boolean = true;
   @Input() showOtherAmount: boolean = false;
   @Input() isSalesExchange: boolean = false;
   @Input() isGoodsLending: boolean = false;
   @Input() isLendingReturn: boolean = false;

   @Input() isCalculateMargin: boolean = false;

   @Input() discountGroupMasterList: MasterListDetails[] = [];
   @Input() itemVariationXMasterList: MasterListDetails[] = [];
   @Input() itemVariationYMasterList: MasterListDetails[] = [];
   @Input() uomMasterList: MasterListDetails[] = [];
   @Input() otherAmtMasterList: MasterListDetails[] = [];
   @Input() precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   @Input() precisionSalesUnitPrice: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   @Input() promotionMaster: PromotionMaster[] = [];
   @Input() restrictTrxFields: any = {};

   @Output() onLineEditComplete: EventEmitter<TransactionDetail[]> = new EventEmitter();
   @Output() onTrxOtherAmountEditComplete: EventEmitter<OtherAmount[]> = new EventEmitter();
   @Output() onHeaderEditComplete: EventEmitter<any> = new EventEmitter();

   constructor(
      private transactionService: GeneralTransactionService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private promotionEngineService: PromotionEngineService,
      private toastService: ToastService,
      private alertController: AlertController,
      private modalController: ModalController
   ) {
      this.Math = Math;
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
      if (changes.isAutoPromotion) {
         await this.promotionCheck();
      }
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[];
   useTax: boolean;
   validateItemSupplyCurrency: boolean;
   configUseDiscountCode: boolean;
   configChangeDiscountCode: boolean;
   configSalesActivatePromotionEngine: boolean;
   systemWideActivateVariationRatio: boolean;
   useAutoCompleteForItemCode: boolean = false;
   configSalesOrderQuantityControl: string = "0";
   systemWideBlockConvertedCode: boolean;
   systemWideFocusQtyAfterItemSelection: boolean = false;
   consignBearingComputeGrossMargin: boolean = false;
   configOrderingActivateMOQControl: boolean;
   configOrderingActivateCasePackQtyControl: boolean;
   isCasePackQtyControlWarningOnly: boolean = false;
   configSalesActivateRestrictSelling: boolean;
   configSalesActivateTradingMargin: boolean;
   configPOSOActivateItemSpecification: boolean;
   configApplyLineMasterUDValueByItemAttribute: string = "0";
   orderingPriceApprovalEnabledFields: string = "0";
   configSystemWideActivateExtraDiscount: boolean = false;
   configSalesTransactionShowHistory: boolean = false;
   configTradingActivateMarginExpr: boolean = false
   configSystemWideActivateMultiUOM: boolean = false;
   configItemVariationShowMatrix: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let useTax = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
         if (useTax != undefined) {
            this.useTax = useTax.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.useTax = false;
         }

         let SalesValidateItemCurrency = this.moduleControl.find(x => x.ctrlName === "SalesValidateItemCurrency");
         if (SalesValidateItemCurrency != undefined) {
            this.validateItemSupplyCurrency = SalesValidateItemCurrency.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.validateItemSupplyCurrency = false;
         }

         let systemWideActivateDiscountCode = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateDiscountCode");
         if (systemWideActivateDiscountCode && systemWideActivateDiscountCode.ctrlValue.toUpperCase() === "Y") {
            this.configUseDiscountCode = true;
         } else {
            this.configUseDiscountCode = false;
         }

         let salesTrxAllowChangeDiscCode = this.moduleControl.find(x => x.ctrlName === "SalesTrxAllowChangeDiscCode");
         if (salesTrxAllowChangeDiscCode && salesTrxAllowChangeDiscCode.ctrlValue.toUpperCase() === "Y") {
            this.configChangeDiscountCode = true;
         } else {
            this.configChangeDiscountCode = false;
         }
         let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine");
         if (salesActivatePromotionEngine && salesActivatePromotionEngine.ctrlValue.toUpperCase() === "Y") {
            this.configSalesActivatePromotionEngine = true;
         } else {
            this.configSalesActivatePromotionEngine = false;
         }

         let systemWideActivateVariationRatio = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateVariationRatio");
         if (systemWideActivateVariationRatio) {
            this.systemWideActivateVariationRatio = systemWideActivateVariationRatio.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideActivateVariationRatio = false;
         }

         let useAutoCompleteForItemCode = this.moduleControl.find(x => x.ctrlName === "UseAutoCompleteForItemCode")
         if (useAutoCompleteForItemCode) {
            this.useAutoCompleteForItemCode = useAutoCompleteForItemCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.useAutoCompleteForItemCode = false;
         }

         let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl")
         if (salesOrderQuantityControl && this.isSalesOrder && !this.isBackToBackOrder) {
            this.configSalesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
         }

         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }

         let focusQty = this.moduleControl.find(x => x.ctrlName === "SystemWideFocusQtyAfterItemSelection");
         if (focusQty && focusQty.ctrlValue.toUpperCase() === "Y") {
            this.systemWideFocusQtyAfterItemSelection = true;
         } else {
            this.systemWideFocusQtyAfterItemSelection = false;
         }

         let computationMethod = this.moduleControl.find(x => x.ctrlName === "ConsignBearingComputeGrossMargin");
         if (computationMethod && computationMethod.ctrlValue.toUpperCase() === "Y") {
            this.consignBearingComputeGrossMargin = true;
         } else {
            this.consignBearingComputeGrossMargin = false;
         }

         let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
         if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() === "Y") {
            if (this.isSalesOrder || this.isBackToBackOrder) {
               this.configOrderingActivateMOQControl = true;
            } else {
               this.configOrderingActivateMOQControl = false;
            }
         } else {
            this.configOrderingActivateMOQControl = false;
         }

         let casePackCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateCasePackQtyControl");
         if (casePackCtrl && (casePackCtrl.ctrlValue.toUpperCase() === "Y" || casePackCtrl.ctrlValue.toUpperCase() === "W")) {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configOrderingActivateCasePackQtyControl = true;
               if (casePackCtrl.ctrlValue.toUpperCase() === "W") {
                  this.isCasePackQtyControlWarningOnly = true;
               } else {
                  this.isCasePackQtyControlWarningOnly = false;
               }
            } else {
               this.configOrderingActivateCasePackQtyControl = false;
               this.isCasePackQtyControlWarningOnly = false;
            }
         } else {
            this.configOrderingActivateCasePackQtyControl = false;
            this.isCasePackQtyControlWarningOnly = false;
         }

         let restrictSalesCtrl = this.moduleControl.find(x => x.ctrlName === "SalesActivateRestrictSelling");
         if (restrictSalesCtrl && restrictSalesCtrl.ctrlValue.toUpperCase() === "Y") {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configSalesActivateRestrictSelling = true;
            } else {
               this.configSalesActivateRestrictSelling = false;
            }
         } else {
            this.configSalesActivateRestrictSelling = false;
         }
         let isTradingMargin = this.moduleControl.find(x => x.ctrlName === "SalesActivateTradingMargin");
         if (isTradingMargin && isTradingMargin.ctrlValue.toUpperCase() === "Y") {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configSalesActivateTradingMargin = true;
            } else {
               this.configSalesActivateTradingMargin = false;
            }
         } else {
            this.configSalesActivateTradingMargin = false;
         }

         let useMarginExpr = this.moduleControl.find(x => x.ctrlName === "TradingActivateMarginExpr");
         if (useMarginExpr && useMarginExpr.ctrlValue.toUpperCase() === "Y") {
            this.configTradingActivateMarginExpr = true;
         } else {
            this.configTradingActivateMarginExpr = false;
         }

         let activateItemSpec = this.moduleControl.find(x => x.ctrlName === "POSOActivateItemSpecification");
         if (activateItemSpec && activateItemSpec.ctrlValue.toUpperCase() === "Y" && (this.isBackToBackOrder || this.isSalesOrder)) {
            this.configPOSOActivateItemSpecification = true;
         } else {
            this.configPOSOActivateItemSpecification = false;
         }

         let applyItemMasterUD = this.moduleControl.find(x => x.ctrlName === "ApplyLineMasterUDValueByItemAttribute")
         if (applyItemMasterUD) {
            this.configApplyLineMasterUDValueByItemAttribute = applyItemMasterUD.ctrlValue;
         }

         let priceApprovalEnabledFields = this.moduleControl.find(x => x.ctrlName === "OrderingPriceApprovalEnabledFields");
         if (priceApprovalEnabledFields) {
            this.orderingPriceApprovalEnabledFields = priceApprovalEnabledFields.ctrlValue;
         }

         let configSystemWideActivateExtraDiscount = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateExtraDiscount");
         if (configSystemWideActivateExtraDiscount && configSystemWideActivateExtraDiscount.ctrlValue.toUpperCase() === "Y") {
            this.configSystemWideActivateExtraDiscount = true;
         } else {
            this.configSystemWideActivateExtraDiscount = false;
         }

         let salesTransactionShowHistory = this.moduleControl.find(x => x.ctrlName === "SalesTransactionShowHistory");
         if (salesTransactionShowHistory && salesTransactionShowHistory.ctrlValue.toUpperCase() === "Y") {
            this.configSalesTransactionShowHistory = true;
         } else {
            this.configSalesTransactionShowHistory = false;
         }

         let activateMultiUom = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateMultiUOM")?.ctrlValue;
         if (activateMultiUom && activateMultiUom.toUpperCase() === "Y") {
            this.configSystemWideActivateMultiUOM = true;
         } else {
            this.configSystemWideActivateMultiUOM = false;
         }
         console.log("🚀 ~ SalesCartPage ~ loadModuleControl ~ this.configSystemWideActivateMultiUOM:", this.configSystemWideActivateMultiUOM)

         let itemVariationShowMatrix = this.moduleControl.find(x => x.ctrlName === "ItemVariationShowMatrix");
         if (itemVariationShowMatrix && itemVariationShowMatrix.ctrlValue.toUpperCase() === "Y") {
            this.configItemVariationShowMatrix = true;
         } else {
            this.configItemVariationShowMatrix = false;
         }
      })
   }

   getPromoInfo(promoEventId: number) {
      if (this.promotionMaster.length > 0) {
         let found = this.promotionMaster.find(x => x.promoEventId === promoEventId);
         if (found) {
            return found;
         } else {
            return null;
         }
      } else {
         return null;
      }
   }

   async presentDeleteItemAlert(data: TransactionDetail, index: number) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: () => {
                     this.removeItem(data, index);
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async removeItem(data: TransactionDetail, index: number) {
      try {
         await this.objectDetail.splice(index, 1);
         if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
            await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  modal to edit each item */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   selectedIndex: number;
   showEditModal(data: TransactionDetail, rowIndex: number) {
      this.selectedItem = JSON.parse(JSON.stringify(data)) as TransactionDetail;
      console.log("🚀 ~ SalesCartPage ~ showEditModal ~ this.selectedItem:", this.selectedItem)
      this.selectedIndex = rowIndex;
      this.onPricingApprovalSwitch({ detail: { checked: this.selectedItem.isPricingApproval } });
      this.isModalOpen = true;
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         return;
      } else {
         let hasQtyError: boolean = false;
         let totalQty: number = 0;
         if (this.selectedItem.variationTypeCode === "0") {
            hasQtyError = (this.selectedItem.qtyRequest ?? 0) <= 0;
         } else {
            this.selectedItem.variationDetails.forEach(r => {
               r.details.forEach(rr => {
                  totalQty += (rr.qtyRequest ?? 0)
               })
            })
            hasQtyError = totalQty <= 0;
         }
         if (hasQtyError) {
            this.toastService.presentToast("Controll Error", "Invalid quantity", "top", "warning", 1000);
         } else {
            this.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
            await this.computeAllAmount(this.objectDetail[this.selectedIndex], this.objectDetail);
            // await this.computeDiscTaxAmount(this.objectDetail[this.selectedIndex]);
            // if (this.configSalesActivateTradingMargin) {
            //    this.computeTradingMarginAmount(this.objectDetail[this.selectedIndex]);
            // }
            this.hideEditModal();
            if (this.selectedItem.isPricingApproval) {
               // todo : update header isPricingApproval
               this.objectHeader.isPricingApproval = true;
            }
         }
      }
   }

   async cancelChanges() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.isModalOpen = false;
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   hideEditModal() {
      this.isModalOpen = false;
   }

   async onModalHide() {
      this.selectedIndex = null;
      this.selectedItem = null;
      if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
         await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
      }
   }

   /* #endregion */

   /* #region calculation */

   checkQtyInput(trxLine: TransactionDetail) {
      let qtyInCart = 0;
      if (trxLine.variationTypeCode === "0") {
         qtyInCart += this.objectDetail.filter(r => r.uuid !== trxLine.uuid).filter(r => r.itemId === trxLine.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      if (this.configSalesOrderQuantityControl === "1") {
         if (trxLine.qtyRequest && (trxLine.qtyRequest + qtyInCart) > trxLine.actualQty) {
            this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + (trxLine.qtyRequest + qtyInCart) + "] exceeded actual quantity [" + trxLine.actualQty + "]", "top", "warning", 1000);
            setTimeout(() => {
               trxLine.qtyRequest = null;
               if (this.isSalesOrder) {
                  trxLine.qtyToShip = null;
               }
               this.computeAllAmount(trxLine);
            }, 1);
            return;
         }
      } else if (this.configSalesOrderQuantityControl === "2") {
         if (trxLine.qtyRequest && (trxLine.qtyRequest + qtyInCart) > trxLine.availableQty) {
            this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + (trxLine.qtyRequest + qtyInCart) + "] exceeded available quantity [" + trxLine.availableQty + "]", "top", "warning", 1000);
            setTimeout(() => {
               trxLine.qtyRequest = null;
               if (this.isSalesOrder) {
                  trxLine.qtyToShip = null;
               }
               this.computeAllAmount(trxLine);
            }, 1);
            return;
         }
      }
      if (this.configOrderingActivateCasePackQtyControl) {
         if (trxLine.qtyRequest && trxLine.casePackQty) {
            let checkRemainder = trxLine.qtyRequest % trxLine.casePackQty;
            if (checkRemainder != 0) {
               this.toastService.presentToast("Invalid Case Pack Quantity", "Requested quantity [" + (trxLine.qtyRequest + qtyInCart) + "] does not matach with case pack quantity [" + trxLine.casePackQty + "]", "top", "warning", 1000);
               if (!this.isCasePackQtyControlWarningOnly) {
                  setTimeout(() => {
                     trxLine.qtyRequest = null;
                     if (this.isSalesOrder) {
                        trxLine.qtyToShip = null;
                     }
                     this.computeAllAmount(trxLine);
                  }, 1);
               }
               return;
            }
         }
      }

      if (this.configOrderingActivateMOQControl) {
         if (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B") {
            let totalQtySum = this.objectDetail.reduce((sum, current) => sum + current.qtyRequest, 0);
            if (trxLine.minOrderQty && totalQtySum >= trxLine.minOrderQty) {
               if (this.isSalesOrder) {
                  trxLine.qtyToShip = trxLine.qtyRequest;
               }
               return;
            }
            if (trxLine.qtyRequest && trxLine.minOrderQty && trxLine.qtyRequest < trxLine.minOrderQty) {
               this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + (trxLine.qtyRequest + qtyInCart) + "] is lower than minimum order quantity [" + trxLine.minOrderQty + "]", "top", "warning", 1000);
               setTimeout(() => {
                  trxLine.qtyRequest = null;
                  if (this.isSalesOrder) {
                     trxLine.qtyToShip = null;
                  }
                  this.computeAllAmount(trxLine);
               }, 1);
            }
         }
      }
      if (this.isSalesOrder) {
         trxLine.qtyToShip = trxLine.qtyRequest;
      }
   }

   isValidVariationQty(data: InnerVariationDetail) {
      let qtyInCart = 0;
      qtyInCart += this.objectDetail.filter(r => r.variationTypeCode !== "0").flatMap(r => r.variationDetails).flatMap(r => r.details).filter(r => r.itemSku === data.itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      if (data.qtyRequest) {
         if (this.isSalesOrder && this.configSalesOrderQuantityControl === "1") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.actualQty) {
               this.toastService.presentToast("Invalid Quantity", `Requested quantity [${data.qtyRequest}] exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
               data.qtyRequest = null;
            }
         } else if (this.isSalesOrder && this.configSalesOrderQuantityControl === "2") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.availableQty) {
               this.toastService.presentToast("Invalid Quantity", `Requested quantity [${data.qtyRequest}] exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
               data.qtyRequest = null;
            }
         }
      }
   }

   async computeAllAmount(trxLine: TransactionDetail, objectDetail?: TransactionDetail[]) {
      let validate = this.discExprRegex.exec(trxLine.discountExpression);
      if (validate && validate.input !== validate[0]) {
         trxLine.discountExpression = validate[0]
         this.toastService.presentToast("Validation Error", "Disc. Expr replaced to valid format", "top", "warning", 1000);
      }

      // trxLine is actually selectedItem
      if (objectDetail) {
         this.objectDetail = objectDetail
      }
      if (trxLine.assembly && trxLine.assembly.length > 0) {
         await this.computeAssemblyQty(trxLine);
      }
      await this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         await this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         await this.computeTradingMarginAmount(trxLine);
      }
      if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
         await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
      }
   }

   computeMarginAmount(trxLine: TransactionDetail) {
      let isComputeGross: boolean = this.consignBearingComputeGrossMargin;
      if (this.objectHeader.grossPromoMarginCategoryCode) {
         let grossDiscountCodeList = this.discountGroupMasterList.filter(x => x.attribute3 == this.objectHeader.grossPromoMarginCategoryCode);
         let findTrxDiscount = grossDiscountCodeList.find(x => x.code == trxLine.discountGroupCode);
         if (findTrxDiscount) {
            isComputeGross = true;
         }
      }
      trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectHeader, this.consignBearingComputeGrossMargin, true);
   }

   async computeUnitPriceExTax(trxLine: TransactionDetail, objectDetail?: TransactionDetail[]) {
      if (objectDetail) {
         this.objectDetail = objectDetail
      }
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      trxLine.oriUnitPriceExTax = this.commonService.computeOriUnitPriceExTax(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);

      await this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         await this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         await this.computeTradingMarginAmount(trxLine);
      }
      // this.onEditComplete();
   }

   async computeUnitPrice(trxLine: TransactionDetail, objectDetail?: TransactionDetail[]) {
      if (objectDetail) {
         this.objectDetail = objectDetail
      }
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      trxLine.oriUnitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      await this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         await this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         await this.computeTradingMarginAmount(trxLine);
      }
      // this.onEditComplete();
   }

   async onDiscCodeChanged(item: TransactionDetail, event: any) {
      if (this.isCalculateMargin && item.itemId) {
         this.transactionService.getConsignmentMarginForConsignmentSales(item.itemId, format(new Date, "yyyy-MM-dd"), this.objectHeader.toLocationId, event.detail.value).subscribe({
            next: async (response) => {
               item.bearPct = response.bearPct;
               item.marginPct = response.marginPct;
               await this.assignDiscPct(item, event.detail.value);
            },
            error: (error) => {
               console.error(error);
            }
         })
      } else if (this.configSalesActivateTradingMargin) {
         let keyId: number;
         if (this.objectHeader.businessModelType === "T") {
            keyId = this.objectHeader.customerId;
         } else {
            keyId = this.objectHeader.toLocationId;
         }
         this.transactionService.getTradingMargin(item.itemId, format(new Date, "yyyy-MM-dd"), keyId, event.detail.value).subscribe({
            next: async (response) => {
               if (response.tradingMarginPct) {
                  item.tradingMarginPct = response.tradingMarginPct;
               } else {
                  item.tradingMarginPct = 0;
               }
               await this.assignDiscPct(item, event.detail.value);
            },
            error: (error) => {
               console.error(error);
            }
         })
      } else {
         await this.assignDiscPct(item, event.detail.value);
      }
   }

   async assignDiscPct(item: TransactionDetail, discountGroupCode: any) {
      let discPct = this.discountGroupMasterList.find(x => x.code === discountGroupCode);
      if (discPct) {
         if (discPct.attribute1 === "0") {
            item.discountExpression = null;
            if (this.configSystemWideActivateExtraDiscount) {
               if (discPct.attribute4) {
                  item.discountExpression = discPct.attribute4;
               }
            }
         } else {
            item.discountExpression = discPct.attribute1 + "%";
            if (this.configSystemWideActivateExtraDiscount) {
               if (discPct.attribute4) {
                  item.discountExpression = item.discountExpression + "/" + discPct.attribute4;
               }
            }
         }
         await this.computeAllAmount(item);
      }
   }

   computeDiscTaxAmount(trxLine: TransactionDetail, objectDetail?: TransactionDetail[]) {
      if (objectDetail) {
         this.objectDetail = objectDetail
      }
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
      if (this.isConsignmentInvoice) {
         trxLine.invoiceAmt = trxLine.subTotal;
      }
      // this.onEditComplete();
   }

   computeTradingMarginAmount(trxLine: TransactionDetail) {
      trxLine = this.commonService.computeTradingMargin(trxLine, this.useTax, trxLine.taxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
   }

   computeAssemblyQty(trxLine: TransactionDetail) {
      trxLine.assembly.forEach(assembly => {
         if (trxLine.qtyRequest && assembly.itemComponentQty > 0 && trxLine.qtyRequest > 0) {
            assembly.qtyRequest = new Decimal(assembly.itemComponentQty).mul(new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0)).toNumber();
         } else {
            assembly.qtyRequest = null;
         }
      });
   }

   async promotionCheck() {
      if ((this.isAutoPromotion ?? true)) {
         if (this.configSalesActivatePromotionEngine && (this.objectHeader.isAutoPromotion ?? true) && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
            await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
         }
      } else {
         this.objectDetail.forEach(async line => {
            line = this.commonService.reversePromoImpact(line);
            await this.computeAllAmount(line);
         })
      }
   }

   onUomChanged(item: TransactionDetail, event: any, ignoreGetPricing: boolean) {
      if (!item.baseRatio) {
         this.toastService.presentToast("Computation Error", "Base UOM ratio is undefined. Please contact system administrator.", "top", "warning", 1000);
         return;
      }
      let findUom = item.uomMaster.find(x => x.itemUomId == event.detail.value);
      item.uomRatio = findUom.ratio;
      let checkRemainder = item.uomRatio % item.baseRatio;
      if (checkRemainder == 0) {
         let computeRatio = item.uomRatio / item.baseRatio;
         item.ratioExpr = computeRatio.toString();
      } else {
         item.ratioExpr = item.uomRatio.toString() + "/" + item.baseRatio.toString();
      }
      if (!ignoreGetPricing) {
         let newReq = this.loadItemByIdPreCheck(item, item.itemId, null);
         if (!newReq) {
            return;
         } else {
            newReq.itemUomId = item.itemUomId
         }
         this.transactionService.getItemLineByReqBody(true, newReq).subscribe({
            next: (response) => {
               if (response.status == 200) {
                  let itemLineResponse = response.body;
                  item.actualQty = itemLineResponse.actualQty;
                  item.availableQty = itemLineResponse.availableQty;
                  item = this.assignLineUnitPrice(itemLineResponse, item);
                  if (item.qtyRequest) {
                     this.computeAllAmount(item);
                  }
               }
            },
            error: (error) => {
               console.error(error);
            }
         })
      }
   }

   loadItemByIdPreCheck(itemTrx: TransactionDetail, itemId: number, itemBarcode: string) {
      let newReq: any
      //Reset barcode field, for loadItemById.
      if (itemId) {
         if (itemTrx.itemBarcode) {
            itemTrx.itemBarcode = null;
         }
      }
      let rowIndex = this.objectDetail.findIndex(x => x == itemTrx);

      if (!this.objectHeader.trxDate) {
         // this.trxLineArray[rowIndex] = this.newRow();
         this.toastService.presentToast("Control Error", "Please select transaction date.", "top", "warning", 1000);
         return;
      }
      if (!this.objectHeader.locationId) {
         // this.trxLineArray[rowIndex] = this.newRow();
         this.toastService.presentToast("Control Error", "Please select location.", "top", "warning", 1000);
         return;
      }
      if (!this.objectHeader.customerId) {
         // this.trxLineArray[rowIndex] = this.newRow();
         this.toastService.presentToast("Control Error", "Please select customer.", "top", "warning", 1000);
         return;
      }
      if (this.objectHeader.hasOwnProperty("businessModelType") && this.objectHeader.businessModelType !== "T" && this.objectHeader.businessModelType !== null) {
         if (!(this.isSalesExchange || this.isGoodsLending || this.isLendingReturn)) {
            if (!this.objectHeader.toLocationId) {
               // this.trxLineArray[rowIndex] = this.newRow();
               this.toastService.presentToast("Control Error", "Please select destination location.", "top", "warning", 1000);
               return;
            }
         }
      }
      if (itemId) {
         newReq =
         {
            itemId: itemId,
            trxDate: format(new Date(this.objectHeader.trxDate), "yyyy-MM-dd"),
            locationId: this.objectHeader.locationId,
            toLocationId: 0,
            keyId: this.objectHeader.customerId
         }
      }
      if (itemBarcode) {
         newReq =
         {
            itemBarcode: itemBarcode,
            trxDate: format(new Date(this.objectHeader.trxDate), "yyyy-MM-dd"),
            locationId: this.objectHeader.locationId,
            toLocationId: 0,
            keyId: this.objectHeader.customerId
         }
      }
      if (!(this.isSalesExchange || this.isGoodsLending || this.isLendingReturn)) {
         if (this.objectHeader.toLocationId) {
            newReq.toLocationId = this.objectHeader.toLocationId
         }
      }
      if (this.isSalesExchange) {
         if (this.objectHeader.franchiseeLocationId) {
            newReq.toLocationId = this.objectHeader.franchiseeLocationId
         }
      }
      return newReq;
   }

   assignLineUnitPrice(itemLineResponse: TransactionDetail, itemTrx: TransactionDetail) {
      if (this.useTax) {
         if (this.objectHeader.isItemPriceTaxInclusive) {
            itemTrx.unitPrice = itemLineResponse.itemPricing.unitPrice;
            itemTrx.unitPriceExTax = this.commonService.computeAmtExclTax(new Decimal(itemLineResponse.itemPricing.unitPrice ? itemLineResponse.itemPricing.unitPrice : 0), itemLineResponse.taxPct).toNumber();
         } else {
            itemTrx.unitPrice = this.commonService.computeAmtInclTax(new Decimal(itemLineResponse.itemPricing.unitPrice ? itemLineResponse.itemPricing.unitPrice : 0), itemLineResponse.taxPct).toNumber();
            itemTrx.unitPriceExTax = itemLineResponse.itemPricing.unitPrice;
         }
      } else {
         itemTrx.unitPrice = itemLineResponse.itemPricing.unitPrice;
         itemTrx.unitPriceExTax = itemLineResponse.itemPricing.unitPrice;
      }
      itemTrx.unitPrice = this.commonService.roundToPrecision(itemTrx.unitPrice, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
      itemTrx.unitPriceExTax = this.commonService.roundToPrecision(itemTrx.unitPriceExTax, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);

      //Assign discount code
      if (this.configUseDiscountCode) {
         itemTrx.discountGroupCode = itemLineResponse.itemPricing.discountGroupCode;
      }
      if (itemLineResponse.itemPricing.discountExpression) {
         if (itemLineResponse.itemPricing.discountExpression != "0" && itemLineResponse.itemPricing.discountExpression != "0%") {
            itemTrx.discountExpression = itemLineResponse.itemPricing.discountExpression;
         }
      } else {
         itemTrx.discountExpression = null;
      }

      itemTrx.oriUnitPrice = itemTrx.unitPrice;
      itemTrx.oriUnitPriceExTax = itemTrx.unitPriceExTax;
      itemTrx.oriDiscountGroupCode = itemTrx.discountGroupCode;
      itemTrx.oriDiscountExpression = itemTrx.discountExpression;

      return itemTrx;
   }

   /* #endregion */

   /* #region  edit qty */

   async computeQty() {
      try {
         if (this.selectedItem.variationTypeCode === "0") {
            this.computeAllAmount(this.selectedItem);
         }
         if (this.selectedItem.variationTypeCode === "1" || this.selectedItem.variationTypeCode === "2") {
            var totalQty = 0;
            if (this.selectedItem.variationDetails) {
               this.selectedItem.variationDetails.forEach(x => {
                  x.details.forEach(y => {
                     if (y.qtyRequest && y.qtyRequest < 0) {
                        this.toastService.presentToast("Control Error", "Invalid quantity", "top", "warning", 1000);
                     }
                     totalQty = totalQty + y.qtyRequest;
                  });
               })
            }
            this.selectedItem.qtyRequest = totalQty;
            this.selectedItem.qtyToShip = this.selectedItem.qtyRequest;
            // await this.checkQtyInput(this.selectedItem);
            this.computeAllAmount(this.selectedItem);
         }
      } catch (e) {
         console.error(e);
      }
   }

   increaseVariationQty(data: InnerVariationDetail) {
      let qtyInCart = 0;
      qtyInCart += this.objectDetail.filter(r => r.variationTypeCode !== "0").flatMap(r => r.variationDetails).flatMap(r => r.details).filter(r => r.itemSku === data.itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      try {
         if (data.qtyRequest) {
            if (this.isSalesOrder && this.configSalesOrderQuantityControl === "1") {
               if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.actualQty) {
                  data.qtyRequest = null;
                  this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
               } else {
                  data.qtyRequest = (data.qtyRequest ?? 0) + 1;
               }
            } else if (this.isSalesOrder && this.configSalesOrderQuantityControl === "2") {
               if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.availableQty) {
                  data.qtyRequest = null;
                  this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
               } else {
                  data.qtyRequest = (data.qtyRequest ?? 0) + 1;
               }
            } else {
               data.qtyRequest = (data.qtyRequest ?? 0) + 1;
            }
            this.computeQty();
         }
      } catch (e) {
         console.error(e);
      }
   }

   decreaseVariationQty(data: InnerVariationDetail) {
      try {
         if ((data.qtyRequest - 1) < 0) {
            data.qtyRequest = 0;
         } else {
            data.qtyRequest -= 1;
         }
         this.computeQty();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region more action popover */

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

   onPricingApprovalSwitch(event: any) {
      if (event.detail.checked) {
         switch (this.orderingPriceApprovalEnabledFields) {
            case "0":
               if (this.restrictTrxFields.unitPrice) {
                  this.restrictTrxFields.unitPrice = false;
               }
               if (this.restrictTrxFields.unitPriceExTax) {
                  this.restrictTrxFields.unitPriceExTax = false;
               }
               if (this.restrictTrxFields.discountExpression) {
                  this.restrictTrxFields.discountExpression = false;
               }
               if (this.restrictTrxFields.discountGroupCode) {
                  this.restrictTrxFields.discountGroupCode = false;
               }
               break;
            case "1":
               if (this.restrictTrxFields.unitPrice) {
                  this.restrictTrxFields.unitPrice = false;
               }
               if (this.restrictTrxFields.unitPriceExTax) {
                  this.restrictTrxFields.unitPriceExTax = false;
               }
               break;
            case "2":
               if (this.restrictTrxFields.discountExpression) {
                  this.restrictTrxFields.discountExpression = false;
               }
               if (this.restrictTrxFields.discountGroupCode) {
                  this.restrictTrxFields.discountGroupCode = false;
               }
               break;
         }
      } else {
         if (this.restrictTrxFields.unitPrice === false) {
            this.restrictTrxFields.unitPrice = true;
         }
         if (this.restrictTrxFields.unitPriceExTax === false) {
            this.restrictTrxFields.unitPriceExTax = true;
         }
         if (this.restrictTrxFields.discountExpression === false) {
            this.restrictTrxFields.discountExpression = true;
         }
         if (this.restrictTrxFields.discountGroupCode === false) {
            this.restrictTrxFields.discountGroupCode = true;
         }
      }
   }

   /* #region sales history */

   getSalesHistoryByItemId(itemId: number): SalesHistoryInfo[] {
      let found = this.objectHistory.filter(r => r.masterInfo.itemId === itemId);
      if (found && found.length > 0) {
         return found.flatMap(r => r.historyInfo);
      }
      return null;
   }

   getLatestSalesHistoryByItemId(itemId: number): SalesHistoryInfo {
      let found = this.objectHistory.filter(r => r.masterInfo.itemId === itemId);
      if (found && found.length > 0) {
         return found.flatMap(r => r.historyInfo)[0];
      }
      return null;
   }

   async showPriceHistoryModal(itemId: number) {
      let found = this.getSalesHistoryByItemId(itemId);
      if (found) {
         const modal = await this.modalController.create({
            component: ItemSalesHistoryPage,
            componentProps: {
               selectedHistory: found
            },
            canDismiss: true
         })
         modal.present();
      } else {
         this.toastService.presentToast("", "Sales History not found", "top", "warning", 1000);
      }
   }

   /* #endregion */

   validateToShipQty(trxLine: TransactionDetail) {
      if (trxLine.qtyToShip > (trxLine.qtyRequest - (trxLine.qtyCommit ?? 0))) {
         this.toastService.presentToast("Invalid To Ship Quantity", `To Ship quantity [${trxLine.qtyToShip}] is higher than open quantity [${(trxLine.qtyRequest - (trxLine.qtyCommit ?? 0))}]`, "top", "warning", 1000);
         setTimeout(() => {
            trxLine.qtyToShip = trxLine.qtyRequest - (trxLine.qtyCommit ?? 0);
         }, 1);
      }
   }

   /* #region other amount */

   otherAmtModal: boolean = false;
   selectedOtherAmt: OtherAmount = null;
   showOtherAmtModal(rowIndex) {
      this.selectedOtherAmt = this.objectOtherAmount[rowIndex];
      this.otherAmtModal = true;
   }

   hideOtherAmtModal() {
      this.otherAmtModal = false;
   }

   applyOtherAmt() {
      this.hideOtherAmtModal();
      // this.objectOtherAmount.push(this.selectedOtherAmt);
   }

   cancelOtherAmt() {

   }

   addOtherAmount() {
      let newOtherAmountLine = this.newOtherAmountRow();
      this.objectOtherAmount.push(newOtherAmountLine);
      this.showOtherAmtModal(this.objectOtherAmount.length - 1);
   }

   onOtherAmtModalHide() {
      this.selectedOtherAmt = null;
   }

   newOtherAmountRow() {
      let currentSum = 0;
      if (!this.isConsignmentInvoice) {
         currentSum = this.objectDetail.reduce((sum, current) => sum + current.subTotal, 0);
      } else {
         if (this.objectHeader.hasOwnProperty("consignmentSettlementId") && this.objectHeader.consignmentSettlementId) {
            currentSum = this.objectDetail.reduce((sum, current) => sum + current.subTotal, 0);
         } else {
            currentSum = this.objectDetail.reduce((sum, current) => sum + current.invoiceAmt, 0);
         }
      }
      let otherAmountTransactionLine: OtherAmount = {
         lineId: 0,
         headerId: 0,
         amountCode: null,
         amountDescription: null,
         amountExpression: null,
         currentSubtotal: this.objectOtherAmount.length > 0 ? this.objectOtherAmount[this.objectOtherAmount.length - 1].cumulativeAmount : currentSum,
         totalAmount: null,
         cumulativeAmount: this.objectOtherAmount.length > 0 ? this.objectOtherAmount[this.objectOtherAmount.length - 1].cumulativeAmount : currentSum,
         sequence: null,
         remark: null
      }
      return otherAmountTransactionLine;
   }

   onOtherAmtCodeChanged(item: OtherAmount, event: any) {
      let amtExpression = this.otherAmtMasterList.find(x => x.code === event.detail.value)
      if (amtExpression) {
         item.amountDescription = amtExpression.description;
         if (amtExpression.attribute1 === "0") {
            item.amountExpression = null;
         } else {
            item.amountExpression = amtExpression.attribute1;
         }
         if (!this.isConsignmentInvoice) {
            this.commonService.computeOtherAmount(this.objectDetail, this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
         } else {
            if (this.objectHeader.hasOwnProperty("consignmentSettlementId") && this.objectHeader.consignmentSettlementId) {
               this.commonService.computeOtherAmount(this.objectDetail.filter(x => !x.isShortOver), this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
            } else {
               this.commonService.computeOtherAmountFromInvoiceAmt(this.objectDetail, this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
            }
         }
      }
   }

   showExtraInfo(object: OtherAmount) {
      if (object.amountCode) {
         let t = this.otherAmtMasterList.find(r => r.code === object.amountCode);
         if (t && (t.attribute3 || t.attribute4)) {
            return true;
         } else {
            return false;
         }
      }
      return false;
   }

   isExtraInfoPopoverOpen: boolean = false;
   @ViewChild("extraInfoPopover", { static: false }) extraInfoPopover: IonPopover;
   showExtraInfoPopover(event) {
      this.extraInfoPopover.event = event;
      this.isExtraInfoPopoverOpen = true;
   }

   retrieveExtraInfo(object: OtherAmount) {
      if (object.amountCode) {
         let t = this.otherAmtMasterList.find(r => r.code === object.amountCode);
         if (t) {
            if (t.attribute3 && t.attribute4) {
               let tFrom = Number(t.attribute3);
               let tTo = Number(t.attribute4);
               return "Amount Expression in between of " + tFrom + " and" + tTo;
            }
            else if (t.attribute3 && (t.attribute4 === null || t.attribute4 === "")) {
               let tFrom = Number(t.attribute3);
               return "Amount expression greater than or equal to " + tFrom;
            }
            else if (t.attribute4 && (t.attribute3 === null || t.attribute3 === "")) {
               let tTo = Number(t.attribute4);
               return "Please enter expression less than or equal to " + tTo;
            }
         } else {
            return "";
         }
      }
   }

   onAmountExpressionBlur(object: OtherAmount, ctrl: IonInput) {
      let validate = this.discExprRegex2.exec(object.amountExpression);
      if (validate && validate.input !== validate[0]) {
         object.amountExpression = validate[0]
         this.toastService.presentToast("Validation Error", "Amt. Expr. replaced to valid format", "top", "warning", 1000);
      }

      let t = this.otherAmtMasterList.find(r => r.code === object.amountCode);
      if (!t) {
         object.amountExpression = null;
         this.toastService.presentToast("Invalid Selection", "Please select other amount code.", "top", "warning", 1000);
         return;
      }
      if (t.attribute2 === "P") {
         object.amountExpression = object.amountExpression.includes("%") ? object.amountExpression.replace("%", "") : object.amountExpression;
      }
      if (t.attribute3 && t.attribute4) {
         let tFrom = Number(t.attribute3);
         let tTo = Number(t.attribute4);
         if (Number(object.amountExpression) >= tFrom && Number(object.amountExpression) <= tTo) {

         } else {
            object.amountExpression = t.attribute1;
            this.toastService.presentToast("Invalid Amount Expression", `Please enter expression in between of ${tFrom} and ${tTo}.`, "top", "warning", 1000);
            ctrl.setFocus();
         }
      }
      else if (t.attribute3 && (t.attribute4 === null || t.attribute4 === "")) {
         let tFrom = Number(t.attribute3);
         if (Number(object.amountExpression) >= tFrom) {

         } else {
            object.amountExpression = t.attribute1;
            this.toastService.presentToast("Invalid Amount Expression", `Please enter expression greater than or equal to ${tFrom}`, "top", "warning", 1000);
            ctrl.setFocus();
         }
      }
      else if (t.attribute4 && (t.attribute3 === null || t.attribute3 === "")) {
         let tTo = Number(t.attribute4);
         if (Number(object.amountExpression) <= tTo) {

         } else {
            object.amountExpression = t.attribute1;
            this.toastService.presentToast("Invalid Amount Expression", `Please enter expression less than or equal to ${tTo}`, "top", "warning", 1000);
            ctrl.setFocus();
         }
      }
      if (t.attribute2 === "P") {
         object.amountExpression = object.amountExpression.includes("%") ? object.amountExpression : object.amountExpression + "%";
      }
      this.onOtherAmountEditComplete();
   }

   onOtherAmountEditComplete() {
      let index: number = 0;
      this.objectOtherAmount.forEach(member => {
         member.sequence = index;
         index++;
      })
      if (!this.isConsignmentInvoice) {
         this.objectOtherAmount = this.commonService.computeOtherAmount(this.objectDetail, this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
      } else {
         if (this.objectHeader.hasOwnProperty("consignmentSettlementId") && this.objectHeader.consignmentSettlementId) {
            this.commonService.computeOtherAmount(this.objectDetail.filter(x => !x.isShortOver), this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
         } else {
            this.commonService.computeOtherAmountFromInvoiceAmt(this.objectDetail, this.objectOtherAmount, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
         }
      }
      this.onTrxOtherAmountEditComplete.emit(this.objectOtherAmount);
   }

   async removeOtherAmtConfirmation(rowData, rowIndex) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: () => {
                     this.objectOtherAmount.splice(rowIndex, 1);
                     this.objectOtherAmount = [...this.objectOtherAmount];
                     this.onOtherAmountEditComplete();
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
