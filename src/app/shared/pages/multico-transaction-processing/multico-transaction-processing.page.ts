import { Component, Input, OnInit } from '@angular/core';
import { MultiCoTransactionProcessingService } from '../../services/multi-co-transaction-processing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterList } from '../../models/master-list';
import { OtherCompanyTrx } from '../../models/other-company-access';
import { LoginRequest } from 'src/app/services/auth/login-user';
import { MasterListDetails } from '../../models/master-list-details';
import { BulkConfirmReverse, TransactionProcessingDoc } from '../../models/transaction-processing';
import { AlertController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';

@Component({
   selector: 'app-multico-transaction-processing',
   templateUrl: './multico-transaction-processing.page.html',
   styleUrls: ['./multico-transaction-processing.page.scss'],
})
export class MultiCoTransactionProcessingPage implements OnInit {

   @Input() trxEndPoint: string;
   @Input() limitCol: boolean = false;
   @Input() specialTransaction: boolean = false;
   constructor(
      private objectService: MultiCoTransactionProcessingService,
      private commonService: CommonService,
      private toastService: ToastService,
      private alertController: AlertController
   ) { }

   ngOnInit() {
      this.loadMasterList();
      this.loadOtherCompany();
   }

   fullMasterList: MasterList[] = [];
   loadMasterList() {
      this.objectService.getMasterList().subscribe({
         next: (response) => {
            this.fullMasterList = response;
            this.mapMasterList(this.fullMasterList);
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   otherCompaniesMasterList: MasterListDetails[] = [];
   mapMasterList(fullMasterList: MasterList[], showActive?: boolean) {
      this.otherCompaniesMasterList = fullMasterList.filter(x => x.objectName === "OtherCompanies").flatMap(src => src.details).filter(y => showActive ? y.deactivated === 0 : true);
   }

   companyArray: OtherCompanyTrx[] = [];
   loadOtherCompany() {
      this.objectService.getOtherCompany().subscribe({
         next: (response) => {
            this.companyArray = response;
            for (let company of this.companyArray) {
               let newReq: LoginRequest = {
                  userEmail: company.userEmail,
                  password: company.password,
                  loginUserType: "B"
               }
               //Get token for every company
               this.objectService.getTokenByUrl(company.otherCompaniesUrl, newReq).subscribe({
                  next: (response) => {
                     if (response.status === 200) {
                        let responseBody = response.body;
                        if (responseBody.token) {
                           company.token = responseBody.token;
                           //Get pending count for every company
                           this.getTransactionList(company);
                        }
                     }
                  },
                  error: (error) => {
                     console.error(error);
                  }
               })
            }
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   getTransactionList(company: OtherCompanyTrx) {
      this.objectService.getTransactionList(company.token, company.otherCompaniesUrl, this.trxEndPoint).subscribe({
         next: (response) => {
            company.isGetCountSuccess = true;
            company.trxList = [];
            company.trxList = response;
         },
         error: (error) => {
            company.isGetCountSuccess = false;
            console.error(error);
         }
      })
   }

   /* #region search bar */

   searchText: string;
   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   getTrxList(doc: TransactionProcessingDoc[]) {
      if (doc && doc.length > 0 && this.searchText && this.searchText.length > 0) {
         return doc.filter(r => r.docNum.toUpperCase().includes(this.searchText.toUpperCase()) || r.counterPartCode.toUpperCase().includes(this.searchText.toUpperCase()) || r.counterPart.toUpperCase().includes(this.searchText.toUpperCase()));
      } else {
         return doc;
      }
   }

   getTrxListCount(doc: TransactionProcessingDoc[]) {
      if (doc && doc.length > 0 && this.searchText && this.searchText.length > 0) {
         return doc.filter(r => r.docNum.toUpperCase().includes(this.searchText.toUpperCase()) || r.counterPartCode.toUpperCase().includes(this.searchText.toUpperCase()) || r.counterPart.toUpperCase().includes(this.searchText.toUpperCase())).length;
      } else {
         return doc.length;
      }
   }

   /* #endregion */

   /* #region download pdf */

   async presentAlertViewPdf(company: OtherCompanyTrx, doc: TransactionProcessingDoc) {
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
                     await this.downloadPdf(company, doc);
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

   async downloadPdf(company: OtherCompanyTrx, doc: TransactionProcessingDoc) {
      let req: any = [doc.docId];
      try {
         this.objectService.downloadPdf(company.token, company.otherCompaniesUrl, this.trxEndPoint, req).subscribe(async response => {
            let filename = doc.docNum + ".pdf";
            await this.commonService.commonDownloadPdf(response, filename);
            await this.getTransactionList(company);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   async previewPdf(company: OtherCompanyTrx, doc: TransactionProcessingDoc) {
      let req: any = [doc.docId];
      this.objectService.downloadPdf(company.token, company.otherCompaniesUrl, this.trxEndPoint, req).subscribe(async blob => {
         var fileURL = window.URL.createObjectURL(blob);
      }, error => {
         console.log(error);
      })
   }

   /* #endregion */

   /* #region approve action */

   async presentConfirmAlert(action: string, company: OtherCompanyTrx, doc: TransactionProcessingDoc) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            backdropDismiss: false,
            header: `Are you sure to ${action} ${doc.docNum}?`,
            inputs: [
               {
                  name: "actionreason",
                  type: "textarea",
                  placeholder: "Please Enter Reason",
                  value: ""
               }
            ],
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: (data) => {
                     if (action === "REJECT") {
                        if (!data.actionreason && data.actionreason.length === 0) {
                           this.toastService.presentToast("Invalid Action", "Please enter reason", "top", "warning", 1000);
                           return false;
                        } else {
                           this.updateDoc(company, action, [doc.docId.toString()], data.actionreason);
                        }
                     } else {
                        this.updateDoc(company, action, [doc.docId.toString()], data.actionreason);
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
      } catch (e) {
         console.error(e);
      }
   }

   updateDoc(company: OtherCompanyTrx, action: string, listOfDoc: string[], actionReason: string) {
      let bulkConfirmReverse: BulkConfirmReverse = {
         status: action,
         reason: actionReason,
         docId: listOfDoc.map(i => Number(i))
      }
      this.objectService.bulkUpdateDocumentStatus(company.token, company.otherCompaniesUrl, this.trxEndPoint, bulkConfirmReverse).subscribe(async response => {
         if (response.status == 204) {
            await this.getTransactionList(company);
            this.toastService.presentToast("", "Doc review is completed.", "top", "success", 1000);
         }
      }, error => {
         console.log(error);
      })
   }

   /* #endregion */

   displayAmountCountLength(columnData: string) {
      const result = columnData?.split(';').map(s => {
         const [currency, amount] = s?.split('|').map(part => part?.trim());
         return { currency, amount: parseFloat(amount) ?? 0 };
      }) ?? [];
      return result.length ?? 0
   }

   mapAmountStringToArr(columnData: string) {
      const result = columnData?.split(';').map(s => {
         const [currency, amount] = s?.split('|').map(part => part?.trim());
         return { currency, amount: parseFloat(amount) ?? 0 };
      }) ?? [];
      return result
   }

}
