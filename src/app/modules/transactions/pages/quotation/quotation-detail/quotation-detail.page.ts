import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ApprovalHistory } from 'src/app/shared/models/approval-history';
import { ConfigService } from 'src/app/services/config/config.service';
import { OtherAmount } from '../../../models/sales-order';

@Component({
   selector: 'app-quotation-detail',
   templateUrl: './quotation-detail.page.html',
   styleUrls: ['./quotation-detail.page.scss']
})
export class QuotationDetailPage implements OnInit, ViewWillEnter {

   Math: any;

   objectId: number
   processType: string;
   selectedSegment: string;
   otherAmount: OtherAmount[] = [];
   approvalHistory: ApprovalHistory[];

   constructor(
      public objectService: QuotationService,
      private authService: AuthService,
      private commonService: CommonService,
      public configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private route: ActivatedRoute,
      private navController: NavController,
      private alertController: AlertController
   ) {
      this.Math = Math;
   }

   ionViewWillEnter(): void {
      this.route.queryParams.subscribe(async params => {
         this.objectId = params["objectId"];
         this.processType = params["processType"];
         this.selectedSegment = params["selectedSegment"];
         if (!this.objectId) {
            this.navController.navigateBack("/transactions/quotation");
         } else {
            await this.loadObject();
         }
      })
   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            this.otherAmount = object.otherAmount;
            this.approvalHistory = object.approvalHistory;
            this.loadWorkflow(object.header.quotationId);
            await this.objectService.setHeader(object.header);
            await this.objectService.setLine(object.details);
            await this.loadingService.dismissLoading();
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         this.toastService.presentToast("System Error", "Something went wrong", "top", "danger", 1000);
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   workFlowState: WorkFlowState[] = [];
   trxChild: TrxChild[] = [];
   loadWorkflow(objectId: number) {
      this.workFlowState = [];
      this.objectService.getWorkflow(objectId).subscribe(response => {
         if (response) {
            this.workFlowState = response;
         } else {
            this.workFlowState = [];
         }
      }, error => {
         console.error(error);
      })
   }

   editObject() {
      this.navController.navigateRoot("/transactions/quotation/quotation-cart");
   }

   toggleObject() {
      this.objectService.toggleObject(this.objectService.objectHeader.quotationId).subscribe(response => {
         if (response.status === 204) {
            this.loadObject();
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
         }
      }, error => {
         console.error(error);
      })
   }

   matchImage(itemId: number) {
      try {
         let defaultImageUrl = "assets/icon/favicon.png";
         // let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
         // if (lookup) {
         //   return "data:image/png;base64, " + lookup;
         // }
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
      // this.objectService.objectDetail.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
   }

   /* #endregion */

   /* #region history modal */

   historyModal: boolean = false;
   showHistoryModal() {
      try {
         this.historyModal = true;
      } catch (e) {
         console.error(e);
      }
   }

   hideHistoryModal() {
      try {
         this.historyModal = false;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

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
         this.objectService.downloadPdf("SMSC001", "pdf", this.objectService.objectHeader.quotationId).subscribe(response => {
            let filename = this.objectService.objectHeader.quotationNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

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

   /* #region approve reject */

   async presentConfirmAlert(action: string) {
      try {
         if (this.processType && this.selectedSegment) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               backdropDismiss: false,
               header: "Are you sure to " + action + " " + this.objectService.objectHeader.quotationNum + "?",
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
                              this.toastService.presentToast("", "Please enter reason", "top", "warning", 1000);
                              return false;
                           } else {
                              this.updateDoc(action, [this.objectService.objectHeader.quotationId.toString()], data.actionreason);
                           }
                        } else {
                           this.updateDoc(action, [this.objectService.objectHeader.quotationId.toString()], data.actionreason);
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
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
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
                        workflowApiObject = "MobileQuotationReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileQuotationApprove";
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               if (action.toUpperCase() === "REVERSE") {
                  switch (this.currentWorkflow.stateType.toUpperCase()) {
                     case "REVIEW":
                        workflowApiObject = "MobileQuotationReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileQuotationApprove";
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               this.objectService.bulkUpdateDocumentStatus(workflowApiObject, bulkConfirmReverse).subscribe(async response => {
                  if (response.status == 204) {
                     this.toastService.presentToast("", "Doc review is completed", "top", "success", 1000);
                     this.navController.back();
                  }
               }, error => {
                  console.error(error);
               })
            } catch (error) {
               this.toastService.presentToast("System Error", "Update error", "top", "danger", 1000);
               console.error(error);
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async generateSOConfirmation() {
      try {
         if (this.objectService.objectHeader.quotationId > 0) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               backdropDismiss: false,
               header: "Are you sure to proceed with SO Generate?",
               buttons: [
                  {
                     text: "OK",
                     role: "confirm",
                     cssClass: "success",
                     handler: async (data) => {
                        await this.generateSOButtonClicked();
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
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   generateSOButtonClicked() {
      if (this.objectService.objectHeader) {
         if (this.workFlowState) {
            let isReviewComplete = this.workFlowState.find(x => x.currentService == "QuotationReview")?.isCompleted == undefined ? true : this.workFlowState.find(x => x.currentService == "QuotationReview")?.isCompleted
            let isApprovalComplete = this.workFlowState.find(x => x.currentService == "QuotationApprove")?.isCompleted == undefined ? true : this.workFlowState.find(x => x.currentService == "QuotationApprove")?.isCompleted
            let poTrxId = this.workFlowState.find(x => x.routerLink == "/sm/sales-order")?.trxId
            if (poTrxId) {
               this.toastService.presentToast("Validation", "SO is already generated", "top", "warning", 1000);
            } else if (!isReviewComplete) {
               this.toastService.presentToast("Validation", "Quotation pending for review", "top", "warning", 1000);
            } else if (!isApprovalComplete) {
               this.toastService.presentToast("Validation", "Quotation pending for approval", "top", "warning", 1000);
            } else {
               this.generateSO();
            }
         } else {
            this.generateSO();
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
      }
   }

   generateSO() {
      this.objectService.generateDocument(this.objectService.objectHeader.quotationId).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("Generate Complete", "Sales Order has been generated.", "top", "success", 1000);
         }
      }, error => {
         console.log(error);
      });
   }

}
