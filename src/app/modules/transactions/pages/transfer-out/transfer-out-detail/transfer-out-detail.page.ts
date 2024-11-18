import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferOutLine } from '../../../models/transfer-out';
import { TransferOutService } from '../../../services/transfer-out.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ApprovalHistory } from 'src/app/shared/models/approval-history';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';

@Component({
   selector: 'app-transfer-out-detail',
   templateUrl: './transfer-out-detail.page.html',
   styleUrls: ['./transfer-out-detail.page.scss'],
})
export class TransferOutDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   processType: string;
   selectedSegment: string;
   workflowDone: boolean = false;
   approvalHistory: ApprovalHistory[] = [];
   
   constructor(
      public objectService: TransferOutService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      try {
         await this.objectService.loadRequiredMaster();
         this.route.queryParams.subscribe(params => {
            this.objectId = params["objectId"];
            this.processType = params["processType"];
            this.selectedSegment = params["selectedSegment"];
            if (this.objectId && this.objectId > 0) {
               this.loadObject();
            } else {
               this.toastService.presentToast("", "Invalid Transfer Out", "top", "warning", 1000);
               this.navController.navigateBack("/transactions/transfer-out");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object = this.commonService.convertObjectAllDateType(object);
            this.objectService.getAttachmentIdByDocId(object.transferOutId).subscribe({
               next: async (response2) => {
                  if (response2) {
                     await this.objectService.setAttachment(response2);
                  }
               },
               error: (error) => {
                  console.error(error);
               }
            })
            await this.loadWorkflow(object.transferOutId);
            await this.objectService.setHeader(object);
            await this.objectService.setLine(object.line);
         }, async error => {
            console.error(error);
         })
      } catch (e) {
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

   isCountingTimer: boolean = true;
   async completeObjectAlert() {
      const alert = await this.alertController.create({
         header: "Are you sure to proceed?",
         cssClass: "custom-action-sheet",
         buttons: [
            {
               text: "Yes",
               role: "confirm",
               cssClass: "success",
               handler: async () => {
                  if (this.isCountingTimer) {
                     this.isCountingTimer = false;
                     this.completeObject();
                  }
                  setTimeout(() => {
                     this.isCountingTimer = true;
                  }, 1000);
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               cssClass: "cancel",
            },
         ],
      });
      await alert.present();
   }

   completeObject() {
      this.objectService.completeObject(this.objectId).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("", "Inter Transfer generated", "top", "success", 1000);
            this.loadObject();
         }
      }, error => {
         console.error(error);
      })
   }

   editObject() {
      this.navController.navigateRoot("/transactions/transfer-out/transfer-out-header");
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

   filter(details: TransferOutLine[]) {
      try {
         return details.filter(r => r.lineQty > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region download pdf */

   async presentAlertViewPdf() {
      try {
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
      } catch (e) {
         console.error(e);
      }
   }

   async downloadPdf() {
      try {
         await this.loadingService.showLoading();
         this.objectService.downloadPdf("WDWO003", "pdf", this.objectService.objectHeader.interTransferId, null).subscribe(response => {
            let filename = this.objectService.objectHeader.interTransferNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
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
               header: "Are you sure to " + action + " " + this.objectService.objectHeader.transferOutNum + "?",
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
                              this.updateDoc(action, [this.objectService.objectHeader.transferOutId.toString()], data.actionreason);
                           }
                        } else {
                           this.updateDoc(action, [this.objectService.objectHeader.transferOutId.toString()], data.actionreason);
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
                        if(this.objectService.objectHeader.typeCode == 'IL'){
                           workflowApiObject = "MobileTransferOutReview";
                        } else if (this.objectService.objectHeader.typeCode == 'C'){
                           workflowApiObject = "MobileCoTransferOutReview";
                        }
                        break;
                     case "APPROVAL":
                        if (this.objectService.objectHeader.typeCode == 'IL') {
                           workflowApiObject = "MobileTransferOutApprove";
                        } else if (this.objectService.objectHeader.typeCode == 'C') {
                           workflowApiObject = "MobileCoTransferOutApprove";
                        }
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               if (action.toUpperCase() === "REVERSE") {
                  switch (this.currentWorkflow.stateType.toUpperCase()) {
                     case "REVIEW":
                        if (this.objectService.objectHeader.typeCode == 'IL') {
                           workflowApiObject = "MobileTransferOutReview";
                        } else if (this.objectService.objectHeader.typeCode == 'C') {
                           workflowApiObject = "MobileCoTransferOutReview";
                        }
                        break;
                     case "APPROVAL":
                        if (this.objectService.objectHeader.typeCode == 'IL') {
                           workflowApiObject = "MobileTransferOutApprove";
                        } else if (this.objectService.objectHeader.typeCode == 'C') {
                           workflowApiObject = "MobileCoTransferOutApprove";
                        }
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

   /* #region attachment */

   attachmentModel: boolean = false;
   viewAttachment() {
      this.showAttachmentModal();
   }

   showAttachmentModal() {
      this.attachmentModel = true;
   }

   hideAttachmentModal() {
      this.attachmentModel = false;
   }

   /* #endregion */

   showTotalByCarton: boolean = false;
   getTotalByCarton() {
      let result: Map<number, number> = new Map([]);
      this.objectService.objectDetail.flatMap(r => r.containerNum).forEach(r => {
         result.set(r, this.objectService.objectDetail.filter(rr => rr.containerNum === r).map(rr => rr.lineQty).reduce((a, b) => a + b, 0));
      })
      return result;
   }
   
}
