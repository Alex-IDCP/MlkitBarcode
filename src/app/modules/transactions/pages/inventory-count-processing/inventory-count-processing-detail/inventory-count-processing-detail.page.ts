import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { CommonService } from 'src/app/shared/services/common.service';
import { PurchaseOrderLine } from '../../../models/purchase-order';
import { InventoryCountProcessingService } from '../../../services/inventory-count-processing.service';
import { InventoryCountProcessingRoot } from '../../../models/inventory-count-processing';

@Component({
   selector: 'app-inventory-count-processing-detail',
   templateUrl: './inventory-count-processing-detail.page.html',
   styleUrls: ['./inventory-count-processing-detail.page.scss'],
})
export class InventoryCountProcessingDetailPage implements OnInit {

   parent: string = "Inventory Count Processing"

   objectId: number;
   object: InventoryCountProcessingRoot;
   processType: string;
   selectedSegment: string;

   precisionPurchase: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };

   constructor(
      private objectService: InventoryCountProcessingService,
      private authService: AuthService,
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

   ngOnInit() {
      if (!this.objectId) {
         this.toastService.presentToast("Something went wrong!", "", "top", "danger", 1000);
         this.navController.navigateBack("/transactions")
      } else {
         this.loadMasterList();
         this.loadDetail();
      }
   }

   locationMasterList: MasterListDetails[] = [];
   loadMasterList() {
      try {
         this.objectService.getMasterList().subscribe(response => {
            this.locationMasterList = response.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("Error loading master list", "", "top", "danger", 1000);
      }
   }

   loadDetail() {
      try {
         this.objectService.getObject(this.objectId).subscribe(response => {
            this.object = response;
            this.loadWorkflow(this.object.header.inventoryCountProcessingId);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("Error loading object", "", "top", "danger", 1000);
      }
   }

   workFlowState: WorkFlowState[] = [];
   trxChild: TrxChild[] = [];
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
      try {
         await this.loadingService.showLoading();
         this.objectService.downloadPdf("IMCC003", "pdf", this.object.header.inventoryCountProcessingId).subscribe(async response => {
            let filename = this.object.header.inventoryCountProcessingNum + ".pdf";
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
            header: "Are you sure to " + action + " " + this.object.header.inventoryCountProcessingNum + "?",
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
                           this.updateDoc(action, [this.object.header.inventoryCountProcessingId.toString()], data.actionreason);
                        }
                     } else {
                        this.updateDoc(action, [this.object.header.inventoryCountProcessingId.toString()], data.actionreason);
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
            this.objectService.bulkUpdateDocumentStatus(this.processType === "REVIEWS" ? "MobileInventoryProcessingReview" : "MobileInventoryProcessingApprove", bulkConfirmReverse).subscribe(async response => {
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
