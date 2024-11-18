import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, InfiniteScrollCustomEvent, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { DefectRequestDetail } from 'src/app/modules/transactions/models/defect-request';
import { DefectRequestService } from 'src/app/modules/transactions/services/defect-request.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesItemRequest } from 'src/app/shared/models/sales-item-request';
import { LineAssembly, TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-defect-request-item',
   templateUrl: './defect-request-item.page.html',
   styleUrls: ['./defect-request-item.page.scss'],
})
export class DefectRequestItemPage implements OnInit {

   itemSearchText: string;
   availableItem: TransactionDetail[] = [];
   itemListLoadSize: number = 10;

   constructor(
      public objectService: DefectRequestService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private actionSheetController: ActionSheetController
   ) { }

   ngOnInit() {
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
               trxDate: this.objectService.object?.header?.trxDate,
               keyId: this.objectService.object?.header?.defectRequestId,
               customerId: this.objectService.object?.header?.customerId,
               locationId: this.objectService.object?.header?.locationId,
               startIndex: this.startIndex,
               size: this.itemListLoadSize
            }
            this.objectService.getFullItemList(requestObject).subscribe(async response => {
               let rrr = response;
               this.startIndex = this.availableItem.length;
               this.availableItem = [...this.availableItem, ...rrr];
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Search Complete", `${this.availableItem.length} item(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
            })
         } else {
            await this.loadingService.dismissLoading()
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         await this.loadingService.dismissLoading()
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading()
      }
   }

   onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         this.searchItem(searchText, true);
         event.preventDefault();
      }
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #region  variation */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   hideModal() {
      this.isModalOpen = false;
      this.selectedItem = null;
   }

   showModal(rowData: TransactionDetail) {
      this.selectedItem = JSON.parse(JSON.stringify(rowData)) as TransactionDetail;
      this.isModalOpen = true;
   }

   decreaseVariationQty(rowData: InnerVariationDetail) {
      if ((rowData.qtyRequest - 1) < 0) {
         rowData.qtyRequest = null;
      } else {
         rowData.qtyRequest -= 1;
      }
   }

   increaseVariationQty(rowData: InnerVariationDetail) {
      rowData.qtyRequest = (rowData.qtyRequest ?? 0) + 1;
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
            if (this.selectedItem.qtyRequest > 0) {
               // count total in cart
               // this.availableItem.find(r => r.itemId === this.selectedItem.itemId).qtyInCart = this.availableItem.filter(r => r.itemId === this.selectedItem.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + this.selectedItem.qtyRequest;
               // count variation in cart
               // this.availableItem.find(r => r.itemId === this.selectedItem.itemId).variationDetails.forEach(x => {
               //    x.details.forEach(y => {
               //       y.qtyInCart = (y.qtyInCart ?? 0) + this.selectedItem.variationDetails.flatMap(xx => xx.details).filter(yy => yy.qtyRequest && yy.qtyRequest > 0 && yy.itemSku === y.itemSku).flatMap(yy => yy.qtyRequest).reduce((a, c) => a + c, 0);
               //    })
               // })
               setTimeout(async () => {
                  this.objectService.object?.details?.push(await this.assignTrxItemToDataLine(JSON.parse(JSON.stringify(this.selectedItem))));
                  this.hideModal();
               }, 10);
            } else {
               this.hideModal();
            }
         }, 100);
      }
   }

   /* #endregion */

   /* #region  none variation */

   decreaseQty(rowData: TransactionDetail) {
      if ((rowData.qtyRequest - 1) < 0) {
         rowData.qtyRequest = null;
      } else {
         rowData.qtyRequest -= 1;
      }
   }

   increaseQty(rowData: TransactionDetail) {
      rowData.qtyRequest = (rowData.qtyRequest ?? 0) + 1;
   }

   async addToCart(rowData: TransactionDetail) {
      let isBlock = this.validateNewItemConversion(rowData);
      if (!isBlock) {
         // this.availableItem.find(r => r.itemId === rowData.itemId).qtyInCart = this.availableItem.filter(r => r.itemId === rowData.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + rowData.qtyRequest;
         setTimeout(async () => {
            this.objectService.object?.details?.push(await this.assignTrxItemToDataLine(JSON.parse(JSON.stringify(rowData))));
            rowData.qtyRequest = null;
         }, 10);
      }
   }

   /* #endregion */

   isDefectRequest: boolean = true;
   async assignTrxItemToDataLine(itemLineResponse: TransactionDetail): Promise<DefectRequestDetail> {
      let itemTrx: DefectRequestDetail = {
         lineId: 0,
         headerId: this.objectService.object?.header?.defectRequestId
      };
      await this.validateNewItemConversion(itemLineResponse);
      if (itemLineResponse.typeCode === "AS") {
         if (this.isDefectRequest) {
            if (itemLineResponse.component && itemLineResponse.component.length > 0) {
               itemTrx.assembly = [];
               itemLineResponse.component.forEach((comp, index) => {
                  let newLine: LineAssembly = {
                     sequence: 0,
                     headerId: 0,
                     lineId: 0,
                     assemblyId: 0,
                     assemblyItemId: itemLineResponse.itemId,
                     itemComponentId: comp.itemComponentId,
                     itemComponentQty: comp.qty,
                     qtyRequest: null
                  }
                  itemTrx.assembly.push(newLine);
               })
            } else {
               if (itemTrx.hasOwnProperty("assembly")) {
                  itemTrx.assembly = [];
               }
            }
         }
      } else {
         if (itemTrx.hasOwnProperty("assembly")) {
            itemTrx.assembly = [];
         }
      }
      itemTrx.itemId = itemLineResponse.itemId;
      itemTrx.itemCode = itemLineResponse.itemCode;
      itemTrx.description = itemLineResponse.description;
      itemTrx.extendedDescription = itemLineResponse.extendedDescription;
      itemTrx.itemUomId = itemLineResponse.itemUomId;
      itemTrx.itemVariationRatioCode = itemLineResponse.itemVariationRatioCode;
      itemTrx.itemVariationRatioId = itemLineResponse.itemVariationRatioId;
      itemTrx.itemVariationXId = itemLineResponse.itemVariationXId;
      itemTrx.itemVariationYId = itemLineResponse.itemVariationYId;
      itemTrx.vendorItemCode = itemLineResponse.vendorItemCode;
      if (itemLineResponse.itemVariationId) {
         itemTrx.itemVariationId = itemLineResponse.itemVariationId;
      }

      //Handle Multi UOM
      if (itemLineResponse.multiUom && itemLineResponse.multiUom.length > 0) {
         let primaryUom = itemLineResponse.multiUom.find(x => x.isPrimary === true);
         if (primaryUom) {
            itemTrx.baseRatio = primaryUom.ratio;
            itemTrx.uomRatio = primaryUom.ratio;
         } else {
            itemTrx.baseRatio = 1;
            itemTrx.uomRatio = 1;
         }
         itemTrx.ratioExpr = "1";
         itemTrx.uomMaster = [];
         itemTrx.uomMaster = itemLineResponse.multiUom;
      } else {
         itemTrx.baseRatio = 1;
         itemTrx.uomRatio = 1;
         itemTrx.ratioExpr = "1";
         itemTrx.uomMaster = [];
      }

      itemTrx.variationTypeCode = itemLineResponse.variationTypeCode;
      itemTrx.variationDetails = itemLineResponse.variationDetails;
      itemTrx.variationX = itemLineResponse.variationX;
      itemTrx.variationY = itemLineResponse.variationY;

      if (itemTrx.variationTypeCode === "1" || itemTrx.variationTypeCode === "2") {         
         itemTrx.qtyRequest = 0;
         itemTrx.variationDetails.forEach(vd => {
            vd.details.forEach(d => {
               if (d.qtyRequest) {
                  itemTrx.qtyRequest += d.qtyRequest;
               }
            })
         })
      } else {
         itemTrx.qtyRequest = itemLineResponse.qtyRequest;
      }

      itemTrx.sequence = (this.objectService.object?.details?.length??0);

      return itemTrx;
   }

   /* #region validate new item id */

   validateNewItemConversion(found: TransactionDetail) {
      if (found.newItemId && found.newItemEffectiveDate && new Date(found.newItemEffectiveDate) <= new Date(this.objectService.object?.header?.trxDate)) {
         let newItemCode = this.configService.item_Masters.find(x => x.id === found.newItemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${found.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(found.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.objectService.configSystemWideBlockConvertedCode) {
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

   onIonInfinite(event) {
      this.startIndex += this.itemListLoadSize;
      this.searchItem(this.itemSearchText, false);
      setTimeout(() => {
         (event as InfiniteScrollCustomEvent).target.complete();
      }, 500);
   }

   async nextStep() {
      try {
         this.navController.navigateForward("/transactions/defect-request/defect-request-cart");
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/defect-request/defect-request-header");
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
                  objectId: this.objectService.object?.header?.defectRequestId,
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/defect-request/defect-request-detail", navigationExtras);
         }
      } catch (e) {
         console.error(e);
      }
   }

}
