import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { TransactionProcessingCount } from '../../models/transaction-processing';
import { NavController, AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PosApproval, PosApprovalLine } from '../../models/pos-approval-processing';
import { PosApprovalProcessingService } from '../../services/pos-approval-processing.service';
import { MasterListDetails } from '../../models/master-list-details';

@Component({
  selector: 'app-pos-approval-processing',
  templateUrl: './pos-approval-processing.page.html',
  styleUrls: ['./pos-approval-processing.page.scss'],
})
export class PosApprovalProcessingPage implements OnInit {

  posRefundMethodMasterList: MasterListDetails[] = [];

  @Input() parentType: string;
  @Input() processType: string;

  @Input() pendingDocList: PosApproval[] = [];
  @Input() completedDocList: PosApproval[] = [];
  @Output() onObjectUpdated: EventEmitter<number> = new EventEmitter();

  @Input() selectedSegment: string = "pending";

  constructor(
    private objectService: PosApprovalProcessingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadMasterList();
    this.loadCounts();
  }

  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.posRefundMethodMasterList = response.filter(x => x.objectName == "PosRefundMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.error(error);
    })
  }

  transactionProcessingCount: TransactionProcessingCount = { pending: 0, completed: 0, total: 0, isAllowApprove: false };
  loadCounts() {
    this.objectService.getObjectCount().subscribe(response => {
      this.transactionProcessingCount = response;
    }, error => {
      console.error(error);
    })
  }

  async presentConfirmAlert(action: string, docId: number, object: PosApproval) {
    try {
      let docNum = object.posApprovalType === "RF" ? object.posBillNum : "";
      const alert = await this.alertController.create({
        cssClass: "custom-alert",
        backdropDismiss: false,
        header: "Are you sure to " + action + " " + docNum + "?",
        inputs: [
          {
            name: "actionreason",
            type: "textarea",
            placeholder: "Please enter remark",
            value: ""
          }
        ],
        buttons: [
          {
            text: "OK",
            role: "confirm",
            cssClass: "success",
            handler: async (data) => {
              await this.proceedAction(action, docId, data.actionreason);
            },
          },
          {
            text: "Cancel",
            role: "cancel"
          },
        ],
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  proceedAction(action: string, docId: number, remark: string) {
    switch (action) {
      case "CONFIRM":
        this.objectService.approveObject(docId, { remark: remark }).subscribe(response => {
          if (response.status === 204) {
            this.toastService.presentToast("Update Complete", "The document has been processed", "top", "success", 1000);
            this.onObjectUpdated.emit(docId);
          }
        }, error => {
          console.error(error);
        })
        break;
      case "REJECT":
        this.objectService.rejectObject(docId, { remark: remark }).subscribe(response => {
          if (response.status === 204) {
            this.toastService.presentToast("Update Complete", "The document has been processed", "top", "success", 1000);
            this.onObjectUpdated.emit(docId);
          }
        }, error => {
          console.error(error);
        })
        break;
    }
  }

  async goToDetail(object: PosApproval) {
    try {
      if (object.posApprovalType === "RF" || object.posApprovalType === "RD") {
        let docId = object.posApprovalType === "RF" ? object.posBillId : object.salesDepositId;
        let navigationExtras: NavigationExtras;
        navigationExtras = {
          queryParams: {
            objectId: docId,
            processType: this.processType,
            selectedSegment: this.selectedSegment
          }
        }
        this.navController.navigateForward(`/transactions/${this.parentType.toLowerCase()}/${this.parentType.toLowerCase()}-detail`, navigationExtras);
      } else {
        this.loadObjectLine(object.posApprovalId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  exchangeLines: PosApprovalLine[] = [];
  loadObjectLine(objectId: number) {
    this.objectService.getObjectLine(objectId).subscribe(response => {
      this.exchangeLines = response;
      this.showExchangeLineModal();
    }, error => {
      console.log(error);
    })
  }

  /* #region exchange line modal */

  exchangeLineModal: boolean = false;
  showExchangeLineModal() {
    this.exchangeLineModal = true;
  }

  hideExchangeLineModal() {
    this.exchangeLineModal = false;
  }

  /* #endregion */

}
