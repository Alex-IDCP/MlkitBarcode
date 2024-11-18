import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ViewWillEnter, NavController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { SalesOrderRoot } from '../../../models/sales-order';
import { StockReplenishService } from '../../../services/stock-replenish.service';

@Component({
  selector: 'app-stock-replenish-detail',
  templateUrl: './stock-replenish-detail.page.html',
  styleUrls: ['./stock-replenish-detail.page.scss'],
})
export class StockReplenishDetailPage implements OnInit, ViewWillEnter {

  objectId: any;
  object: SalesOrderRoot;
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: StockReplenishService,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
      })
    } catch (e) {
      console.error(e);
    }
  }

  ionViewWillEnter(): void {

  }

  ngOnInit() {
    if (this.objectId && this.objectId > 0) {
      this.loadObject();
    } else {
      this.toastService.presentToast('', 'Invalid Sales Order.', 'top', 'warning', 1000);
      this.navController.navigateBack('/transactions/stock-replenish');
    }
    this.loadModuleControl();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        if (this.object.header.isHomeCurrency) {
          // this.object.header.maxPrecision = this.precisionSales.localMax;
          // this.object.header.maxPrecisionTax = this.precisionTax.localMax
        } else {
          // this.object.header.maxPrecision = this.precisionSales.foreignMax;
          // this.object.header.maxPrecisionTax = this.precisionTax.foreignMax;
        }
        // this.loadWorkflow(this.object.header.salesOrderId);
        this.objectService.setHeader(this.object.header);
        this.objectService.setChoosenItems(this.object.details);
      }, error => {
        console.error(error);
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error', 'Sales Order', 'top', 'danger', 1000);
    }
  }

  // workFlowState: WorkFlowState[] = [];
  // trxChild: TrxChild[] = [];
  // loadWorkflow(objectId: number) {
  //   this.workFlowState = [];
  //   this.objectService.getWorkflow(objectId).subscribe(response => {
  //     this.workFlowState = response;

  //     this.objectService.getTrxChild(objectId).subscribe(response2 => {
  //       this.trxChild = response2;
  //       if (this.trxChild.length > 0) {
  //         let trxTypes: string[] = this.trxChild.map(x => x.serviceName);
  //         trxTypes = [...new Set(trxTypes)];
  //         trxTypes.forEach(type => {
  //           let relatedArray = this.trxChild.filter(x => x.serviceName == type);
  //           let trxIds = relatedArray.map(x => x.trxId);
  //           let trxNums = relatedArray.map(x => x.trxNum);
  //           let trxDates = relatedArray.map(x => x.trxDate);
  //           let routerLinks = relatedArray.map(x => x.routerLink);
  //           if (type == 'SalesInvoice') {
  //             type = 'Sales Invoice';
  //           }
  //           let newState: WorkFlowState = {
  //             stateId: null,
  //             title: type,
  //             trxId: null,
  //             trxIds: trxIds,
  //             trxNum: null,
  //             trxNums: trxNums,
  //             trxDate: null,
  //             trxDates: trxDates,
  //             trxBy: null,
  //             routerLink: null,
  //             routerLinks: routerLinks,
  //             icon: 'pi pi-star-fill',
  //             stateType: 'TRANSACTION',
  //             isCompleted: true,
  //             sequence: null,
  //             interval: null
  //           }
  //           this.workFlowState = [...this.workFlowState, newState]
  //         })
  //       }
  //     }, error => {
  //       console.log(error);
  //     });
  //   }, error => {
  //     console.error(error);
  //   })
  // }

  editObject() {
    this.objectService.setHeader(this.object.header);
    this.objectService.setChoosenItems(this.object.details);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.salesOrderId
      }
    }
    this.navController.navigateRoot('/transactions/stock-replenish/stock-replenish-cart', navigationExtras);
  }

  toggleObject() {
    this.objectService.toggleObject(this.object.header.salesOrderId).subscribe(response => {
      if (response.status === 204) {
        this.loadObject();
        this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
      }
    }, error => {
      console.error(error);
    })
  }

  matchImage(itemId: number) {
    try {
      let defaultImageUrl = "assets/icon/favicon.png";
      return defaultImageUrl;
    } catch (e) {
      console.error(e);
    }
  }

  filter(details: InnerVariationDetail[]) {
    try {
      return details.filter(r => r.qtyRequest > 0);
    } catch (e) {
      console.error(e);
    }
  }

  /* #region show variaton dialog */

  selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
      this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
    }
  }

  /* #endregion */

  /* #region history modal */

  historyModal: boolean = false;
  showHistoryModal() {
    this.historyModal = true;
  }

  hideHistoryModal() {
    this.historyModal = false;
  }

  /* #endregion */

  /* #region download pdf */

  async presentAlertViewPdf(reportName: string) {
    try {
      const alert = await this.alertController.create({
        header: 'Download PDF?',
        message: '',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.downloadPdf(reportName);
            },
          },
          {
            cssClass: 'cancel',
            text: 'Cancel',
            role: 'cancel'
          },
        ]
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  async downloadPdf(reportName: string) {
    try {
      this.objectService.downloadPdf("SMSC002", "pdf", this.object.header.salesOrderId, reportName).subscribe(response => {
        let filename = this.object.header.salesOrderNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        console.log(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */
  
}
