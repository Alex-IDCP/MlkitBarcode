import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, IonPopover, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PurchaseReqService } from '../../../services/purchase-req.service';
import { PurchaseReqLine, PurchaseReqRoot } from '../../../models/purchase-req';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';

@Component({
   selector: 'app-purchase-req-detail',
   templateUrl: './purchase-req-detail.page.html',
   styleUrls: ['./purchase-req-detail.page.scss'],
})
export class PurchaseReqDetailPage implements OnInit, ViewWillEnter {

   parent: string = "Purchase Req"

   objectId: number;
   object: PurchaseReqRoot;
   flattenPurchaseReq: any;
   processType: string;
   selectedSegment: string;

   precisionPurchase: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };

   constructor(
      private authService: AuthService,
      private route: ActivatedRoute,
      private navController: NavController,
      private toastService: ToastService,
      private objectService: PurchaseReqService,
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

   ionViewWillEnter(): void {
      this.loadMasterList();
   }

   ngOnInit() {
      this.loadModuleControl();
      if (!this.objectId) {
         this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
         this.navController.navigateBack("/transactions")
      } else {
         this.loadObject();
      }
   }

   loadModuleControl() {
      this.authService.precisionList$.subscribe(precision => {
         this.precisionPurchase = precision.find(x => x.precisionCode == "PURCHASE");
         this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
   }

   locationMasterList: MasterListDetails[] = [];
   vendorMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   loadMasterList() {
      try {
         this.objectService.getMasterList().subscribe(response => {
            this.locationMasterList = response.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
            this.vendorMasterList = response.filter(x => x.objectName == "Vendor").flatMap(src => src.details).filter(y => y.deactivated == 0);
            this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
            this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   loadObject() {
      try {
         this.objectService.getPurchaseReqDetail(this.objectId).subscribe(response => {
            this.object = response;
            this.loadWorkflow(this.object.header.purchaseReqId);
            this.flattenPurchaseReq = this.objectService.unflattenDtoDetail(this.object);
         }, error => {
            console.error(error);
         })
      } catch (error) {
         this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
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

   getFlattenVariations(itemId: number): PurchaseReqLine[] {
      return this.flattenPurchaseReq.details.filter(r => r.itemId === itemId);
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
      this.objectService.downloadPdf("IMPC001", "pdf", this.object.header.purchaseReqId).subscribe(response => {
         let filename = this.object.header.purchaseReqNum + ".pdf";
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
            header: "Are you sure to " + action + " " + this.object.header.purchaseReqNum + "?",
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
                           this.toastService.presentToast("Control Error", "Please enter reason", "top", "warning", 1000);
                           return false;
                        } else {
                           this.updateDoc(action, [this.object.header.purchaseReqId.toString()], data.actionreason);
                        }
                     } else {
                        this.updateDoc(action, [this.object.header.purchaseReqId.toString()], data.actionreason);
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
         this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
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
            this.objectService.bulkUpdateDocumentStatus(this.processType === "REVIEWS" ? "MobilePurchaseReqReview" : "MobilePurchaseReqApprove", bulkConfirmReverse).subscribe(async response => {
               if (response.status == 204) {
                  this.toastService.presentToast("Doc review is completed.", "", "top", "success", 1000);
                  this.navController.back();
               }
            }, error => {
               console.error(error);
            })
         } catch (error) {
            this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
         }
      } else {
         this.toastService.presentToast("System Erorr", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   /* #endregion */

}
