import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { moduleCode, trxAppCode } from 'src/app/shared/models/acl-const';

@Component({
   selector: 'app-transactions',
   templateUrl: './transactions.page.html',
   styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

   showQuotation: boolean = false;
   showSalesOrder: boolean = false;
   showBackToBackOrder: boolean = false;
   showPicking: boolean = false;
   showPacking: boolean = false;
   showConsignmentSales: boolean = false;
   showStockCount: boolean = false;
   showInventoryLevelTrading: boolean = false;
   showInventoryLevelRetail: boolean = false;
   showCashDeposit: boolean = false;
   showTruckLoading: boolean = false;
   showInterTransfer: boolean = false;
   showTransferConfirmation: boolean = false;
   showLocationApplication: boolean = false;
   showDebtorApplication: boolean = false;
   showCreditorApplication: boolean = false;
   showStockReplenish: boolean = false;
   showConsignmentCount: boolean = false;
   showConsignmentCountEntry: boolean = false;
   showInboundScan: boolean = false;
   showStockReorder: boolean = false;
   showTransferOut: boolean = false;
   showTransferIn: boolean = false;
   showTransferInScanning: boolean = false;
   showPalletAssembly: boolean = false;
   showTransferBin: boolean = false;
   showBinCount: boolean = false;
   showDoAck: boolean = false;
   showCartonTruckLoading: boolean = false;
   showDefectRequest: boolean = false;
   showScanBarcode: boolean = false;

   constructor(
      private authService: AuthService
   ) { }

   ngOnInit() {
      try {
         this.authService.menuModel$.subscribe(obj => {
            let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.transaction);
            if (pageItems) {
               this.showQuotation = pageItems.findIndex(r => r.title === trxAppCode.mobileQuotation) > -1;
               this.showSalesOrder = pageItems.findIndex(r => r.title === trxAppCode.mobileSalesOrder) > -1;
               this.showBackToBackOrder = pageItems.findIndex(r => r.title === trxAppCode.mobileBackToBackOrder) > -1;
               this.showPicking = pageItems.findIndex(r => r.title === trxAppCode.mobilePicking) > -1;
               this.showPacking = pageItems.findIndex(r => r.title === trxAppCode.mobilePacking) > -1;
               this.showConsignmentSales = pageItems.findIndex(r => r.title === trxAppCode.mobileConsignment) > -1;
               this.showStockCount = pageItems.findIndex(r => r.title === trxAppCode.mobileStockCount) > -1;
               this.showInventoryLevelTrading = pageItems.findIndex(r => r.title === trxAppCode.mobileInventoryLevelTrading) > -1;
               this.showInventoryLevelRetail = pageItems.findIndex(r => r.title === trxAppCode.mobileInventoryLevelRetail) > -1;
               this.showCashDeposit = pageItems.findIndex(r => r.title === trxAppCode.mobileCashDepo) > -1;
               this.showTruckLoading = pageItems.findIndex(r => r.title === trxAppCode.mobileTruckLoading) > -1;
               this.showInterTransfer = pageItems.findIndex(r => r.title === trxAppCode.mobileInterTransfer) > -1;
               this.showTransferConfirmation = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferConfirmation) > -1;
               this.showDebtorApplication = pageItems.findIndex(r => r.title === trxAppCode.mobileDebtorApp) > -1;
               this.showCreditorApplication = pageItems.findIndex(r => r.title === trxAppCode.mobileCreditorApp) > -1;
               this.showLocationApplication = pageItems.findIndex(r => r.title === trxAppCode.mobileLocationApp) > -1;
               this.showConsignmentCount = pageItems.findIndex(r => r.title === trxAppCode.mobileConsignmentCount) > -1;
               this.showConsignmentCountEntry = pageItems.findIndex(r => r.title === trxAppCode.mobileConsignmentCountEntry) > -1;
               this.showInboundScan = pageItems.findIndex(r => r.title === trxAppCode.mobileInboundScan) > -1;
               this.showStockReorder = pageItems.findIndex(r => r.title === trxAppCode.mobileStockReorder) > -1;
               this.showTransferOut = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferOut) > -1;
               this.showTransferIn = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferIn) > -1;
               this.showTransferInScanning = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferInScanning) > -1;
               this.showPalletAssembly = pageItems.findIndex(r => r.title === trxAppCode.mobilePalletAssembly) > -1;
               this.showTransferBin = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferBin) > -1;
               this.showBinCount = pageItems.findIndex(r => r.title === trxAppCode.mobileBinCount) > -1;
               this.showDoAck = pageItems.findIndex(r => r.title === trxAppCode.mobileDoAck) > -1;
               this.showCartonTruckLoading = pageItems.findIndex(r => r.title === trxAppCode.mobileCartonTruckLoading) > -1;
               this.showDefectRequest = pageItems.findIndex(r => r.title === trxAppCode.mobileDefectRequest) > -1;
               this.showScanBarcode = pageItems.findIndex(r => r.title === trxAppCode.mobileScanBarcode) > -1;
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

}
