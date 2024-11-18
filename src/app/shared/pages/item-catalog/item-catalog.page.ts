import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { format } from 'date-fns';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterList } from '../../models/master-list';
import { MasterListDetails } from '../../models/master-list-details';
import { ModuleControl } from '../../models/module-control';
import { PrecisionList } from '../../models/precision-list';
import { LineAssembly, TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail } from '../../models/variation-detail';
import { CommonService } from '../../services/common.service';
import { SearchItemService } from '../../services/search-item.service';
import { InfiniteScrollCustomEvent, IonPopover, IonSearchbar, ModalController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { SalesItemRequest } from '../../models/sales-item-request';
import Decimal from 'decimal.js';
import { SalesHistoryInfo, SalesItemInfoRoot } from '../../models/sales-item-info';
import { ItemSalesHistoryPage } from '../item-sales-history/item-sales-history.page';
import { VariationRatio } from '../../models/variation-ratio';

@Component({
   selector: 'app-item-catalog',
   templateUrl: './item-catalog.page.html',
   styleUrls: ['./item-catalog.page.scss'],
})
export class ItemCatalogPage implements OnInit, OnChanges {

   @Input() itemInCart: TransactionDetail[] = [];
   @Input() objectId: number;
   @Input() keyId: number;
   @Input() locationId: number;
   @Input() fullMasterList: MasterList[] = [];
   @Input() useTax: boolean;
   @Input() objectHeader: any;
   @Input() precisionSales: PrecisionList;
   @Input() precisionSalesUnitPrice: PrecisionList;
   @Input() isItemPriceTaxInclusive: boolean;
   @Input() showImage: boolean = false;
   @Input() showAvailQty: boolean = false;
   @Input() showLatestPrice: boolean = false;
   @Input() showStandardPackingInfo: boolean = false;
   @Input() isQuotation: boolean = false;
   @Input() isSalesOrder: boolean = false;
   @Input() isBackToBackOrder: boolean = false;
   @Input() disableIfPricingNotSet: boolean = true;
   @Input() variationRatioList: VariationRatio[] = [];
   filteredVariationRatioList: VariationRatio[] = [];

   brandMasterList: MasterListDetails[] = [];
   groupMasterList: MasterListDetails[] = [];
   categoryMasterList: MasterListDetails[] = [];
   salesOrderQuantityControl: string = "0";
   systemWideBlockConvertedCode: boolean = false;
   itemListLoadSize: number = 10;

   @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;
   @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();
   @Output() onHistoryCopied: EventEmitter<SalesItemInfoRoot> = new EventEmitter();

   constructor(
      private searchItemService: SearchItemService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController
   ) { }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes.itemInCart) {
         this.computeQtyInCart();
      }
   }

   ngOnInit() {
      this.brandMasterList = this.fullMasterList.filter(x => x.objectName === "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.groupMasterList = this.fullMasterList.filter(x => x.objectName === "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.categoryMasterList = this.fullMasterList.filter(x => x.objectName === "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   configOrderingActivateMOQControl: boolean;
   configSalesTransactionShowHistory: boolean = false;
   configSalesActivateTradingMargin: boolean;
   configTradingActivateMarginExpr: boolean = false;
   configItemVariationShowMatrix: boolean = false;
   configSystemWideActivateMultiUOM: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         if (this.isSalesOrder) {
            let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl");
            if (salesOrderQuantityControl) {
               this.salesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
            }
         }

         let itemListLoadSize = this.moduleControl.find(x => x.ctrlName === "ItemListLoadSize")?.ctrlValue;
         if (itemListLoadSize && Number(itemListLoadSize) > 0) {
            this.itemListLoadSize = Number(itemListLoadSize);
         } else {
            this.itemListLoadSize = 10;
         }

         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }

         let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
         if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() === 'Y') {
            if (this.isSalesOrder || this.isBackToBackOrder) {
               this.configOrderingActivateMOQControl = true;
            } else {
               this.configOrderingActivateMOQControl = false;
            }
         } else {
            this.configOrderingActivateMOQControl = false;
         }

         let salesTransactionShowHistory = this.moduleControl.find(x => x.ctrlName === "SalesTransactionShowHistory");
         if (salesTransactionShowHistory && salesTransactionShowHistory.ctrlValue.toUpperCase() === 'Y') {
            this.configSalesTransactionShowHistory = true;
         } else {
            this.configSalesTransactionShowHistory = false;
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

         let itemVariationShowMatrix = this.moduleControl.find(x => x.ctrlName === "ItemVariationShowMatrix");
         if (itemVariationShowMatrix && itemVariationShowMatrix.ctrlValue.toUpperCase() === "Y") {
            this.configItemVariationShowMatrix = true;
         } else {
            this.configItemVariationShowMatrix = false;
         }

         let activateMultiUom = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateMultiUOM")?.ctrlValue;
         if (activateMultiUom && activateMultiUom.toUpperCase() === "Y") {
            this.configSystemWideActivateMultiUOM = true;
         } else {
            this.configSystemWideActivateMultiUOM = false;
         }

      })
   }

   /* #region  search item */

   itemSearchText: string;
   availableItem: TransactionDetail[] = [];
   availableImages: ItemImage[] = [];
   searchTextChanged() {
      this.availableItem = [];
      this.availableImages = [];
   }

   startIndex: number = 0;
   async searchItem(searchText: string, newSearch: boolean) {
      if (newSearch) {
         this.availableItem = [];
      }
      this.itemSearchText = searchText;
      try {
         await this.loadingService.showLoading();
         if (this.itemSearchText && this.itemSearchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            let requestObject: SalesItemRequest = {
               search: this.itemSearchText,
               trxDate: this.objectHeader?.trxDate,
               keyId: this.objectId,
               customerId: this.keyId,
               locationId: this.objectHeader?.locationId ?? 0,
               startIndex: this.startIndex,
               size: this.itemListLoadSize
            }
            this.searchItemService.getItemInfoByKeywordfortest(requestObject).subscribe(async response => {
               let rrr = response.filter(r => r.itemPricing);
               if (rrr && rrr.length > 0) {
                  for await (const r of rrr) {
                     await this.assignTrxItemToDataLine(r);
                  }
               } else {
                  this.startIndex = this.availableItem.length;
               }
               this.availableItem = [...this.availableItem, ...rrr];
               await this.computeQtyInCart();
               if (this.configSalesTransactionShowHistory && (this.isQuotation || this.isSalesOrder)) {
                  await this.loadSalesHistory(newSearch);
               }
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Search Complete", `${this.availableItem.length} item(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
            })
            if (Capacitor.getPlatform() !== "web") {
               await this.loadImages(this.itemSearchText); // todo : to handle load image based on availableItem
            }
         } else {
            await this.loadingService.dismissLoading()
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
         this.onBrowseModeChanged();
      } catch (e) {
         await this.loadingService.dismissLoading()
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading()
      }
   }

   availableSalesHistory: SalesItemInfoRoot[] = [];
   loadSalesHistory(newSearch: boolean) {
      this.availableSalesHistory = [];
      let requestObject: SalesItemRequest = {
         itemId: this.availableItem.flatMap(r => r.itemId),
         search: null,
         trxDate: this.commonService.getTodayDate(),
         keyId: this.objectId,
         customerId: this.keyId,
         locationId: this.objectHeader?.locationId ?? 0,
         startIndex: this.startIndex,
         size: this.itemListLoadSize
      }
      this.searchItemService.getSalesHistoryInfo(requestObject).subscribe({
         next: (response) => {
            if (response && response.flatMap(r => r.historyInfo) && response.flatMap(r => r.historyInfo).length > 0) {
               this.availableSalesHistory = [...this.availableSalesHistory, ...response];
            }
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   getSalesHistoryByItemId(itemId: number): SalesHistoryInfo[] {
      let found = this.availableSalesHistory.filter(r => r.masterInfo.itemId === itemId);
      if (found && found.length > 0) {
         return found.flatMap(r => r.historyInfo);
      }
      return null;
   }

   getLatestSalesHistoryByItemId(itemId: number): SalesHistoryInfo {
      let found = this.availableSalesHistory.filter(r => r.masterInfo.itemId === itemId);
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
         await modal.present();
      } else {
         this.toastService.presentToast("", "Sales History not found", "top", "warning", 1000);
      }
   }

   onIonInfinite(event) {
      this.startIndex += this.itemListLoadSize;
      this.searchItem(this.itemSearchText, false);
      setTimeout(() => {
         (event as InfiniteScrollCustomEvent).target.complete();
      }, 500);
   }

   loadImages(searchText) {
      this.searchItemService.getItemImageFile(searchText).subscribe(response => {
         this.availableImages = response;
      }, error => {
         console.log(error);
      })
   }

   showZoom:boolean = false;
   selectedImageSrc: string;
   showZoomedImage(itemId: number) {
      this.selectedImageSrc = this.matchImage(itemId);
      this.showZoom = true;
   }

   hideZoomedImage() {
      this.selectedImageSrc = null;
      this.showZoom = false;
   }

   onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         this.searchItem(searchText, true);
         event.preventDefault();
      }
   }

   browseMode: string = "brand";
   onBrowseModeChanged() {
      this.browseBy = [];
   }

   computeQtyInCart() {
      if (this.availableItem && this.availableItem.length > 0) {
         this.availableItem.forEach(r => {
            if (this.itemInCart.findIndex(rr => rr.itemId === r.itemId) > -1) {
               r.qtyInCart = this.itemInCart.filter(rr => rr.itemId === r.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
               if (r.variationTypeCode === "1" || r.variationTypeCode === "2") {
                  r.variationDetails.flatMap(x => x.details).forEach(y => {
                     y.qtyInCart = this.itemInCart.filter(rr => rr.itemId === r.itemId).flatMap(rr => rr.variationDetails).flatMap(xx => xx.details).filter(yy => yy.qtyRequest && yy.qtyRequest > 0 && yy.itemSku === y.itemSku).flatMap(yy => yy.qtyRequest).reduce((a, c) => a + c, 0);
                  })
               }
            } else {
               r.qtyInCart = null;
               if (r.variationTypeCode === "1" || r.variationTypeCode === "2") {
                  r.variationDetails.forEach(x => {
                     x.details.forEach(y => {
                        y.qtyInCart = null;
                     })
                  })
               }
            }
         })
      }
   }

   browseBy: string[];

   /* #endregion */

   /* #region  item grid */

   matchImage(itemId: number) {
      let defaultImageUrl = "assets/icon/favicon.png";
      let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
      if (lookup) {
         return "data:image/png;base64, " + lookup;
      }
      return defaultImageUrl;
   }

   /* #endregion */

   /* #region  unit price, tax, discount */

   assignTrxItemToDataLine(item: TransactionDetail) {
      if (this.useTax) {
         if (this.isItemPriceTaxInclusive) {
            if (item.itemPricing) {
               item.unitPrice = item.itemPricing.unitPrice;
               item.unitPriceExTax = this.commonService.computeAmtExclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
            }
         } else {
            if (item.itemPricing) {
               item.unitPrice = this.commonService.computeAmtInclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
               item.unitPriceExTax = item.itemPricing.unitPrice;
            }
         }
      } else {
         if (item.itemPricing) {
            item.unitPrice = item.itemPricing.unitPrice;
            item.unitPriceExTax = item.itemPricing.unitPrice;
         }
      }
      item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.objectHeader?.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.objectHeader?.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);

      // item.oriUnitPrice = item.unitPrice;
      // item.oriUnitPriceExTax = item.unitPriceExTax;
      // item.oriDiscountGroupCode = item.discountGroupCode;
      // item.oriDiscountExpression = item.discountExpression;

      if (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B" || this.objectHeader.businessModelType === "F") {
         if (this.configSalesActivateTradingMargin || this.configTradingActivateMarginExpr) {
            if (this.configSalesActivateTradingMargin && !this.configTradingActivateMarginExpr && item.tradingMarginPct) {
               item.tradingMarginPct = item.tradingMarginPct;
               item.tradingMarginExpression = item.tradingMarginPct + "%";
            }
            if (this.configSalesActivateTradingMargin && this.configTradingActivateMarginExpr && item.tradingMarginExpression) {
               item.tradingMarginPct = null;
               item.tradingMarginExpression = item.tradingMarginExpression;
            }
         } else {
            item.tradingMarginPct = null;
            item.tradingMarginExpression = null;
         }
      }

      if (this.configOrderingActivateMOQControl) {
         if (item.minOrderQty) {
            item.minOrderQty = item.minOrderQty;
         } else {
            item.minOrderQty = 0;
         }
      }
      if (item.typeCode === "AS") {
         if (item.component && item.component.length > 0) {
            item.assembly = [];
            item.component.forEach((comp, index) => {
               let newLine: LineAssembly = {
                  sequence: 0,
                  headerId: 0,
                  lineId: 0,
                  assemblyId: 0,
                  assemblyItemId: item.itemId,
                  itemComponentId: comp.itemComponentId,
                  itemComponentQty: comp.qty,
                  qtyRequest: null
               }
               item.assembly.push(newLine);
            })
         } else {
            if (item.hasOwnProperty("assembly")) {
               item.assembly = [];
            }
         }
      }
      // Handle Multi UOM
      if (item.multiUom && item.multiUom.length > 0) {
         let primaryUom = item.multiUom.find(x => x.isPrimary == true);
         if (primaryUom) {
            item.baseRatio = primaryUom.ratio;
            item.uomRatio = primaryUom.ratio;
         } else {
            item.baseRatio = 1;
            item.uomRatio = 1;
            item.uomMaster = [];
            item.uomMaster = JSON.parse(JSON.stringify(item.multiUom));
         }
         item.ratioExpr = "1";
         item.uomMaster = [];
         item.uomMaster = JSON.parse(JSON.stringify(item.multiUom));
      } else {
         item.baseRatio = 1;
         item.uomRatio = 1;
         item.ratioExpr = "1";
         item.uomMaster = [];
      }
   }

   calculatNetPrice(price, discountExpression) {
      if (discountExpression != "" && discountExpression != null) {
         let splittedDisc = discountExpression.split(/[+/]/g);
         splittedDisc.forEach(x => {
            if (x.includes("%")) {
               let currentdiscPct = parseFloat(x) / 100;
               let currentDiscAmt = price * currentdiscPct;
               price = price - currentDiscAmt;
            } else {
               price = price - parseFloat(x);
            }
         })
      }
      return price;
   }

   /* #endregion */

   /* #region  none variation */

   decreaseQty(data: TransactionDetail) {
      if ((data.qtyRequest - 1) < 0) {
         data.qtyRequest = null;
      } else {
         data.qtyRequest -= 1;
      }
   }

   isValidQty(data: TransactionDetail) {
      let qtyInCart = 0;
      if (data.variationTypeCode === "0") {
         qtyInCart += this.itemInCart.filter(r => r.itemId === data.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      if (data.qtyRequest) {
         if (this.isSalesOrder && this.salesOrderQuantityControl === "1") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.actualQty) {
               data.qtyRequest = null;
               this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
            }
         } else if (this.isSalesOrder && this.salesOrderQuantityControl === "2") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.availableQty) {
               data.qtyRequest = null;
               this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
            }
         }
      }
   }

   increaseQty(data: TransactionDetail) {
      let qtyInCart = 0;
      if (data.variationTypeCode === "0") {
         qtyInCart += this.itemInCart.filter(r => r.itemId === data.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      }
      if (this.isSalesOrder && this.salesOrderQuantityControl === "1") {
         if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.actualQty) {
            data.qtyRequest = null;
            this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
         } else {
            data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         }
      } else if (this.isSalesOrder && this.salesOrderQuantityControl === "2") {
         if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.availableQty) {
            data.qtyRequest = null;
            this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
         } else {
            data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         }
      } else {
         data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
   }

   async addToCart(data: TransactionDetail) {
      let isBlock = this.validateNewItemConversion(data);
      if (!isBlock) {
         await this.validateMinOrderQty(data);
         this.availableItem.find(r => r.itemId === data.itemId).qtyInCart = this.availableItem.filter(r => r.itemId === data.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + data.qtyRequest;
         setTimeout(() => {
            this.onItemAdded.emit(JSON.parse(JSON.stringify(data)));
            if (this.configSalesTransactionShowHistory && (this.isQuotation || this.isSalesOrder)) {
               if (this.availableSalesHistory.findIndex(r => r.masterInfo.itemId === data.itemId) > -1) {
                  this.onHistoryCopied.emit(JSON.parse(JSON.stringify(this.availableSalesHistory.find(r => r.masterInfo.itemId === data.itemId))));
               }
            }
            data.qtyRequest = null;
         }, 10);
      }
   }

   /* #endregion */

   /* #region  variation */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   hideModal() {
      this.isModalOpen = false;
      this.selectedItem = null;
   }

   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   showModal(data: TransactionDetail) {
      this.selectedItem = JSON.parse(JSON.stringify(data)) as TransactionDetail;
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      if (this.selectedItem.itemVariationId) {
         this.filteredVariationRatioList = this.variationRatioList.filter(r => r.itemVariationId === this.selectedItem.itemVariationId)
      } else {
         this.filteredVariationRatioList = this.variationRatioList;
      }
      this.isModalOpen = true;
   }

   decreaseVariationQty(data: InnerVariationDetail) {
      if ((data.qtyRequest - 1) < 0) {
         data.qtyRequest = null;
      } else {
         data.qtyRequest -= 1;
      }
   }

   isValidVariationQty(data: InnerVariationDetail) {
      let qtyInCart = 0;
      qtyInCart += this.itemInCart.filter(r => r.variationTypeCode !== "0").flatMap(r => r.variationDetails).flatMap(r => r.details).filter(r => r.itemSku === data.itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      if (data.qtyRequest) {
         if (this.isSalesOrder && this.salesOrderQuantityControl === "1") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.actualQty) {
               this.toastService.presentToast("Invalid Quantity", `Requested quantity [${data.qtyRequest}] exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
               data.qtyRequest = null;
            }
         } else if (this.isSalesOrder && this.salesOrderQuantityControl === "2") {
            if (((data.qtyRequest ?? 0) + qtyInCart) > data.availableQty) {
               this.toastService.presentToast("Invalid Quantity", `Requested quantity [${data.qtyRequest}] exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
               data.qtyRequest = null;
            }
         }
      }
   }

   increaseVariationQty(data: InnerVariationDetail) {
      let qtyInCart = 0;
      qtyInCart += this.itemInCart.filter(r => r.variationTypeCode !== "0").flatMap(r => r.variationDetails).flatMap(r => r.details).filter(r => r.itemSku === data.itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
      if (this.isSalesOrder && this.salesOrderQuantityControl === "1") {
         if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.actualQty) {
            data.qtyRequest = null;
            this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
         } else {
            data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         }
      } else if (this.isSalesOrder && this.salesOrderQuantityControl === "2") {
         if (((data.qtyRequest ?? 0) + qtyInCart + 1) > data.availableQty) {
            data.qtyRequest = null;
            this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
         } else {
            data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         }
      } else {
         data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
   }

   addVariationToCart() {
      let isBlock = this.validateNewItemConversion(this.selectedItem)
      if (!isBlock) {
         if (this.selectedItem.variationDetails) {
            this.selectedItem.variationDetails.forEach(x => {
               x.details.forEach(y => {
                  this.selectedItem.qtyRequest = (this.selectedItem.qtyRequest ?? 0) + y.qtyRequest;
               });
            })
         }
         setTimeout(async () => {
            await this.validateMinOrderQty(this.selectedItem);
            if (this.selectedItem.qtyRequest > 0) {
               // count total in cart
               this.availableItem.find(r => r.itemId === this.selectedItem.itemId).qtyInCart = this.availableItem.filter(r => r.itemId === this.selectedItem.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + this.selectedItem.qtyRequest;
               // count variation in cart
               this.availableItem.find(r => r.itemId === this.selectedItem.itemId).variationDetails.forEach(x => {
                  x.details.forEach(y => {
                     y.qtyInCart = (y.qtyInCart ?? 0) + this.selectedItem.variationDetails.flatMap(xx => xx.details).filter(yy => yy.qtyRequest && yy.qtyRequest > 0 && yy.itemSku === y.itemSku).flatMap(yy => yy.qtyRequest).reduce((a, c) => a + c, 0);
                  })
               })

               setTimeout(() => {
                  this.onItemAdded.emit(JSON.parse(JSON.stringify(this.selectedItem)));
                  if (this.configSalesTransactionShowHistory && (this.isQuotation || this.isSalesOrder)) {
                     if (this.availableSalesHistory.findIndex(r => r.masterInfo.itemId === this.selectedItem.itemId) > -1) {
                        this.onHistoryCopied.emit(JSON.parse(JSON.stringify(this.availableSalesHistory.find(r => r.masterInfo.itemId === this.selectedItem.itemId))));
                     }
                  }
                  this.hideModal();
               }, 10);
            } else {
               this.hideModal();
            }
         }, 100);
      }
   }

   /* #endregion */

   /* #region  misc */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #endregion */

   /* #region validate new item id */

   validateNewItemConversion(found: TransactionDetail) {
      if (found.newItemId && found.newItemEffectiveDate && new Date(found.newItemEffectiveDate) <= new Date(this.objectHeader.trxDate)) {
         let newItemCode = this.configService.item_Masters.find(x => x.id === found.newItemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${found.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(found.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.systemWideBlockConvertedCode) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   /* #endregion */

   /* #region check min order qty */

   validateMinOrderQty(data: TransactionDetail) {
      if (this.configOrderingActivateMOQControl) {
         if (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B") {
            if (data.qtyRequest && data.minOrderQty && data.qtyRequest < data.minOrderQty) {
               let sameItemInCart = this.availableItem.find(r => r.itemId === data.itemId);
               if (sameItemInCart && (sameItemInCart.qtyInCart ?? 0) > 0) {
                  // check if qtyincart has same item if yes then check minorderqty again
                  if (data.qtyRequest && data.minOrderQty && (data.qtyRequest + (sameItemInCart.qtyInCart ?? 0)) < data.minOrderQty) {
                     // this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + data.qtyRequest + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
                     setTimeout(() => {
                        data.minOrderQtyError = true;
                     }, 10);
                  } else {
                     data.minOrderQtyError = false;
                  }
               } else {
                  // this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + data.qtyRequest + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
                  setTimeout(() => {
                     data.minOrderQtyError = true;
                  }, 10);
               }
            } else {
               data.minOrderQtyError = false;
            }
         } else {
            data.minOrderQtyError = false;
         }
      } else {
         data.minOrderQtyError = false;
      }
   }

   /* #endregion */

   async setFocus() {
      await this.searchbar.setFocus();
   }

   /* #region pop over variation ratio quick input */

   @ViewChild("popover") popover: IonPopover;
   isPopoverOpen: boolean = false;
   selectedX: InnerVariationDetail[] = [];
   selectedRatio: VariationRatio;
   presentPopover(event, xData: InnerVariationDetail[]) {
      this.popover.event = event;
      this.selectedX = xData;
      this.xRatio = null;
      this.isPopoverOpen = true;
   }

   xRatio: number;
   popoverDismiss(event) {
      
   }

   onRatioKeyDown(event) {
      if (event.keyCode === 13) {
         this.applyQtyByRatio();
      }
   }

   applyQtyByRatio() {
      this.selectedX.forEach(async x => {
         let findRatio = this.selectedRatio.line.find(r => x.itemVariationYId == r.itemVariationYId);
         if (findRatio) {
            x.qtyRequest = findRatio.ratio * this.xRatio;
            await this.isValidVariationQty(x);
         }
      })
      this.selectedX = [];
      this.xRatio = null;
      this.isPopoverOpen = false;
   }

   /* #endregion */

}
