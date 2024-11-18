import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface NonTradePurchaseReqRoot {
   header: NonTradePurchaseReqHeader
   details: TransactionDetail[]
   approvalHistory?: ApprovalHistory[]
 }
 
 export interface NonTradePurchaseReqHeader {
   nonTradePurchaseReqId: number
   nonTradePurchaseReqNum: string
   procurementAgentId: number
   trxDate: string
   trxDateTime: string
   typeCode: string
   vendorId: number
   attention: any
   locationId: number
   termPeriodId: any
   forwarderId: any
   workFlowTransactionId: number
   etaDate: any
   cancelDate: any
   countryId: number
   currencyId: number
   currencyRate: number
   nonTradePurchaseReqUDField1: any
   nonTradePurchaseReqUDField2: any
   nonTradePurchaseReqUDField3: any
   nonTradePurchaseReqUDOption1: any
   nonTradePurchaseReqUDOption2: any
   nonTradePurchaseReqUDOption3: any
   totalGrossAmt: number
   totalDiscAmt: number
   totalTaxAmt: number
   grandTotal: number
   grandTotalExTax: number
   localTotalGrossAmt: number
   localTotalDiscAmt: number
   localTotalTaxAmt: number
   localGrandTotal: number
   localGrandTotalExTax: number
   printCount: number
   childType: any
   childId: any
   externalDocNum: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   remark: any
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   isHomeCurrency: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }