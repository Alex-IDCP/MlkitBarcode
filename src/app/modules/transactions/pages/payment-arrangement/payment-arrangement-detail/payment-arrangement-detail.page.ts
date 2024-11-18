import { Component, OnInit, ViewChild } from '@angular/core';
import { PaymentArrangementService } from '../../../services/payment-arrangement.service';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PaymentArrangementRoot } from '../../../models/payment-arrangement';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-payment-arrangement-detail',
   templateUrl: './payment-arrangement-detail.page.html',
   styleUrls: ['./payment-arrangement-detail.page.scss'],
})
export class PaymentArrangementDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

   parent: string = "Payment Arrangement";

   objectId: number;
   object: PaymentArrangementRoot;
   processType: string;
   selectedSegment: string;

   constructor(
      private objectService: PaymentArrangementService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
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

   ionViewWillEnter(): void {
      this.loadMasterList();
   }

   ionViewDidEnter(): void {
      if (!this.objectId) {
         this.toastService.presentToast("System Error", "Something went wrong, Please contact administrator", "top", "danger", 1000);
         this.navController.navigateBack("/transactions")
      } else {
         this.loadObject();
      }
   }

   currenyMasterList: MasterListDetails[] = [];
   paymentMethodMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   loadMasterList() {
      try {
         this.objectService.getMasterList().subscribe(response => {
            this.currenyMasterList = response.filter(x => x.objectName === "Currency").flatMap(src => src.details).filter(y => y.deactivated === 0);
            this.paymentMethodMasterList = response.filter(x => x.objectName === "PaymentMethod").flatMap(src => src.details).filter(y => y.deactivated === 0);
            this.locationMasterList = response.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("System Error", "Something went wrong, Please contact administrator", "top", "danger", 1000);
      }
   }

   ngOnInit() {
   }

   uniqueCurrencyId: number[] = [];
   loadObject() {
      try {
         this.objectService.getObjectById(this.objectId).subscribe({
            next: async (response) => {
               this.object = response;
               this.uniqueCurrencyId = this.object.details.map(x => x.currencyId).filter((value, index, self) => self.indexOf(value) === index);
               await this.loadWorkflow(this.object.header.paymentArrangementId);
            },
            error: (error) => {
               console.error(error);               
            }
         })
      } catch (error) {
         this.toastService.presentToast("System Error", "Something went wrong, Please contact administrator", "top", "danger", 1000);
         console.error(error);
      }
   }

   workFlowState: WorkFlowState[] = [];
   trxChild: TrxChild[] = [];
   loadWorkflow(objectId: number) {
      this.workFlowState = [];
      this.objectService.getWorkflow(objectId).subscribe({
         next: (response) => {
            this.workFlowState = response;
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   getRowByUniqueCurrencyId(currencyId: number) {
      return this.object.details.filter(x => x.currencyId === currencyId);
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
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
      try {
         await this.loadingService.showLoading();
         this.objectService.downloadPdf("FAMS004", "pdf", this.object.header.paymentArrangementId).subscribe(async response => {
            let filename = this.object.header.paymentArrangementNum + ".pdf";
            await this.loadingService.dismissLoading();
            this.commonService.commonDownloadPdf(response, filename);
         }, async error => {
            await this.loadingService.dismissLoading();
            console.log(error);
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region approve reject */

   async presentConfirmAlert(action: string) {
      if (this.processType && this.selectedSegment) {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            backdropDismiss: false,
            header: "Are you sure to " + action + " " + this.object.header.paymentArrangementNum + "?",
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
                           this.toastService.presentToast("", "Please enter reason", "top", "danger", 1000);
                           return false;
                        } else {
                           this.updateDoc(action, [this.object.header.paymentArrangementId.toString()], data.actionreason);
                        }
                     } else {
                        this.updateDoc(action, [this.object.header.paymentArrangementId.toString()], data.actionreason);
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
            this.objectService.bulkUpdateDocumentStatus(this.processType === "REVIEWS" ? "MobilePaymentArrangementReview" : "MobilePaymentArrangementApprove", bulkConfirmReverse).subscribe(async response => {
               if (response.status == 204) {
                  this.toastService.presentToast("", "Doc. updated successfully", "top", "success", 1000);
                  this.navController.back();
               }
            }, error => {
               console.error(error);
            })
         } catch (error) {
            this.toastService.presentToast("System Error", "Something went wrong, please contact Adminstrator", "top", "danger", 1000);
         }
      } else {
         this.toastService.presentToast("System Error", "Something went wrong, please contact Adminstrator", "top", "danger", 1000);
      }
   }

   /* #endregion */

}
