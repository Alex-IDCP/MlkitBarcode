import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { InterTransferHeader, InterTransferRoot } from 'src/app/modules/transactions/models/inter-transfer';
import { InterTransferService } from 'src/app/modules/transactions/services/inter-transfer.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-inter-transfer-cart',
  templateUrl: './inter-transfer-cart.page.html',
  styleUrls: ['./inter-transfer-cart.page.scss'],
})
export class InterTransferCartPage implements OnInit, ViewWillEnter {

  objectHeader: InterTransferHeader;
  itemInCart: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    public objectService: InterTransferService,
    private commonService: CommonService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) {
    this.objectHeader = this.objectService.header;
    this.itemInCart = this.objectService.itemInCart;
  }

  ionViewWillEnter(): void {
    this.objectHeader = this.objectService.header;
    this.itemInCart = this.objectService.itemInCart;
  }

  ngOnInit() {
    
  }

  /* #region  modal to edit each item */

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  selectedIndex: number;
  showEditModal(data: TransactionDetail, rowIndex: number) {
    this.selectedItem = JSON.parse(JSON.stringify(data));
    this.selectedIndex = rowIndex;
    this.isModalOpen = true;
  }

  saveChanges() {
    if (this.selectedIndex === null || this.selectedIndex === undefined) {
      this.toastService.presentToast("System Error", "Please contact Administrator.", "top", "danger", 1000);
      return;
    } else {
      this.itemInCart[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
      this.hideEditModal();
    }
  }

  async cancelChanges() {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to discard changes?',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'success',
            handler: () => {
              this.isModalOpen = false;
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
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

  onModalHide() {
    this.selectedIndex = null;
    this.selectedItem = null;
  }

  /* #endregion */

  /* #region  edit qty */

  computeQty() {
    try {
      if (this.selectedItem.variationTypeCode == "1" || this.selectedItem.variationTypeCode == "2") {
        var totalQty = 0;
        if (this.selectedItem.variationDetails) {
          this.selectedItem.variationDetails.forEach(x => {
            x.details.forEach(y => {
              if (y.qtyRequest && y.qtyRequest < 0) {
                y.qtyRequest = 1;
                this.toastService.presentToast('Error', 'Invalid qty.', 'top', 'danger', 1000);
              }
              totalQty = totalQty + y.qtyRequest;
            });
          })
        }
        this.selectedItem.qtyRequest = totalQty;
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

  increaseVariationQty(data: InnerVariationDetail) {
    try {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      this.computeQty();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  delete item */

  async presentDeleteItemAlert(data: TransactionDetail) {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to delete?',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'danger',
            handler: () => {
              this.removeItemById(data);
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
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

  removeItemById(data: TransactionDetail) {
    try {
      let index = this.itemInCart.findIndex(r => r.itemId === data.itemId);
      if (index > -1) {
        this.itemInCart.splice(index, 1);
      }      
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  computeAllAmount(trxLine: TransactionDetail) {
    trxLine.qtyRequest = parseFloat(trxLine.qtyRequest.toFixed(0));
    try {
      if (trxLine.qtyRequest <= 0) {
        trxLine.qtyRequest = 1;
        this.toastService.presentToast('Error', 'Invalid qty.', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  step */

  previousStep() {
    try {
      this.navController.navigateBack('/transactions/inter-transfer/inter-transfer-item');
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.insertObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  insertObject() {
    try {
      let trxDto: InterTransferRoot = {
        header: this.objectHeader,
        details: this.itemInCart,
        cBMMapping: []
      }
      this.objectService.insertObject(trxDto).subscribe(response => {
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        try {          
          this.objectService.resetVariables();
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: response.body["header"]["interTransferId"],
            }
          }
          this.navController.navigateRoot('/transactions/inter-transfer/inter-transfer-detail', navigationExtras);
        } catch (e) {
          console.error(e);
        }
      }, error => {
        console.error(error);
      });
    } catch (e) {
      console.error(e);
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

}
