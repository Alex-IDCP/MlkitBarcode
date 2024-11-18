import { Component, OnInit, ViewChild } from '@angular/core';
import { SalesBillService } from '../../../services/sales-bill.service';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, ViewWillEnter } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PosBillRoot } from '../../../models/pos-bill';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-pos-bill-detail',
  templateUrl: './pos-bill-detail.page.html',
  styleUrls: ['./pos-bill-detail.page.scss'],
})
export class PosBillDetailPage implements OnInit, ViewWillEnter {

  parent: string = "";

  objectId: number;
  processType: string;
  selectedSegment: string;

  constructor(
    private objectService: SalesBillService,
    private toastService: ToastService,
    private alertController: AlertController,
    private route: ActivatedRoute,
  ) { }

  async ionViewWillEnter(): Promise<void> {
    await this.loadMasterList();
    await  this.loadStaticLov();
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
      this.processType = params["processType"];
      this.selectedSegment = params["selectedSegment"];
      if (params["parent"]) {
        this.parent = params["parent"];
      }
      if (this.objectId) {
        this.loadObject();
      }
    })
  }

  ngOnInit() {
  }

  paymentTypeMasterList: MasterListDetails[];
  locationMasterList: MasterListDetails[];
  merchantMasterList: MasterListDetails[];
  posRefundMethodMasterList: MasterListDetails[];
  promoterMasterList: MasterListDetails[];
  fPromoterMasterList: MasterListDetails[];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.paymentTypeMasterList = response.filter(x => x.objectName == "PaymentType").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.merchantMasterList = response.filter(x => x.objectName == "CardMerchant").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.posRefundMethodMasterList = response.filter(x => x.objectName == "PosRefundMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.promoterMasterList = response.filter(x => x.objectName == "Promoter").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.fPromoterMasterList = this.promoterMasterList;
    }, error => {
      console.log(error);
    })
  }

  posBillTypeMasterList: MasterListDetails[] = [];
  loadStaticLov() {
    this.objectService.getStaticLovList().subscribe(response => {
      this.posBillTypeMasterList = response.filter(x => x.objectName == "PosBillType").flatMap(src => src.details).filter(y => y.deactivated == 0);
    })
  }

  object: PosBillRoot;
  loadObject() {
    if (this.objectId) {
      this.object = null;
      this.objectService.getSalesBillById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        console.log(error);
      })
      
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    this.popoverMenu.event = event;
    this.isPopoverOpen = true;
  }

  /* #endregion */

  /* #region approve reject */

  // async presentConfirmAlert(action: string) {
  //   if (this.processType && this.selectedSegment) {
  //     const alert = await this.alertController.create({
  //       cssClass: "custom-alert",
  //       backdropDismiss: false,
  //       header: "Are you sure to " + action + " " + this.object?.header?.posBillNum + "?",
  //       inputs: [
  //         {
  //           name: "actionreason",
  //           type: "textarea",
  //           placeholder: "Please enter remark",
  //           value: ""
  //         }
  //       ],
  //       buttons: [
  //         {
  //           text: "OK",
  //           role: "confirm",
  //           cssClass: "success",
  //           handler: async (data) => {
  //             await this.proceedAction(action, this.object?.header?.posApprovalId, data.actionreason);
  //           },
  //         },
  //         {
  //           text: "Cancel",
  //           role: "cancel"
  //         },
  //       ],
  //     });
  //     await alert.present();
  //   } else {
  //     this.toastService.presentToast("System Error", "Something went wrong, please contact Adminstrator", "top", "danger", 1000);
  //   }
  // }

  // proceedAction(action: string, docId: number, remark: string) {
  //   switch (action) {
  //     case "CONFIRM":
  //       this.objectService.approveObject(docId, { remark: remark }).subscribe(response => {
  //         if (response.status === 204) {
  //           this.toastService.presentToast("Update Complete", "The document has been processed", "top", "success", 1000);
  //           this.onObjectUpdated.emit(docId);
  //         }
  //       }, error => {
  //         console.error(error);
  //       })
  //       break;
  //     case "REJECT":
  //       this.objectService.rejectObject(docId, { remark: remark }).subscribe(response => {
  //         if (response.status === 204) {
  //           this.toastService.presentToast("Update Complete", "The document has been processed", "top", "success", 1000);
  //           this.onObjectUpdated.emit(docId);
  //         }
  //       }, error => {
  //         console.error(error);
  //       })
  //       break;
  //   }
  // }

}
