import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DebtorApplicationRoot } from '../../../models/debtor-application';
import { DebtorApplicationService } from '../../../services/debtor-application.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { WorkFlowState } from 'src/app/shared/models/workflow';

@Component({
   selector: 'app-debtor-application-detail',
   templateUrl: './debtor-application-detail.page.html',
   styleUrls: ['./debtor-application-detail.page.scss'],
})
export class DebtorApplicationDetailPage implements OnInit {

   objectId: number
   object: DebtorApplicationRoot;
   workflowState: WorkFlowState[] = [];
   editable: boolean = false;

   constructor(
      public objectService: DebtorApplicationService,
      private route: ActivatedRoute,
      private alertController: AlertController,
      private navController: NavController,
      private toastService: ToastService,
      private commonService: CommonService
   ) {
      try {
         this.route.queryParams.subscribe(params => {
            this.objectId = params["objectId"];
            if (!this.objectId) {
               this.navController.navigateBack("/transactions/debtor-application");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
      if (!this.objectId) {
         this.navController.navigateBack("/transactions")
      } else {
         this.loadObject();
      }
   }

   loadObject() {
      try {
         this.objectService.getObjectById(this.objectId).subscribe(response => {
            this.object = response;
            this.loadWorkflow(this.object.header.customerPreId);
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
         this.toastService.presentToast("Error loading object", "", "top", "danger", 1000);
      }
   }

   loadWorkflow(objectId) {
      this.objectService.getWorkflow(objectId).subscribe(response => {
         this.workflowState = response;
         this.editable = !this.workflowState.find(r => r.stateType === "REVIEW")?.isCompleted // if review or approve not complete meaning can edit;
      }, error => {
         console.error(error);
      })
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

   showStatus() {
      if (this.workflowState.length === 0) {
         this.toastService.presentToast("Doc Status", "No workflow found.", "top", "success", 2000);
      } else {
         let currenctStatus = this.workflowState.filter(r => !r.isCompleted).sort((a, b) => a.sequence - b.sequence)[0];
         if (currenctStatus && currenctStatus.title) {
            this.toastService.presentToast("Doc Status", "Pending " + currenctStatus.title, "top", "success", 2000);
         } else {
            this.toastService.presentToast("Doc Status", "Workflow completed, debtor generated.", "top", "success", 1000);
         }
      }
   }

   file: any;
   @ViewChild("fileInput", { static: false }) fileInput: ElementRef;
   onFileChange(fileChangeEvent) {
      this.file = fileChangeEvent.target.files[0];
   }

   async startUpload() {
      if (this.file) {
         try {
            // const response = await fetch(this.file.data);
            // const blob = await response.blob();
            const formData = new FormData();
            formData.append("file", this.file, this.file.name);
            this.objectService.uploadFile(this.object.header.customerPreId, 0, formData).subscribe(response => {
               if (response.status === 204) {
                  this.file = null;
                  this.fileInput.nativeElement.value = null;
                  this.loadObject();
                  this.toastService.presentToast("Upload Complete", "", "top", "success", 1000);
               }
            }, error => {
               console.log(error);
            })
         } catch (e) {
            console.error(e);
         }
      }
   }

   downloadFile(object) {
      this.objectService.downloadFile(object.filesId).subscribe(async response => {
         await this.commonService.commonDownload(response, object);
         this.toastService.presentToast("", "Download Complete", "top", "success", 1000);
      }, error => {
         console.error(error);
      })
   }

   async deleteFile(object) {
      try {
         const alert = await this.alertController.create({
            header: "Delete File?",
            message: "",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     this.objectService.deleteFile(object.filesId).subscribe(response => {
                        if (response.status === 204) {
                           this.loadObject();
                           this.toastService.presentToast("Delete Complete", "", "top", "success", 1000);
                        }
                     }, error => {
                        console.error(error);
                     })
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
         this.objectService.downloadPdf("FAAR006", "pdf", this.object.header.customerPreId, reportName).subscribe(response => {
            let filename = this.object.header.name + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region edit object */

   editObject() {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: this.object.header.customerPreId
         }
      }
      this.navController.navigateRoot("/transactions/debtor-application/debtor-application-edit", navigationExtras);
   }

   /* #endregion */

   toggleObject() {
      this.objectService.toggleObject(this.object.header.customerPreId).subscribe(response => {
         if (response.status === 200) {
            this.loadObject();
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
         }
      }, error => {
         console.error(error);
      })
   }

}
