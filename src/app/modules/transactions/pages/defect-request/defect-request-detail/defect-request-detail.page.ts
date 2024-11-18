import { Component, OnInit, ViewChild } from '@angular/core';
import { DefectRequestService } from '../../../services/defect-request.service';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { DefectRequestDetail } from '../../../models/defect-request';
import { ApprovalHistory } from 'src/app/shared/models/approval-history';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';

@Component({
   selector: 'app-defect-request-detail',
   templateUrl: './defect-request-detail.page.html',
   styleUrls: ['./defect-request-detail.page.scss'],
})
export class DefectRequestDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectId: number;
   processType: string;
   selectedSegment: string;
   workflowDone: boolean = false;
   approvalHistory: ApprovalHistory[] = [];

   showAdditionalInfo: boolean = false;

   constructor(
      public objectService: DefectRequestService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params["objectId"];
         this.processType = params["processType"];
         this.selectedSegment = params["selectedSegment"];
      })
   }

   ngOnInit() {

   }

   ionViewWillEnter(): void {
      if (!this.objectId) {
         this.toastService.presentToast("Something went wrong", "Please contact administrator", "top", "danger", 1000);
         this.navController.navigateRoot("/transactions/defect-request");
      } else {
         this.loadObject();
      }
   }

   ionViewDidEnter(): void {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe({
            next: async (response) => {
               let object = response;
               await this.loadWorkflow(object.header.defectRequestId);
               this.objectService.setObject(object);
               this.approvalHistory = response.approvalHistory;
               await this.loadingService.dismissLoading();
            },
            error: async (error) => {
               await this.loadingService.dismissLoading();
               console.error(error);
            }
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   workFlowState: WorkFlowState[] = [];
   loadWorkflow(objectId: number) {
      this.workFlowState = [];
      this.objectService.getWorkflow(objectId).subscribe(response => {
         this.workFlowState = response;
      }, error => {
         console.error(error);
      })
   }

   filter(details: InnerVariationDetail[]) {
      return details.filter(r => r.qtyRequest > 0);
   }

   previousStep() {
      this.objectService.resetVariables();
   }

   editObject() {
      this.navController.navigateRoot("/transactions/defect-request/defect-request-cart");
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region show variaton dialog */

   showDetails(rowData: DefectRequestDetail) {
      if (rowData.variationTypeCode === "1" || rowData.variationTypeCode === "2") {
         this.objectService.object.details.filter(r => r.lineId !== rowData.lineId).flatMap(r => r.isSelected = false);
         rowData.isSelected = !rowData.isSelected;
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

   /* #region approve reject */

   async presentApprovalAlert(action: string) {
      try {
         if (this.processType && this.selectedSegment) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               backdropDismiss: false,
               header: "Are you sure to " + action + " " + this.objectService.object.header.defectRequestNum + "?",
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
                              this.updateDoc(action, [this.objectService.object.header.defectRequestId.toString()], data.actionreason);
                           }
                        } else {
                           this.updateDoc(action, [this.objectService.object.header.defectRequestId.toString()], data.actionreason);
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
      } catch (e) {
         console.error(e);
      }
   }

   currentWorkflow: WorkFlowState;
   nextWorkflow: WorkFlowState;
   updateDoc(action: string, listOfDoc: string[], actionReason: string) {
      try {
         if (this.processType && this.selectedSegment) {
            let bulkConfirmReverse: BulkConfirmReverse = {
               status: action,
               reason: actionReason,
               docId: listOfDoc.map(i => Number(i))
            }
            try {
               this.currentWorkflow = this.workFlowState[this.workFlowState.filter(r => r.isCompleted).length - 1];
               this.nextWorkflow = this.workFlowState.find(r => r.trxId === null);
               let workflowApiObject: string;
               if (action.toUpperCase() === "CONFIRM" || action.toUpperCase() === "REJECT") {
                  switch (this.nextWorkflow.stateType.toUpperCase()) {
                     case "REVIEW":
                        workflowApiObject = "MobileDefectRequestReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileDefectRequestApprove";
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               if (action.toUpperCase() === "REVERSE") {
                  switch (this.currentWorkflow.stateType.toUpperCase()) {
                     case "REVIEW":
                        workflowApiObject = "MobileDefectRequestReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileDefectRequestApprove";
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               this.objectService.bulkUpdateDocumentStatus(workflowApiObject, bulkConfirmReverse).subscribe(async response => {
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
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */
}
