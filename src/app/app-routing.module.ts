import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

const routes: Routes = [
   {
      path: '',
      redirectTo: 'welcome', // TODO: Set this to ''
      pathMatch: 'full',
   },
   {
      path: '',
      loadChildren: () => import('./modules/secure/secure.module').then(m => m.SecureModule),
      // canActivate: [AuthGuard] // Secure all child pages
   },
   {
      path: 'welcome',
      loadChildren: () => import('./modules/public/welcome/welcome.module').then(m => m.WelcomePageModule),
      // canActivate: [PublicGuard] // Prevent for signed in users
   },
   {
      path: 'signin',
      loadChildren: () => import('./modules/public/signin/signin.module').then(m => m.SigninPageModule),
      // canActivate: [PublicGuard] // Prevent for signed in users
   },
   {
      path: 'forget-password',
      loadChildren: () => import('./modules/public/forget-password/forget-password.module').then(m => m.ForgetPasswordPageModule)
   },


   // dashboard  
   {
      path: 'dashboard',
      loadChildren: () => import('./modules/dashboard/pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
   },




   // management
   {
      path: 'managements',
      loadChildren: () => import('./modules/managements/pages/management/management.module').then(m => m.ManagementPageModule)
   },
   // management-quotation
   {
      path: 'managements/quotation-reviews',
      loadChildren: () => import('./modules/managements/pages/quotation-reviews/quotation-reviews.module').then(m => m.QuotationReviewsPageModule)
   },
   {
      path: 'managements/quotation-approvals',
      loadChildren: () => import('./modules/managements/pages/quotation-approvals/quotation-approvals.module').then(m => m.QuotationApprovalsPageModule)
   },
   // management-sales-order
   {
      path: 'managements/sales-order-reviews',
      loadChildren: () => import('./modules/managements/pages/sales-order-reviews/sales-order-reviews.module').then(m => m.SalesOrderReviewsPageModule)
   },
   {
      path: 'managements/sales-order-approvals',
      loadChildren: () => import('./modules/managements/pages/sales-order-approvals/sales-order-approvals.module').then(m => m.SalesOrderApprovalsPageModule)
   },
   // management-pricing
   {
      path: 'managements/pricing-approvals',
      loadChildren: () => import('./modules/managements/pages/pricing-approvals/pricing-approvals.module').then(m => m.PricingApprovalsPageModule)
   },
   // management b2b cod
   {
      path: 'managements/so-cod-approvals',
      loadChildren: () => import('./modules/managements/pages/so-cod-approvals/so-cod-approvals.module').then(m => m.SoCodApprovalsPageModule)
   },
   {
      path: 'managements/so-cod-reviews',
      loadChildren: () => import('./modules/managements/pages/so-cod-reviews/so-cod-reviews.module').then(m => m.SoCodReviewsPageModule)
   },
   // managemetn b2b credit
   {
      path: 'managements/so-credit-approvals',
      loadChildren: () => import('./modules/managements/pages/so-credit-approvals/so-credit-approvals.module').then(m => m.SoCreditApprovalsPageModule)
   },
   {
      path: 'managements/somxq-approvals',
      loadChildren: () => import('./modules/managements/pages/somxq-approval/somxq-approval.module').then(m => m.SomxqApprovalPageModule)
   },
   // management-b2bo
   {
      path: 'managements/b2bo-reviews',
      loadChildren: () => import('./modules/managements/pages/b2bo-reviews/b2bo-reviews.module').then(m => m.B2boReviewsPageModule)
   },
   {
      path: 'managements/b2bo-approvals',
      loadChildren: () => import('./modules/managements/pages/b2bo-approvals/b2bo-approvals.module').then(m => m.B2boApprovalsPageModule)
   },
   // management-b2bopricing
   {
      path: 'managements/b2bopricing-approvals',
      loadChildren: () => import('./modules/managements/pages/b2bopricing-approvals/b2bopricing-approvals.module').then(m => m.B2bopricingApprovalsPageModule)
   },
   // management b2b cod
   {
      path: 'managements/b2b-cod-approvals',
      loadChildren: () => import('./modules/managements/pages/b2b-cod-approvals/b2b-cod-approvals.module').then(m => m.B2bCodApprovalsPageModule)
   },
   {
      path: 'managements/b2b-cod-reviews',
      loadChildren: () => import('./modules/managements/pages/b2b-cod-reviews/b2b-cod-reviews.module').then(m => m.B2bCodReviewsPageModule)
   },
   // managemetn b2b credit
   {
      path: 'managements/b2b-credit-approvals',
      loadChildren: () => import('./modules/managements/pages/b2b-credit-approvals/b2b-credit-approvals.module').then(m => m.B2bCreditApprovalsPageModule)
   },
   // management-defect-request
   {
      path: 'managements/defect-request-reviews',
      loadChildren: () => import('./modules/managements/pages/defect-request-reviews/defect-request-reviews.module').then(m => m.DefectRequestReviewsPageModule)
   },
   {
      path: 'managements/defect-request-approvals',
      loadChildren: () => import('./modules/managements/pages/defect-request-approvals/defect-request-approvals.module').then(m => m.DefectRequestApprovalsPageModule)
   },
   // management-purchase-req
   {
      path: 'managements/purchase-req-reviews',
      loadChildren: () => import('./modules/managements/pages/purchase-req-reviews/purchase-req-reviews.module').then(m => m.PurchaseReqReviewsPageModule)
   },
   {
      path: 'managements/purchase-req-approvals',
      loadChildren: () => import('./modules/managements/pages/purchase-req-approvals/purchase-req-approvals.module').then(m => m.PurchaseReqApprovalsPageModule)
   },
   // management-purchase-order  
   {
      path: 'managements/purchase-order-reviews',
      loadChildren: () => import('./modules/managements/pages/purchase-order-reviews/purchase-order-reviews.module').then(m => m.PurchaseOrderReviewsPageModule)
   },
   {
      path: 'managements/purchase-order-approvals',
      loadChildren: () => import('./modules/managements/pages/purchase-order-approvals/purchase-order-approvals.module').then(m => m.PurchaseOrderApprovalsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-req-reviews',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-req-reviews/non-trade-purchase-req-reviews.module').then(m => m.NonTradePurchaseReqReviewsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-req-approvals',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-req-approvals/non-trade-purchase-req-approvals.module').then(m => m.NonTradePurchaseReqApprovalsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-order-reviews',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-order-reviews/non-trade-purchase-order-reviews.module').then(m => m.NonTradePurchaseOrderReviewsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-order-approvals',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-order-approvals/non-trade-purchase-order-approvals.module').then(m => m.NonTradePurchaseOrderApprovalsPageModule)
   },
   //management-branch-receiving
   {
      path: 'managements/branch-receiving-reviews',
      loadChildren: () => import('./modules/managements/pages/branch-receiving-reviews/branch-receiving-reviews.module').then(m => m.BranchReceivingReviewsPageModule)
   },
   {
      path: 'managements/branch-receiving-approvals',
      loadChildren: () => import('./modules/managements/pages/branch-receiving-approvals/branch-receiving-approvals.module').then(m => m.BranchReceivingApprovalsPageModule)
   },
   // management-transfer-out
   {
      path: 'managements/retail-transfer-out-reviews',
      loadChildren: () => import('./modules/managements/pages/retail-transfer-out-reviews/retail-transfer-out-reviews.module').then(m => m.RetailTransferOutReviewPageModule)
   },
   {
      path: 'managements/retail-transfer-out-approvals',
      loadChildren: () => import('./modules/managements/pages/retail-transfer-out-approvals/retail-transfer-out-approvals.module').then(m => m.RetailTransferOutApprovalsPageModule)
   },
   {
      path: 'managements/co-transfer-out-reviews',
      loadChildren: () => import('./modules/managements/pages/co-transfer-out-reviews/co-transfer-out-reviews.module').then(m => m.CoTransferOutReviewPageModule)
   },
   {
      path: 'managements/co-transfer-out-approvals',
      loadChildren: () => import('./modules/managements/pages/co-transfer-out-approvals/co-transfer-out-approvals.module').then(m => m.CoTransferOutApprovalsPageModule)
   },
   // refund, exchange, recall depo
   {
      path: 'managements/refund-approvals',
      loadChildren: () => import('./modules/managements/pages/refund-approvals/refund-approvals.module').then(m => m.RefundApprovalsPageModule)
   },
   {
      path: 'managements/exchange-approvals',
      loadChildren: () => import('./modules/managements/pages/exchange-approvals/exchange-approvals.module').then(m => m.ExchangeApprovalsPageModule)
   },
   {
      path: 'managements/recall-deposit-approvals',
      loadChildren: () => import('./modules/managements/pages/recall-deposit-approvals/recall-deposit-approvals.module').then(m => m.RecallDepositApprovalsPageModule)
   },
   // management-inventory-processing
   {
      path: 'managements/inventory-processing-reviews',
      loadChildren: () => import('./modules/managements/pages/inventory-processing-reviews/inventory-processing-reviews.module').then(m => m.InventoryProcessingReviewsPageModule)
   },
   {
      path: 'managements/inventory-processing-approvals',
      loadChildren: () => import('./modules/managements/pages/inventory-processing-approvals/inventory-processing-approvals.module').then(m => m.InventoryProcessingApprovalsPageModule)
   },
   // management-inventory-adj-req
   {
      path: 'managements/inventory-adj-req-reviews',
      loadChildren: () => import('./modules/managements/pages/inventory-adj-req-reviews/inventory-adj-req-reviews.module').then(m => m.InventoryAdjReqReviewsPageModule)
   },
   {
      path: 'managements/inventory-adj-req-approvals',
      loadChildren: () => import('./modules/managements/pages/inventory-adj-req-approvals/inventory-adj-req-approvals.module').then(m => m.InventoryAdjReqApprovalsPageModule)
   },
   // management-multi-co-pr/po-approvals
   {
      path: 'managements/multi-co-pr-approvals',
      loadChildren: () => import('./modules/managements/pages/multi-co-pr-approvals/multi-co-pr-approvals.module').then(m => m.MultiCoPrApprovalsPageModule)
   },
   {
      path: 'managements/multi-co-po-approvals',
      loadChildren: () => import('./modules/managements/pages/multi-co-po-approvals/multi-co-po-approvals.module').then(m => m.MultiCoPoApprovalsPageModule)
   },
   {
      path: 'managements/multi-co-pa-approvals',
      loadChildren: () => import('./modules/managements/pages/multi-co-pa-approvals/multi-co-pa-approvals.module').then(m => m.MultiCoPaApprovalsPageModule)
   },
   {
      path: 'managements/multi-co-pa-reviews',
      loadChildren: () => import('./modules/managements/pages/multi-co-pa-reviews/multi-co-pa-reviews.module').then(m => m.MultiCoPaReviewsPageModule)
   },
   {
      path: 'managements/payment-arrangement-reviews',
      loadChildren: () => import('./modules/managements/pages/payment-arrangement-reviews/payment-arrangement-reviews.module').then(m => m.PaymentArrangementReviewsPageModule)
   },
   {
      path: 'managements/payment-arrangement-approvals',
      loadChildren: () => import('./modules/managements/pages/payment-arrangement-approvals/payment-arrangement-approvals.module').then(m => m.PaymentArrangementApprovalsPageModule)
   },
   {
      path: 'managements/b2b-cod-approvals',
      loadChildren: () => import('./modules/managements/pages/b2b-cod-approvals/b2b-cod-approvals.module').then(m => m.B2bCodApprovalsPageModule)
   },
   {
      path: 'managements/b2b-credit-approvals',
      loadChildren: () => import('./modules/managements/pages/b2b-credit-approvals/b2b-credit-approvals.module').then(m => m.B2bCreditApprovalsPageModule)
   },
   {
      path: 'managements/b2b-cod-reviews',
      loadChildren: () => import('./modules/managements/pages/b2b-cod-reviews/b2b-cod-reviews.module').then(m => m.B2bCodReviewsPageModule)
   },
   {
      path: 'managements/so-credit-approvals',
      loadChildren: () => import('./modules/managements/pages/so-credit-approvals/so-credit-approvals.module').then(m => m.SoCreditApprovalsPageModule)
   },
   {
      path: 'managements/so-cod-approvals',
      loadChildren: () => import('./modules/managements/pages/so-cod-approvals/so-cod-approvals.module').then(m => m.SoCodApprovalsPageModule)
   },
   {
      path: 'managements/so-cod-reviews',
      loadChildren: () => import('./modules/managements/pages/so-cod-reviews/so-cod-reviews.module').then(m => m.SoCodReviewsPageModule)
   },
   {
      path: 'managements/defect-request-approvals',
      loadChildren: () => import('./modules/managements/pages/defect-request-approvals/defect-request-approvals.module').then(m => m.DefectRequestApprovalsPageModule)
   },
   {
      path: 'managements/defect-request-reviews',
      loadChildren: () => import('./modules/managements/pages/defect-request-reviews/defect-request-reviews.module').then(m => m.DefectRequestReviewsPageModule)
   },
   {
      path: 'managements/retail-transfer-out-review',
      loadChildren: () => import('./modules/managements/pages/retail-transfer-out-reviews/retail-transfer-out-reviews.module').then(m => m.RetailTransferOutReviewPageModule)
   },
   {
      path: 'managements/co-transfer-out-review',
      loadChildren: () => import('./modules/managements/pages/co-transfer-out-reviews/co-transfer-out-reviews.module').then(m => m.CoTransferOutReviewPageModule)
   },
   {
      path: 'managements/retail-transfer-out-approvals',
      loadChildren: () => import('./modules/managements/pages/retail-transfer-out-approvals/retail-transfer-out-approvals.module').then(m => m.RetailTransferOutApprovalsPageModule)
   },
   {
      path: 'managements/co-transfer-out-approvals',
      loadChildren: () => import('./modules/managements/pages/co-transfer-out-approvals/co-transfer-out-approvals.module').then(m => m.CoTransferOutApprovalsPageModule)
   },
   // management-otp-configuration
   {
      path: 'managements/otp-configuration',
      loadChildren: () => import('./modules/managements/pages/otp-configuration/otp-configuration.module').then(m => m.OtpConfigurationPageModule)
   },
   {
      path: 'managements/otp-config-list',
      loadChildren: () => import('./modules/managements/pages/otp-configuration/otp-config-list/otp-config-list.module').then(m => m.OtpConfigListPageModule)
   },





   // transaction
   {
      title: 'MACA001',
      path: 'transactions',
      loadChildren: () => import('./modules/transactions/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
   },
   // transaction-quotation
   {
      path: 'transactions/quotation',
      loadChildren: () => import('./modules/transactions/pages/quotation/quotation.module').then(m => m.QuotationPageModule)
   },
   {
      path: 'transactions/quotation/quotation-detail',
      loadChildren: () => import('./modules/transactions/pages/quotation/quotation-detail/quotation-detail.module').then(m => m.QuotationDetailPageModule)
   },
   // transaction-sales-order
   {
      path: 'transactions/sales-order',
      loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order.module').then(m => m.SalesOrderPageModule)
   },
   {
      path: 'transactions/sales-order/sales-order-detail',
      loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order-detail/sales-order-detail.module').then(m => m.SalesOrderDetailPageModule)
   },
   // transaction-backtoback-order
   {
      path: 'transactions/backtoback-order',
      loadChildren: () => import('./modules/transactions/pages/backtoback-order/backtoback-order.module').then(m => m.BackToBackOrderPageModule)
   },
   // transaction-purchase-req
   {
      path: 'transactions/purchase-req/purchase-req-detail',
      loadChildren: () => import('./modules/transactions/pages/purchase-req/purchase-req-detail/purchase-req-detail.module').then(m => m.PurchaseReqDetailPageModule)
   },
   // transactions-purchase-order
   {
      path: 'transactions/purchase-order/purchase-order-detail',
      loadChildren: () => import('./modules/transactions/pages/purchase-order/purchase-order-detail/purchase-order-detail.module').then(m => m.PurchaseOrderDetailPageModule)
   },
   // transaction-picking  
   {
      path: 'transactions/picking',
      loadChildren: () => import('./modules/transactions/pages/picking/picking.module').then(m => m.PickingPageModule)
   },
   {
      path: 'transactions/picking/picking-detail',
      loadChildren: () => import('./modules/transactions/pages/picking/picking-detail/picking-detail.module').then(m => m.PickingDetailPageModule)
   },
   // transaction-packing
   {
      path: 'transactions/packing',
      loadChildren: () => import('./modules/transactions/pages/packing/packing.module').then(m => m.PackingPageModule)
   },
   {
      path: 'transactions/packing/packing-detail',
      loadChildren: () => import('./modules/transactions/pages/packing/packing-detail/packing-detail.module').then(m => m.PackingDetailPageModule)
   },
   // transaction-consignment-sales
   {
      path: 'transactions/consignment-sales',
      loadChildren: () => import('./modules/transactions/pages/consignment-sales/consignment-sales.module').then(m => m.ConsignmentSalesPageModule)
   },
   {
      path: 'transactions/consignment-sales/consignment-sales-detail',
      loadChildren: () => import('./modules/transactions/pages/consignment-sales/consignment-sales-detail/consignment-sales-detail.module').then(m => m.ConsignmentSalesDetailPageModule)
   },
   // transaction-stock-count
   {
      path: 'transactions/stock-count',
      loadChildren: () => import('./modules/transactions/pages/stock-count/stock-count.module').then(m => m.StockCountPageModule)
   },
   {
      path: 'transactions/stock-count/stock-count-detail',
      loadChildren: () => import('./modules/transactions/pages/stock-count/stock-count-detail/stock-count-detail.module').then(m => m.StockCountDetailPageModule)
   },
   // transaction-inventory-level-trading
   {
      path: 'transactions/inventory-level-trading',
      loadChildren: () => import('./modules/transactions/pages/inventory-level-trading/inventory-level-trading.module').then(m => m.InventoryLevelTradingPageModule)
   },
   // transaction-inventory-level-retail
   {
      path: 'transactions/inventory-level-retail',
      loadChildren: () => import('./modules/transactions/pages/inventory-level-retail/inventory-level-retail.module').then(m => m.InventoryLevelRetailPageModule)
   },
   // transaction-cash-deposit
   {
      path: 'transactions/cash-deposit',
      loadChildren: () => import('./modules/transactions/pages/cash-deposit/cash-deposit.module').then(m => m.CashDepositPageModule)
   },
   {
      path: 'transactions/truck-loading',
      loadChildren: () => import('./modules/transactions/pages/truck-loading/truck-loading.module').then(m => m.TruckLoadingPageModule)
   },
   {
      path: 'transactions/inter-transfer',
      loadChildren: () => import('./modules/transactions/pages/inter-transfer/inter-transfer.module').then(m => m.InterTransferPageModule)
   },
   {
      path: 'transactions/transfer-confirmation',
      loadChildren: () => import('./modules/transactions/pages/transfer-confirmation/transfer-confirmation.module').then(m => m.TransferConfirmationPageModule)
   },
   {
      path: 'transactions/debtor-application',
      loadChildren: () => import('./modules/transactions/pages/debtor-application/debtor-application.module').then(m => m.DebtorApplicationPageModule)
   },
   {
      path: 'transactions/creditor-application',
      loadChildren: () => import('./modules/transactions/pages/creditor-application/creditor-application.module').then(m => m.CreditorApplicationPageModule)
   },
   {
      path: 'transactions/location-application',
      loadChildren: () => import('./modules/transactions/pages/location-application/location-application.module').then(m => m.LocationApplicationPageModule)
   },
   {
      path: 'transactions/stock-replenish',
      loadChildren: () => import('./modules/transactions/pages/stock-replenish/stock-replenish.module').then(m => m.StockReplenishPageModule)
   },
   {
      path: 'transactions/consignment-count',
      loadChildren: () => import('./modules/transactions/pages/consignment-count/consignment-count.module').then(m => m.ConsignmentCountPageModule)
   },
   {
      path: 'transactions/consignment-count-entry',
      loadChildren: () => import('./modules/transactions/pages/consignment-count-entry/consignment-count-entry.module').then(m => m.ConsignmentCountEntryPageModule)
   },
   {
      path: 'transactions/inbound-scan',
      loadChildren: () => import('./modules/transactions/pages/inbound-scan/inbound-scan.module').then(m => m.InboundScanPageModule)
   },
   {
      path: 'transactions/stock-reorder',
      loadChildren: () => import('./modules/transactions/pages/stock-reorder/stock-reorder.module').then(m => m.StockReorderPageModule)
   },
   {
      path: 'transactions/transfer-out',
      loadChildren: () => import('./modules/transactions/pages/transfer-out/transfer-out.module').then(m => m.TransferOutPageModule)
   },
   {
      path: 'transactions/transfer-in',
      loadChildren: () => import('./modules/transactions/pages/transfer-in/transfer-in.module').then(m => m.TransferInPageModule)
   },
   {
      path: 'transactions/transfer-in-scanning',
      loadChildren: () => import('./modules/transactions/pages/transfer-in-scanning/transfer-in-scanning.module').then(m => m.TransferInScanningPageModule)
   },
   {
      path: 'transactions/non-trade-purchase-order/non-trade-purchase-order-detail',
      loadChildren: () => import('./modules/transactions/pages/non-trade-purchase-order/non-trade-purchase-order-detail/non-trade-purchase-order-detail.module').then(m => m.NonTradePurchaseOrderDetailPageModule)
   },
   {
      path: 'transactions/non-trade-purchase-req/non-trade-purchase-req-detail',
      loadChildren: () => import('./modules/transactions/pages/non-trade-purchase-req/non-trade-purchase-req-detail/non-trade-purchase-req-detail.module').then(m => m.NonTradePurchaseReqDetailPageModule)
   },
   {
      path: 'transactions/pos-bill/pos-bill-detail',
      loadChildren: () => import('./modules/transactions/pages/pos-bill/pos-bill-detail/pos-bill-detail.module').then(m => m.PosBillDetailPageModule)
   },
   {
      path: 'transactions/pos-sales-deposit/pos-sales-deposit-detail',
      loadChildren: () => import('./modules/transactions/pages/pos-sales-deposit/pos-sales-deposit-detail/pos-sales-deposit-detail.module').then(m => m.PosSalesDepositDetailPageModule)
   },
   {
      path: 'transactions/pallet-assembly',
      loadChildren: () => import('./modules/transactions/pages/pallet-assembly/pallet-assembly.module').then(m => m.PalletAssemblyPageModule)
   },
   {
      path: 'transactions/transfer-bin',
      loadChildren: () => import('./modules/transactions/pages/transfer-bin/transfer-bin.module').then(m => m.TransferBinPageModule)
   },
   // transactions-branch-receiving
   {
      path: 'transactions/branch-receiving/branch-receiving-detail',
      loadChildren: () => import('./modules/transactions/pages/branch-receiving/branch-receiving-detail/branch-receiving-detail.module').then(m => m.BranchReceivingDetailPageModule)
   },
   {
      path: 'transactions/bin-count',
      loadChildren: () => import('./modules/transactions/pages/bin-count/bin-count.module').then(m => m.BinCountPageModule)
   },
   // transactions-do-acknowledgement
   {
      path: 'transactions/do-acknowledgement',
      loadChildren: () => import('./modules/transactions/pages/do-acknowledgement/do-acknowledgement.module').then(m => m.DoAcknowledgementPageModule)
   },
   {
      path: 'transactions/carton-truck-loading',
      loadChildren: () => import('./modules/transactions/pages/carton-truck-loading/carton-truck-loading.module').then(m => m.CartonTruckLoadingPageModule)
   },
   // transactions-inventory-count-processing-detail
   {
      path: 'transactions/inventory-count-processing/inventory-count-processing-detail',
      loadChildren: () => import('./modules/transactions/pages/inventory-count-processing/inventory-count-processing-detail/inventory-count-processing-detail.module').then(m => m.InventoryCountProcessingDetailPageModule)
   },
   // transactions-inventory-adj-req-detail
   {
      path: 'transactions/inventory-adj-req/inventory-adj-req-detail',
      loadChildren: () => import('./modules/transactions/pages/inventory-adj-req/inventory-adj-req-detail/inventory-adj-req-detail.module').then(m => m.InventoryAdjReqDetailPageModule)
   },
   {
      path: 'transactions/defect-request',
      loadChildren: () => import('./modules/transactions/pages/defect-request/defect-request.module').then(m => m.DefectRequestPageModule)
   },
   {
      path: 'transactions/payment-arrangement/payment-arrangement-detail',
      loadChildren: () => import('./modules/transactions/pages/payment-arrangement/payment-arrangement-detail/payment-arrangement-detail.module').then(m => m.PaymentArrangementDetailPageModule)
   },
   {
      path: 'transactions/barcode-scanning',
      loadChildren: () => import('./modules/transactions/pages/barcode-scanning/barcode-scanning.module').then(m => m.BarcodeScanningModule)
   },




   // reports
   {
      path: 'reports',
      loadChildren: () => import('./modules/reports/pages/reports/reports.module').then(m => m.ReportsPageModule)
   },
   {
      path: 'reports/debtor-latest-outstanding',
      loadChildren: () => import('./modules/reports/pages/reports/debtor-latest-outstanding/debtor-latest-outstanding.module').then(m => m.DebtorLatestOutstandingPageModule)
   },
   {
      path: 'reports/rp-so-listing',
      loadChildren: () => import('./modules/reports/pages/reports/rp-so-listing/rp-so-listing.module').then(m => m.RpSoListingPageModule)
   },
   {
      path: 'reports/rp-bo-listing',
      loadChildren: () => import('./modules/reports/pages/reports/rp-bo-listing/rp-bo-listing.module').then(m => m.RpBoListingPageModule)
   },
   {
      path: 'reports/rp-sales-customer',
      loadChildren: () => import('./modules/reports/pages/reports/rp-sales-customer/rp-sales-customer.module').then(m => m.RpSalesCustomerPageModule)
   },
   {
      path: 'reports/rp-sales-performance',
      loadChildren: () => import('./modules/reports/pages/reports/rp-sales-performance/rp-sales-performance.module').then(m => m.RpSalesPerformancePageModule)
   },
   {
      path: 'reports/rp-check-qoh',
      loadChildren: () => import('./modules/reports/pages/reports/rp-check-qoh/rp-check-qoh.module').then(m => m.RpCheckQohPageModule)
   },
   {
      path: 'reports/rp-check-qoh-variation',
      loadChildren: () => import('./modules/reports/pages/reports/rp-check-qoh-variation/rp-check-qoh-variation.module').then(m => m.RpCheckQohVariationPageModule)
   },
   {
      path: 'reports/rp-check-cn',
      loadChildren: () => import('./modules/reports/pages/reports/rp-check-cn/rp-check-cn.module').then(m => m.RpCheckCnPageModule)
   },
   {
      path: 'reports/transaction-inquiry',
      loadChildren: () => import('./modules/reports/pages/transaction-inquiry/transaction-inquiry.module').then(m => m.TransactionInquiryPageModule)
   },
   {
      path: 'reports/sales-analysis',
      loadChildren: () => import('./modules/reports/pages/sales-analysis/sales-analysis.module').then(m => m.SalesAnalysisPageModule)
   },
   {
      path: 'reports/item-sales-analysis',
      loadChildren: () => import('./modules/reports/pages/reports/item-sales-analysis/item-sales-analysis.module').then(m => m.ItemSalesAnalysisPageModule)
   },
   {
      path: 'reports/consignment-count-analysis',
      loadChildren: () => import('./modules/reports/pages/reports/consignment-count-analysis/consignment-count-analysis.module').then(m => m.ConsignmentCountAnalysisPageModule)
   },
   {
     path: 'reports/custom-consignment-sales-report',
     loadChildren: () => import('./modules/reports/pages/custom-consignment-sales-report/custom-consignment-sales-report.module').then( m => m.CustomConsignmentSalesReportPageModule)
   },
   {
      path: 'reports/rp-inventory-level',
      loadChildren: () => import('./modules/reports/pages/reports/rp-inventory-level/rp-inventory-level.module').then(m => m.RpInventoryLevelPageModule)
   },


   // shared
   {
      path: 'filter',
      loadChildren: () => import('./modules/transactions/pages/filter/filter.module').then(m => m.FilterPageModule)
   },
   {
      path: 'listing-skeleton',
      loadChildren: () => import('./shared/pages/listing-skeleton/listing-skeleton.module').then(m => m.ListingSkeletonPageModule)
   },
   {
      path: 'item-details',
      loadChildren: () => import('./shared/pages/item-details/item-details.module').then(m => m.ItemDetailsPageModule)
   },
   {
      path: 'search-dropdown',
      loadChildren: () => import('./shared/pages/search-dropdown/search-dropdown.module').then(m => m.SearchDropdownPageModule)
   },
   {
      path: 'search-multi-dropdown',
      loadChildren: () => import('./shared/pages/search-multi-dropdown/search-multi-dropdown.module').then(m => m.SearchMultiDropdownPageModule)
   },
   {
      path: 'item-cart',
      loadChildren: () => import('./shared/pages/item-cart/item-cart.module').then(m => m.ItemCartPageModule)
   },
   {
      path: 'transaction-processing',
      loadChildren: () => import('./shared/pages/transaction-processing/transaction-processing.module').then(m => m.TransactionProcessingPageModule)
   },
   {
      path: 'multico-transaction-processing',
      loadChildren: () => import('./shared/pages/multico-transaction-processing/multico-transaction-processing.module').then(m => m.MultiCoTransactionProcessingPageModule)
   },
   {
      path: 'calendar-input',
      loadChildren: () => import('./shared/pages/calendar-input/calendar-input.module').then(m => m.CalendarInputPageModule)
   },
   {
      path: 'barcode-scan-input',
      loadChildren: () => import('./shared/pages/barcode-scan-input/barcode-scan-input.module').then(m => m.BarcodeScanInputPageModule)
   },
   {
      path: 'item-add-list-flat',
      loadChildren: () => import('./shared/pages/item-add-list-flat/item-add-list-flat.module').then(m => m.ItemAddListFlatPageModule)
   },
   {
      path: 'item-catalog',
      loadChildren: () => import('./shared/pages/item-catalog/item-catalog.module').then(m => m.ItemCatalogPageModule)
   },
   {
      path: 'item-catalog-without-price',
      loadChildren: () => import('./shared/pages/item-catalog-without-price/item-catalog-without-price.module').then(m => m.ItemCatalogWithoutPricePageModule)
   },
   {
      path: 'camera-scan-input',
      loadChildren: () => import('./shared/pages/camera-scan-input/camera-scan-input.module').then(m => m.CameraScanInputPageModule)
   },
   {
      path: 'pos-approval-processing',
      loadChildren: () => import('./shared/pages/pos-approval-processing/pos-approval-processing.module').then(m => m.PosApprovalProcessingPageModule)
   },
   {
      path: 'general-scan-input',
      loadChildren: () => import('./shared/pages/general-scan-input/general-scan-input.module').then(m => m.GeneralScanInputPageModule)
   },
   {
      path: 'do-acknowledgement',
      loadChildren: () => import('./modules/transactions/pages/do-acknowledgement/do-acknowledgement.module').then(m => m.DoAcknowledgementPageModule)
   },
   {
      path: 'item-sales-history',
      loadChildren: () => import('./shared/pages/item-sales-history/item-sales-history.module').then(m => m.ItemSalesHistoryPageModule)
   },
   {
      path: 'sales-cart',
      loadChildren: () => import('./shared/pages/sales-cart/sales-cart.module').then(m => m.SalesCartPageModule)
   },
   {
      path: 'user-relogin',
      loadChildren: () => import('./shared/pages/user-relogin/user-relogin.module').then(m => m.UserReloginPageModule)
   },
   {
      path: 'creditor-application',
      loadChildren: () => import('./modules/transactions/pages/creditor-application/creditor-application.module').then(m => m.CreditorApplicationPageModule)
   },
   {
      path: 'item-code-input',
      loadChildren: () => import('./shared/pages/item-code-input/item-code-input.module').then(m => m.ItemCodeInputPageModule)
   },




];
@NgModule({
   imports: [
      RouterModule.forRoot(
         routes,
         {
            preloadingStrategy: PreloadAllModules
         })
   ],
   exports: [RouterModule]
})
export class AppRoutingModule { }
