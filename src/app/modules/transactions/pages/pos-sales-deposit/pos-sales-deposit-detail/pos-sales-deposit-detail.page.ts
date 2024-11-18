import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, AlertController, IonPopover } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SalesDepositService } from '../../../services/sales-deposit.service';
import { SalesDepositRoot } from '../../../models/sales-deposit';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
   selector: 'app-pos-sales-deposit-detail',
   templateUrl: './pos-sales-deposit-detail.page.html',
   styleUrls: ['./pos-sales-deposit-detail.page.scss'],
})
export class PosSalesDepositDetailPage implements OnInit, ViewWillEnter {

   parent: string = "";

   objectId: number;
   processType: string;
   selectedSegment: string;

   constructor(
      private objectService: SalesDepositService,
      private authService: AuthService,
      private toastService: ToastService,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.loadMasterList();
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

   locationMasterList: MasterListDetails[] = [];
   customerMasterList: MasterListDetails[] = [];
   paymentTypeMasterList: MasterListDetails[] = [];
   cardMerchantMasterList: MasterListDetails[] = [];
   loadMasterList() {
      this.objectService.getMasterList().subscribe(response => {
         this.locationMasterList = response.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
         this.customerMasterList = response.filter(x => x.objectName == "Customer").flatMap(src => src.details).filter(y => y.deactivated == 0);
         this.paymentTypeMasterList = response.filter(x => x.objectName == "PaymentType").flatMap(src => src.details).filter(y => y.deactivated == 0);
         this.cardMerchantMasterList = response.filter(x => x.objectName == "CardMerchant").flatMap(src => src.details).filter(y => y.deactivated == 0);
         // this.authService.customerMasterList$.subscribe(obj => {
         //    let savedCustomerList = obj;
         //    if (savedCustomerList) {
         //       this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         //    }
         // })
      }, error => {
         console.log(error);
      })
   }

   object: SalesDepositRoot;
   loadObject() {
      if (this.objectId) {
         this.object = null;
         this.objectService.getSalesDepositById(this.objectId).subscribe(response => {
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
