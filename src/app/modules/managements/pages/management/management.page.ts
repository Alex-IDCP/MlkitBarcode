import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { approvalAppCode, moduleCode } from 'src/app/shared/models/acl-const';

@Component({
   selector: 'app-management',
   templateUrl: './management.page.html',
   styleUrls: ['./management.page.scss'],
})
export class ManagementPage implements OnInit {

   showQuotationReview: boolean = false;
   showQuotationApproval: boolean = false;
   showSalesOrderReview: boolean = false;
   showSalesOrderApproval: boolean = false;
   showMxqApproval: boolean = false;
   showBackToBackOrderReview: boolean = false;
   showBackToBackOrderApproval: boolean = false;
   showPurchaseReqReview: boolean = false;
   showPurchaseReqApproval: boolean = false;
   showPurchaseOrderReview: boolean = false;
   showPurchaseOrderApproval: boolean = false;
   showNonTradePurchaseReqReview: boolean = false;
   showNonTradePurchaseReqApproval: boolean = false;
   showNonTradePurchaseOrderReview: boolean = false;
   showNonTradePurchaseOrderApproval: boolean = false;
   showSalesOrderPricingApproval: boolean = false;
   showBackToBackOrderPricingApproval: boolean = false;
   showBranchReceivingApproval: boolean = false;
   showBranchReceivingReview: boolean = false;
   showRefundApproval: boolean = false;
   showExchangeApproval: boolean = false;
   showRecallDepositApproval: boolean = false;
   showInventoryProcessingReview: boolean = false;
   showInventoryProcessingApproval: boolean = false;
   showInventoryAdjReqReview: boolean = false;
   showInventoryAdjReqApproval: boolean = false;
   showPaymentArrangementReview: boolean = false;
   showPaymentArrangementApproval: boolean = false;
   showSoCreditApproval: boolean = false;
   showSoCodApproval: boolean = false;
   showSoCodReview: boolean = false;
   showB2bCreditApproval: boolean = false;
   showB2bCodApproval: boolean = false;
   showB2bCodReview: boolean = false;
   showTransferOutApproval: boolean = false;
   showTransferOutReview: boolean = false;
   showCoTransferOutApproval: boolean = false;
   showCoTransferOutReview: boolean = false;
   showDefectReqApproval: boolean = false;
   showDefectReqReview: boolean = false;

   showMultiCoPrApproval: boolean = false;
   showMultiCoPoApproval: boolean = false;
   showMultiCoPaApproval: boolean = false;
   showMultiCoPaReview: boolean = false;
   showOtpConfig: boolean = false;

   constructor(
      private authService: AuthService
   ) { }

   ngOnInit() {
      try {
         this.authService.menuModel$.subscribe(obj => {
            let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.approval);
            if (pageItems) {
               this.showQuotationReview = pageItems.findIndex(r => r.title === approvalAppCode.quotationRV) > -1;
               this.showQuotationApproval = pageItems.findIndex(r => r.title === approvalAppCode.quotationAP) > -1;
               this.showSalesOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderRV) > -1;
               this.showSalesOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderAP) > -1;
               this.showMxqApproval = pageItems.findIndex(r => r.title === approvalAppCode.maxQtyAP) > -1;
               this.showBackToBackOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderRV) > -1;
               this.showBackToBackOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderAP) > -1;
               this.showPurchaseReqReview = pageItems.findIndex(r => r.title === approvalAppCode.purchaseReqRV) > -1;
               this.showPurchaseReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.purchaseReqAP) > -1;
               this.showPurchaseOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderRV) > -1;
               this.showPurchaseOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderAP) > -1;

               this.showNonTradePurchaseReqReview = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePRRV) > -1;
               this.showNonTradePurchaseReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePRAP) > -1;

               this.showNonTradePurchaseOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePORV) > -1;
               this.showNonTradePurchaseOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePOAP) > -1;
               this.showSalesOrderPricingApproval = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderPricingAP) > -1;
               this.showBackToBackOrderPricingApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderPricingAP) > -1;
               this.showBranchReceivingApproval = pageItems.findIndex(r => r.title === approvalAppCode.branchReceivingAP) > -1;
               this.showBranchReceivingReview = pageItems.findIndex(r => r.title === approvalAppCode.branchReceivingRV) > -1;

               this.showRefundApproval = pageItems.findIndex(r => r.title === approvalAppCode.refundAP) > -1;
               this.showExchangeApproval = pageItems.findIndex(r => r.title === approvalAppCode.exchangeAP) > -1;
               this.showRecallDepositApproval = pageItems.findIndex(r => r.title === approvalAppCode.recallDepositAP) > -1;

               this.showInventoryProcessingReview = pageItems.findIndex(r => r.title === approvalAppCode.inventoryProcessingRV) > -1;
               this.showInventoryProcessingApproval = pageItems.findIndex(r => r.title === approvalAppCode.inventoryProcessingAP) > -1;

               this.showInventoryAdjReqReview = pageItems.findIndex(r => r.title === approvalAppCode.inventoryAdjReqRV) > -1;
               this.showInventoryAdjReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.inventoryAdjReqAP) > -1;

               this.showPaymentArrangementReview = pageItems.findIndex(r => r.title === approvalAppCode.paymentArrangementRV) > -1;
               this.showPaymentArrangementApproval = pageItems.findIndex(r => r.title === approvalAppCode.paymentArrangementAP) > -1;

               this.showSoCreditApproval = pageItems.findIndex(r => r.title === approvalAppCode.soCreditAP) > -1;
               this.showSoCodApproval = pageItems.findIndex(r => r.title === approvalAppCode.soCODAP) > -1;
               this.showSoCodReview = pageItems.findIndex(r => r.title === approvalAppCode.soCODRV) > -1;

               this.showB2bCreditApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bCreditAP) > -1;
               this.showB2bCodApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bCODAP) > -1;
               this.showB2bCodReview = pageItems.findIndex(r => r.title === approvalAppCode.b2bCODRV) > -1;

               this.showTransferOutApproval = pageItems.findIndex(r => r.title === approvalAppCode.retailTOAP) > -1;
               this.showTransferOutReview = pageItems.findIndex(r => r.title === approvalAppCode.retailTORV) > -1;

               this.showCoTransferOutApproval = pageItems.findIndex(r => r.title === approvalAppCode.consignTOAP) > -1;
               this.showCoTransferOutReview = pageItems.findIndex(r => r.title === approvalAppCode.consignTORV) > -1;

               this.showDefectReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.defectReqAP) > -1;
               this.showDefectReqReview = pageItems.findIndex(r => r.title === approvalAppCode.defectReqRV) > -1;
               
               this.showMultiCoPrApproval = pageItems.findIndex(r => r.title === approvalAppCode.multiCoPrAP) > -1;
               this.showMultiCoPoApproval = pageItems.findIndex(r => r.title === approvalAppCode.multiCoPoAP) > -1;

               this.showMultiCoPaApproval = pageItems.findIndex(r => r.title === approvalAppCode.multiCoPaAP) > -1;
               this.showMultiCoPaReview = pageItems.findIndex(r => r.title === approvalAppCode.multiCoPaRV) > -1;

               this.showOtpConfig = pageItems.findIndex(r => r.title === approvalAppCode.otpConfig) > -1;
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

}
