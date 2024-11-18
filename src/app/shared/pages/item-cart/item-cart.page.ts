import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from '../../models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail } from '../../models/variation-detail';
import { PrecisionList } from '../../models/precision-list';

@Component({
   selector: 'app-item-cart',
   templateUrl: './item-cart.page.html',
   styleUrls: ['./item-cart.page.scss'],
})
export class ItemCartPage implements OnInit {

   @Input() isHomeCurrency: boolean;
   @Input() precisionSales: PrecisionList
   @Input() itemInCart: TransactionDetail[] = [];
   @Input() useTax: boolean;
   @Input() maxPrecision: number = 2;
   @Input() maxPrecisionTax: number = 2;
   @Input() isDisplayTaxInclusive: boolean = true;
   @Input() discountGroupMasterList: MasterListDetails[] = [];
   @Input() itemVariationXMasterList: MasterListDetails[] = [];
   @Input() itemVariationYMasterList: MasterListDetails[] = [];
   @Input() isItemPriceTaxInclusive: boolean = false;
   @Output() onItemInCartEditCompleted: EventEmitter<TransactionDetail> = new EventEmitter();
   @Output() onItemInCartDeleteCompleted: EventEmitter<TransactionDetail[]> = new EventEmitter();

   constructor(
      private alertController: AlertController,
      private toastService: ToastService,
      private commonService: CommonService,
   ) { }

   ngOnInit() {

   }

   /* #region  variation type 0 */

   async decreaseQty(trxLine: TransactionDetail) {
      if (trxLine.qtyRequest - 1 === 0) {
         await this.presentDeleteItemAlert(trxLine);
      } else {
         trxLine.qtyRequest -= 1;
         this.onItemInCartEditCompleted.emit(trxLine);
      }
   }

   increaseQty(trxLine: TransactionDetail) {
      trxLine.qtyRequest = (trxLine.qtyRequest ?? 0) + 1;
      this.onItemInCartEditCompleted.emit(trxLine);
   }

   /* #endregion */

   /* #region  variation type 1 and 2 */

   async decreaseVariationQty(trxLine: TransactionDetail, data: InnerVariationDetail) {
      if (data.qtyRequest - 1 === 0) {
         await this.presentDeleteItemVariationAlert(trxLine, data);
      } else {
         data.qtyRequest -= 1;
         this.onItemInCartEditCompleted.emit(trxLine);
      }
   }

   increaseVariationQty(trxLine: TransactionDetail, data: InnerVariationDetail) {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      this.onItemInCartEditCompleted.emit(trxLine);
   }

   filter(data: InnerVariationDetail[]) {
      return data.filter(r => r.qtyRequest > 0);
   }

   /* #endregion */

   /* #region  delete */

   async presentDeleteItemAlert(item: TransactionDetail) {
      const alert = await this.alertController.create({
         cssClass: 'custom-alert',
         header: 'Are you sure to delete?',
         buttons: [
            {
               text: 'Cancel',
               role: 'cancel',
               handler: () => {
                  item.qtyRequest = 1;
               }
            },
            {
               text: 'OK',
               role: 'confirm',
               cssClass: 'danger',
               handler: () => {
                  this.removeItemById(item);
               },
            },
         ],
      });
      await alert.present();
   }

   async removeItemById(item: TransactionDetail) {
      this.itemInCart = JSON.parse(JSON.stringify(this.itemInCart.filter(r => r.itemId !== item.itemId)));
      this.onItemInCartDeleteCompleted.emit(this.itemInCart);
      this.toastService.presentToast('', 'Item has been removed from cart.', 'top', 'success', 1000);
   }

   async presentDeleteItemVariationAlert(trxLine: TransactionDetail, item: InnerVariationDetail) {
      const alert = await this.alertController.create({
         cssClass: 'custom-alert',
         header: 'Are you sure to delete?',
         buttons: [
            {
               text: 'OK',
               role: 'confirm',
               cssClass: 'danger',
               handler: () => {
                  item.qtyRequest = null;
                  this.onItemInCartEditCompleted.emit(trxLine);
               },
            },
            {
               text: 'Cancel',
               role: 'cancel',
               handler: () => {
                  item.qtyRequest = 1;
               }
            },
         ],
      });
      await alert.present();
   }

   /* #endregion */

   /* #region  modify line details */

   selectedItem: TransactionDetail;
   async showLineDetails(trxLine: TransactionDetail) {
      this.selectedItem = trxLine;
      await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.isItemPriceTaxInclusive, this.isDisplayTaxInclusive, this.maxPrecision);
      this.showItemModal();
   }

   isModalOpen: boolean = false;
   showItemModal() {
      this.isModalOpen = true;
   }

   hideItemModal() {
      this.isModalOpen = false;
   }

   highlight(input) {
      input.getInputElement().then(r => {
         r.select();
      })
   }

   async onDiscountGroupChanged() {
      let lookupvalue = this.discountGroupMasterList.find(r => r.code === this.selectedItem.discountGroupCode);
      if (lookupvalue) {
         this.itemInCart.find(r => r.itemId === this.selectedItem.itemId).discountExpression = lookupvalue.attribute1 + "%";
         this.selectedItem.discountExpression = lookupvalue.attribute1 + "%";
      } else {
         this.itemInCart.find(r => r.itemId === this.selectedItem.itemId).discountExpression = null;
         this.selectedItem.discountExpression = null;
      }
      await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.isItemPriceTaxInclusive, this.isDisplayTaxInclusive, this.maxPrecision);
      this.onItemInCartEditCompleted.emit(this.selectedItem);
   }

   onModalItemEditComplete() {
      this.onItemInCartEditCompleted.emit(this.selectedItem);
   }

   onItemEditComplete(trxLine) {
      this.onItemInCartEditCompleted.emit(trxLine);
   }

   /* #endregion */

}
