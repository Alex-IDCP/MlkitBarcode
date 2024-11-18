import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MasterList } from '../../models/master-list';
import { TransactionDetail } from '../../models/transaction-detail';
import { CommonService } from '../../services/common.service';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { format } from 'date-fns';
import { SearchItemService } from '../../services/search-item.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from '../../models/variation-detail';
import { MasterListDetails } from '../../models/master-list-details';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'item-catalog-without-price',
  templateUrl: './item-catalog-without-price.page.html',
  styleUrls: ['./item-catalog-without-price.page.scss'],
})
export class ItemCatalogWithoutPricePage implements OnInit {

  @Input() fullMasterList: MasterList[] = [];
  @Input() showImage: boolean = false;
  
  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();
  
  constructor(    
    private authService: AuthService,
    private commonService: CommonService,
    private searchItemService: SearchItemService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    
  }
  
  itemSearchText: string;
  availableItems: TransactionDetail[] = [];
  availableImages: ItemImage[] = [];
  searchTextChanged() {
    this.availableItems = [];
    this.availableImages = [];
  }

  searchItem() {
    let searchText = this.itemSearchText;
    this.itemSearchText = "";
    try {
      if (searchText && searchText.trim().length > 2) {
        if (Capacitor.getPlatform() !== "web") {
          Keyboard.hide();
        }
        this.searchItemService.getItemInfoWithoutPrice(searchText, format(new Date(), "yyyy-MM-dd")).subscribe(response => {
          this.availableItems = response;
          this.toastService.presentToast("Search Complete", `${this.availableItems.length} item(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
        })
        this.loadImages(searchText);
      } else {
        this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  loadImages(searchText) {
    this.searchItemService.getItemImageFile(searchText).subscribe(response => {
      this.availableImages = response;
    }, error => {
      console.log(error);
    })
  }

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

  /* #region  none variation */

  decreaseQty(data: TransactionDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = 0;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseQty(data: TransactionDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }

  addToCart(data: TransactionDetail) {
    this.onItemAdded.emit(JSON.parse(JSON.stringify(data)));
    data.qtyRequest = 0;
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
    this.selectedItem = JSON.parse(JSON.stringify(data));
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.isModalOpen = true;
  }

  decreaseVariationQty(data: InnerVariationDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = 0;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseVariationQty(data: InnerVariationDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }

  addVariationToCart() {
    var totalQty = 0;
    if (this.selectedItem.variationDetails) {
      this.selectedItem.variationDetails.forEach(x => {
        x.details.forEach(y => {
          totalQty = totalQty + y.qtyRequest;
        });
      })
    }
    this.selectedItem.qtyRequest = totalQty;
    this.onItemAdded.emit(JSON.parse(JSON.stringify(this.selectedItem)));
    this.hideModal();
  }

  /* #endregion */

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.searchItem();
      event.preventDefault();
    }
  }

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

}
