import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {

  item: Item;
  image: string;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log('item from itemdetails', this.item);
    if (!isNaN(this.item.qtyRequest)) {
      this.qtyRequest = this.item.qtyRequest;
    } else {
      this.qtyRequest = 0;
    }
  }

  cancel() {
    // Dismiss modal
    this.modalController.dismiss(this.item);
  }

  updateCart() {
    this.item.qtyRequest = this.qtyRequest
    this.modalController.dismiss(this.item);
  }

  qtyRequest: number = 0;
  decreaseQty() {
    if (this.qtyRequest === 0) {
      this.qtyRequest = 0;
    } else {
      this.qtyRequest--;
    }
  }

  increaseQty() {
    this.qtyRequest++;
  }

}
