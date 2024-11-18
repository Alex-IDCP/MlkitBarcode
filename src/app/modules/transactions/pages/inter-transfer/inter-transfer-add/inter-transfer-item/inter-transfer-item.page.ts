import { Component, OnInit } from '@angular/core';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { InterTransferHeader } from 'src/app/modules/transactions/models/inter-transfer';
import { InterTransferService } from 'src/app/modules/transactions/services/inter-transfer.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
   selector: 'app-inter-transfer-item',
   templateUrl: './inter-transfer-item.page.html',
   styleUrls: ['./inter-transfer-item.page.scss'],
   providers: [SearchItemService, { provide: 'apiObject', useValue: 'mobileInterTransfer' }]
})
export class InterTransferItemPage implements OnInit, ViewWillEnter {

   objectHeader: InterTransferHeader;
   itemInCart: TransactionDetail[] = [];

   moduleControl: ModuleControl[] = [];

   constructor(
      public objectService: InterTransferService,
      private toastService: ToastService,
      private navController: NavController
   ) {
      try {
         this.objectHeader = this.objectService.header;
         this.itemInCart = this.objectService.itemInCart;
         if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
            this.navController.navigateBack('/transactions/inter-transfer/inter-transfer-header');
         }
      } catch (e) {
         console.error(e);
      }
   }

   ionViewWillEnter(): void {
      try {
         this.objectHeader = this.objectService.header;
         this.itemInCart = this.objectService.itemInCart;
         if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
            this.navController.navigateBack('/transactions/inter-transfer/inter-transfer-header');
         } else {
         }
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   async onItemAdded(event: TransactionDetail) {
      try {
         if (this.itemInCart.findIndex(r => r.itemId === event.itemId) > -1) {
            if (event.variationTypeCode === '0') {
               this.itemInCart.find(r => r.itemId === event.itemId).qtyRequest += event.qtyRequest;
            } else {
               let vd = event.variationDetails.flatMap(r => r.details).filter(r => r.qtyRequest > 0);
               vd.forEach(r => {
                  this.itemInCart.find(rr => rr.itemId === event.itemId).variationDetails.flatMap(rr => rr.details).forEach(rr => {
                     if (rr.itemSku === r.itemSku) {
                        rr.qtyRequest += r.qtyRequest;
                     }
                  })
               })
            }
         } else {
            this.itemInCart.push(event);
            await this.assignSequence();
         }
         this.toastService.presentToast('Item Added to Cart', '', 'top', 'success', 1000);
      } catch (e) {
         console.error(e);
      }
   }

   assignSequence() {
      let index = 0;
      this.itemInCart.forEach(r => {
         r.sequence = index;
         index++;
      })
   }

   /* #region  toggle show image */

   showImage: boolean = false;
   toggleShowImage() {
      this.showImage = !this.showImage;
   }

   /* #endregion */

   /* #region  steps */

   async nextStep() {
      try {
         this.objectService.setChoosenItems(this.itemInCart);
         this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-cart');
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      try {
         this.navController.navigateBack('/transactions/inter-transfer/inter-transfer-header');
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
