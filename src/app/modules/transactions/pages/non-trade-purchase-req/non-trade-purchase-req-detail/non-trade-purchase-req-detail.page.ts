import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { NonTradePurchaseReqService } from '../../../services/non-trade-purchase-req.service';
import { NonTradePurchaseReqRoot } from '../../../models/non-trade-purchase-req';

@Component({
  selector: 'app-non-trade-purchase-req-detail',
  templateUrl: './non-trade-purchase-req-detail.page.html',
  styleUrls: ['./non-trade-purchase-req-detail.page.scss'],
})
export class NonTradePurchaseReqDetailPage implements OnInit {

  parent: string = "Non Trade Purchase Req"

  objectId: number;
  object: NonTradePurchaseReqRoot;
  processType: string;
  selectedSegment: string;
  
  precisionPurchase: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private objectService: NonTradePurchaseReqService,
    private alertController: AlertController,
    private commonService: CommonService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
      this.processType = params["processType"];
      this.selectedSegment = params["selectedSegment"];
      if (params["parent"]) {
        this.parent = params["parent"];
      }
    })
  }

  ngOnInit() {
    this.loadModuleControl();
    if (!this.objectId) {
      this.toastService.presentToast("Something went wrong!", "", "top", "danger", 1000);
      this.navController.navigateBack("/transactions")
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  loadModuleControl() {
    this.authService.precisionList$.subscribe(precision =>{
      this.precisionPurchase = precision.find(x => x.precisionCode == "PURCHASE");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
    })
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.objectService.getMasterList().subscribe(response => {
        this.locationMasterList = response.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      }, error => {
        console.error(error);
      })
    } catch (error) {
      this.toastService.presentToast("Error loading master list", "", "top", "danger", 1000);
    }
  }

  loadDetail() {
    try {
      this.objectService.getNonTradePurchaseReqDetail(this.objectId).subscribe(response => {
        this.object = response;
        // this.flattenPurchaseReq = this.objectService.unflattenDtoDetail(this.object);
      }, error => {
        console.error(error);
      })
    } catch (error) {
      this.toastService.presentToast("", "Error loading object", "top", "danger", 1000);
    }
  }

  getFlattenVariations(itemId: number): TransactionDetail[] {
    return null;
    // return this.flattenPurchaseReq.details.filter(r => r.itemId === itemId);
  }

  filter(details: InnerVariationDetail[]) {
    return details.filter(r => r.qtyRequest > 0);
  }

  /* #region show variaton dialog */

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

  async presentAlertViewPdf() {
    const alert = await this.alertController.create({
      header: "Download PDF?",
      message: "",
      buttons: [
        {
          text: "OK",
          cssClass: "success",
          role: "confirm",
          handler: async () => {
            await this.downloadPdf();
          },
        },
        {
          cssClass: "cancel",
          text: "Cancel",
          role: "cancel"
        },
      ]
    });
    await alert.present();
  }

  async downloadPdf() {
    this.objectService.downloadPdf("IMPC007", "pdf", this.object.header.nonTradePurchaseReqId).subscribe(response => {
      let filename = this.object.header.nonTradePurchaseReqNum + ".pdf";
      this.commonService.commonDownloadPdf(response, filename);
    }, error => {
      console.log(error);
    })
  }

  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    this.popoverMenu.event = event;
    this.isPopoverOpen = true;
  }

  /* #endregion */

  /* #region approve reject */

  async presentConfirmAlert(action: string) {
    if (this.processType && this.selectedSegment) {
      const alert = await this.alertController.create({
        cssClass: "custom-alert",
        backdropDismiss: false,
        header: "Are you sure to " + action + " " + this.object.header.nonTradePurchaseReqNum + "?",
        inputs: [
          {
            name: "actionreason",
            type: "textarea",
            placeholder: "Please enter Reason",
            value: ""
          }
        ],
        buttons: [
          {
            text: "OK",
            role: "confirm",
            cssClass: "success",
            handler: (data) => {
              if (action === "REJECT" && this.processType) {
                if (!data.actionreason && data.actionreason.length === 0) {
                  this.toastService.presentToast("Please enter reason", "", "top", "danger", 1000);
                  return false;
                } else {
                  this.updateDoc(action, [this.object.header.nonTradePurchaseReqId.toString()], data.actionreason);
                }
              } else {
                this.updateDoc(action, [this.object.header.nonTradePurchaseReqId.toString()], data.actionreason);
              }
            },
          },
          {
            text: "Cancel",
            role: "cancel"
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast("System Error", "Something went wrong, please contact Adminstrator", "top", "danger", 1000);
    }
  }

  updateDoc(action: string, listOfDoc: string[], actionReason: string) {
    if (this.processType && this.selectedSegment) {
      let bulkConfirmReverse: BulkConfirmReverse = {
        status: action,
        reason: actionReason,
        docId: listOfDoc.map(i => Number(i))
      }
      try {
        this.objectService.bulkUpdateDocumentStatus(this.processType === "REVIEWS" ? "MobileNonTradePurchaseReqReview" : "MobileNonTradePurchaseReqApprove", bulkConfirmReverse).subscribe(async response => {
          if (response.status == 204) {
            this.toastService.presentToast("Doc review is completed.", "", "top", "success", 1000);
            this.navController.back();
          }
        }, error => {
          console.error(error);
        })
      } catch (error) {
        this.toastService.presentToast("Update error", "", "top", "danger", 1000);
      }
    } else {
      this.toastService.presentToast("System Error", "Something went wrong, please contact Adminstrator", "top", "danger", 1000);
    }
  }

  /* #endregion */

}
