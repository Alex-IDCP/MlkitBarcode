import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginUser } from 'src/app/services/auth/login-user';
import { moduleCode, reportAppCode } from 'src/app/shared/models/acl-const';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { ReportsService } from '../../services/reports.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-reports',
   templateUrl: './reports.page.html',
   styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

   loginUser: LoginUser;

   showDebtorLatestOutstanding: boolean = false;
   showSOListing: boolean = false;
   showBOListing: boolean = false;
   showSalesAgentPerformanceAll: boolean = false;
   showSalesByDebtor: boolean = false;
   showCheckQOH: boolean = false;
   showCheckQOHVariation: boolean = false;
   showCheckCreditNote: boolean = false;
   showTransactionInquiry: boolean = false;
   showSalesAnalysis: boolean = false;
   showItemSalesAnalysis: boolean = false;
   showConsignmentCountAnalysis: boolean = false;
   showCustomerDetail: boolean = false;
   showInventoryLevel: boolean = false;
   showConsignmentSalesReport: boolean = false;

   constructor(
      private authService: AuthService,
      private objectService: ReportsService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
   ) { }

   ngOnInit() {
      try {
         this.authService.menuModel$.subscribe(obj => {
            let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.report);
            if (pageItems) {
               this.showDebtorLatestOutstanding = pageItems.findIndex(r => r.title === reportAppCode.mobileDebtorLatestOutstanding) > -1;
               this.showSOListing = pageItems.findIndex(r => r.title === reportAppCode.mobileSOListing) > -1;
               this.showBOListing = pageItems.findIndex(r => r.title === reportAppCode.mobileB2BListing) > -1;
               this.showSalesAgentPerformanceAll = pageItems.findIndex(r => r.title === reportAppCode.mobileSAPerformance) > -1;
               this.showSalesByDebtor = pageItems.findIndex(r => r.title === reportAppCode.mobileSalesByDebtor) > -1;
               this.showCheckQOH = pageItems.findIndex(r => r.title === reportAppCode.mobileCheckQOH) > -1;
               this.showCheckQOHVariation = pageItems.findIndex(r => r.title === reportAppCode.mobileCheckQOHVariation) > -1;
               this.showCheckCreditNote = pageItems.findIndex(r => r.title === reportAppCode.mobileCheckCN) > -1;
               this.showTransactionInquiry = pageItems.findIndex(r => r.title === reportAppCode.mobileTrxInq) > -1;
               this.showSalesAnalysis = pageItems.findIndex(r => r.title === reportAppCode.mobileSalesAnalysis) > -1;
               this.showItemSalesAnalysis = pageItems.findIndex(r => r.title === reportAppCode.mobileItemSalesAnalysis) > -1;
               this.showConsignmentCountAnalysis = pageItems.findIndex(r => r.title === reportAppCode.mobileConsignmentCountAnalysis) > -1;
               this.showCustomerDetail = pageItems.findIndex(r => r.title === reportAppCode.mobileCustomerDetail) > -1;
               this.showInventoryLevel = pageItems.findIndex(r => r.title === reportAppCode.mobileInventoryLevel) > -1;
               this.showConsignmentSalesReport = pageItems.findIndex(r => r.title === reportAppCode.mobileCustomConsignmentSalesReport) > -1;
            }
         })
         this.loginUser = JSON.parse(localStorage.getItem('loginUser'));
      } catch (e) {
         console.error(e);
      }
   }

   goToReport(link: string) {
      this.navController.navigateRoot(`/reports/${link}`);
   }

   async downloadCustomerDetails() {
      try {
         await this.loadingService.showLoading();
         if (this.loginUser.salesAgentId) {
            let paramModel: ReportParameterModel = {
               appCode: "SMMD001",
               format: "pdf",
               documentIds: [this.loginUser.salesAgentId],
               reportName: "Customer Listing By Latest Sales Agent",
            }
            let timestart = new Date();
            await this.objectService.getPdf(paramModel).subscribe(async response => {
               let timeend = new Date();
               await this.loadingService.dismissLoading();
               await this.commonService.commonDownloadPdf(response, "MyCustomerDetail." + paramModel.format);
            }, async error => {
               await this.loadingService.dismissLoading();
               console.log(error);
            })
         } else {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("", "Sales Agent not set", "top", "warning", 1000);
         }
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

}
