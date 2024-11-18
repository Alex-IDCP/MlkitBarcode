import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SalesHistoryInfo } from '../../models/sales-item-info';

@Component({
   selector: 'app-item-sales-history',
   templateUrl: './item-sales-history.page.html',
   styleUrls: ['./item-sales-history.page.scss'],
})
export class ItemSalesHistoryPage implements OnInit {

   selectedHistory: SalesHistoryInfo[];

   constructor(private modalController: ModalController) { }

   ngOnInit() {
   }

   hidePriceHistoryModal() {
      this.selectedHistory = [];
      return this.modalController.dismiss();
   }

}
