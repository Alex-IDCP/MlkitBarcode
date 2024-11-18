import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { OrderLifeCycle, OtherAmount, SalesOrderRoot } from '../../../models/sales-order';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';
import { format, parseISO } from 'date-fns';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ApprovalHistory } from 'src/app/shared/models/approval-history';

@Component({
   selector: 'app-sales-order-detail',
   templateUrl: './sales-order-detail.page.html',
   styleUrls: ['./sales-order-detail.page.scss']
})
export class SalesOrderDetailPage implements OnInit, ViewWillEnter {

   Math: any;

   objectId: any;
   processType: string;
   selectedSegment: string;

   workflowDone: boolean = false;
   otherAmount: OtherAmount[] = [];
   approvalHistory: ApprovalHistory[] = [];
   salesOrderLifeCycleList: OrderLifeCycle[] = [];

   isDraft: boolean = false;
   draftTransactionId: number;
   draftObject: DraftTransaction;

   showDisabledLine: boolean = false;
   showAdditionalInfo: boolean = false;

   constructor(
      public objectService: SalesOrderService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) {
      this.Math = Math;
   }

   async ionViewWillEnter(): Promise<void> {
      try {
         await this.objectService.loadRequiredMaster();
         this.route.queryParams.subscribe(async params => {
            this.isDraft = params["isDraft"];
            if (this.isDraft) {
               this.draftTransactionId = params["draftTransactionId"];
               await this.loadDraftObject();
            } else {
               this.objectId = params["objectId"];
               this.processType = params["processType"];
               this.selectedSegment = params["selectedSegment"];
               if (this.objectId && this.objectId > 0) {
                  await this.loadObject();
               } else {
                  this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "warning", 1000);
                  this.navController.navigateBack("/transactions/sales-order");
               }
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
            object.header = this.commonService.convertObjectAllDateType(object.header);
            this.workflowDone = object.isWorkFlowDone;
            this.otherAmount = object.otherAmount;
            this.approvalHistory = object.approvalHistory;
            this.salesOrderLifeCycleList = object.orderCyle;
            await this.loadWorkflow(object.header.salesOrderId);
            await this.objectService.setHeader(object.header);
            await this.objectService.setLine(object.details);
            await this.objectService.setOtherAmt(object.otherAmount);
            await this.loadingService.dismissLoading();
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
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
         this.workFlowState = response;
         this.objectService.getTrxChild(objectId).subscribe(response2 => {
            this.trxChild = response2;
            if (this.trxChild.length > 0) {
               let trxTypes: string[] = this.trxChild.map(x => x.serviceName);
               trxTypes = [...new Set(trxTypes)];
               trxTypes.forEach(type => {
                  let relatedArray = this.trxChild.filter(x => x.serviceName == type);
                  let trxIds = relatedArray.map(x => x.trxId);
                  let trxNums = relatedArray.map(x => x.trxNum);
                  let trxDates = relatedArray.map(x => x.trxDate);
                  let routerLinks = relatedArray.map(x => x.routerLink);
                  if (type == "SalesInvoice") {
                     type = "Sales Invoice";
                  }
                  let newState: WorkFlowState = {
                     stateId: null,
                     title: type,
                     trxId: null,
                     trxIds: trxIds,
                     trxNum: null,
                     trxNums: trxNums,
                     trxDate: null,
                     trxDates: trxDates,
                     trxBy: null,
                     routerLink: null,
                     routerLinks: routerLinks,
                     icon: "pi pi-star-fill",
                     stateType: "TRANSACTION",
                     isCompleted: true,
                     sequence: null,
                     interval: null
                  }
                  this.workFlowState = [...this.workFlowState, newState]
               })
            }
         }, error => {
            console.log(error);
         });
      }, error => {
         console.error(error);
      })
   }

   loadDraftObject() {
      try {
         this.objectService.getDraftObject(this.draftTransactionId).subscribe(response => {
            this.draftObject = response;
            let object = JSON.parse(this.draftObject.jsonData) as SalesOrderRoot;
            object.header.salesOrderNum = this.draftObject.draftTransactionNum;
            this.isDraft = true;
            this.objectService.setHeader(object.header);
            this.objectService.setLine(object.details);
            this.objectService.setDraftObject(this.draftObject);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         console.error(error);
      }
   }

   editObject() {
      if (this.isDraft) {
         this.objectService.setDraftObject(this.draftObject);
      }
      this.navController.navigateRoot("/transactions/sales-order/sales-order-cart");
   }

   toggleObject() {
      this.objectService.toggleObject(this.objectService.objectHeader.salesOrderId).subscribe(response => {
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
      this.objectService.objectDetail.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
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
            header: "Download PDF?",
            message: "",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.downloadPdf(reportName);
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

   async downloadPdf(reportName: string) {
      try {
         this.objectService.downloadPdf("SMSC002", "pdf", this.objectService.objectHeader.salesOrderId, reportName).subscribe(response => {
            let filename = this.objectService.objectHeader.salesOrderNum + ".pdf";
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

   async presentApprovalAlert(action: string) {
      try {
         if (this.processType && this.selectedSegment) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               backdropDismiss: false,
               header: "Are you sure to " + action + " " + this.objectService.objectHeader.salesOrderNum + "?",
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
                              this.updateDoc(action, [this.objectService.objectHeader.salesOrderId.toString()], data.actionreason);
                           }
                        } else {
                           this.updateDoc(action, [this.objectService.objectHeader.salesOrderId.toString()], data.actionreason);
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
                        workflowApiObject = "MobileSalesOrderReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileSalesOrderApprove";
                        break;
                     case "PRICINGAPPROVAL":
                        workflowApiObject = "MobilePricingApprove";
                        break;
                     case "MAXQTYAPPROVAL":
                        workflowApiObject = "MobileMaxQtyApprove";
                        break;
                     case "CREDITAPPROVAL":
                        workflowApiObject = "MobileSoCreditApprove";
                        break;
                     case "CODAPPROVAL":
                        workflowApiObject = "MobileSoCodApprove";
                        break;
                     case "CODREVIEW":
                        workflowApiObject = "MobileSoCodReview";
                        break;
                     default:
                        this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                        return;
                  }
               }
               if (action.toUpperCase() === "REVERSE") {
                  switch (this.currentWorkflow.stateType.toUpperCase()) {
                     case "REVIEW":
                        workflowApiObject = "MobileSalesOrderReview";
                        break;
                     case "APPROVAL":
                        workflowApiObject = "MobileSalesOrderApprove";
                        break;
                     case "PRICINGAPPROVAL":
                        workflowApiObject = "MobilePricingApprove";
                        break;
                     case "MAXQTYAPPROVAL":
                        workflowApiObject = "MobileMaxQtyApprove";
                        break;
                     case "CREDITAPPROVAL":
                        workflowApiObject = "MobileSoCreditApprove";
                        break;
                     case "CODAPPROVAL":
                        workflowApiObject = "MobileSoCodApprove";
                        break;
                     case "CODREVIEW":
                        workflowApiObject = "MobileSoCodReview";
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

   /* #region order status */

   showStatus() {
      try {
         this.objectService.getStatus(this.objectService.objectHeader.salesOrderId).subscribe(response => {
            this.toastService.presentToast("Doc Status", response.currentStatus, "top", "success", 2000);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region from draft to confirm so */

   async presentConfirmAlert() {
      try {
         if (this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               header: "Are you sure to proceed?",
               subHeader: "This will delete Draft & Generate SO",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        await this.insertObject();
                     },
                  },
                  {
                     text: "Cancel",
                     cssClass: "cancel",
                     role: "cancel"
                  },
               ],
            });
            await alert.present();
         } else {
            this.toastService.presentToast("Control Error", "Please add at least 1 item to continue", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         let trxDto: SalesOrderRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
         if (trxDto.details.filter(r => r.unitPrice === null || r.unitPrice === undefined)?.length > 0) {
            this.toastService.presentToast("Control Error", "Please enter valid price for each line.", "top", "warning", 1000);
            return;
         }
         trxDto.header.salesOrderNum = null; // always default to null when insert
         if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
            this.objectService.confirmDraftObject(this.objectService.draftObject.draftTransactionId, trxDto).subscribe(async response => {
               this.objectService.setSummary(response.body);
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               this.navController.navigateRoot("/transactions/sales-order/sales-order-summary");
            }, async error => {
               await this.loadingService.dismissLoading();
               console.error(error);
            })
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   checkPricingApprovalLines(trxDto: SalesOrderRoot, trxLineArray: TransactionDetail[]) {
      if (trxDto.header.businessModelType === "R" || trxDto.header.businessModelType === "C") {
         trxDto.header.isPricingApproval = false;
      } else {
         let filteredData = trxLineArray.filter(x => x.unitPrice != x.oriUnitPrice || x.unitPriceExTax != x.oriUnitPriceExTax || x.discountGroupCode != x.oriDiscountGroupCode || x.discountExpression != x.oriDiscountExpression);
         filteredData = filteredData.filter(x => !x.isPromoImpactApplied);
         if (filteredData.length > 0) {
            filteredData.forEach(x => { x.isPricingApproval = true });
            trxDto.header.isPricingApproval = true;
         } else {
            trxDto.header.isPricingApproval = false;
         }
      }
      return trxDto;
   }

   /* #endregion */

   /* #region delete draft */

   async presentDeleteDraftAlert() {
      try {
         const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            subHeader: "This will delete Draft",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.deleteDraft();
                  },
               },
               {
                  text: "Cancel",
                  cssClass: "cancel",
                  role: "cancel"
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   deleteDraft() {
      this.objectService.deleteDraftObject(this.draftTransactionId).subscribe(response => {
         if (response.status === 204) {
            this.navController.navigateRoot("/transactions/sales-order");
         }
      }, error => {
         console.error(error);
      })
   }

   /* #endregion */

   formattedDateString: string = "";
   setFormattedDateString() {
      if (this.objectService.objectHeader.deliveryDate) {
         this.formattedDateString = format(parseISO(format(new Date(this.objectService.objectHeader.deliveryDate), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
      } else {
         this.formattedDateString = "";
      }
   }

   previousStep() {
      this.objectService.resetVariables();
   }

   /* #region order life cycle */

   lifeCycleModal: boolean = false;
   showFullOrderLifeCycle() {
      this.lifeCycleModal = true;
   }

   hideOrderLifeCycleModal() {
      this.lifeCycleModal = false;
   }

   /* #endregion */

}
