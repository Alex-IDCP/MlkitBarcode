import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { MasterListDetails } from '../../models/master-list-details';

@Component({
  selector: 'app-item-add-list-flat',
  templateUrl: './item-add-list-flat.page.html',
  styleUrls: ['./item-add-list-flat.page.scss'],
})
export class ItemAddListFlatPage implements OnInit, OnChanges {

  @Input() line: any;
  @Input() isPicking: boolean = false;
  @Input() isPacking: boolean = false;
  @Input() qtyField: string;

  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];

  @Output() onQtyChanged: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.line) {

    }
  }

  ngOnInit() {
    
  }
  
  decreaseQty() {
    ((this.line[this.qtyField] - 1) >= 0) ? (this.line[this.qtyField] -= 1) : 0;
    this.onQtyChanged.emit(this.line[this.qtyField]);
  }

  backupQty(line,event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  updateQty() {
    this.onQtyChanged.emit(this.line[this.qtyField]);
  }

  eventHandler(keyCode) {
    if (keyCode === 13) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      this.updateQty();
    }
  }
  
  increaseQty() {
    this.line[this.qtyField] += 1;
    this.onQtyChanged.emit(this.line[this.qtyField]);
  }

}
