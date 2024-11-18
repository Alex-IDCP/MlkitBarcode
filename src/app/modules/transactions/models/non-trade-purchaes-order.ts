import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface NonTradePurchaseOrderRoot {
   header: NonTradePurchaseOrderHeader
   details: TransactionDetail[]
   approvalHistory?: ApprovalHistory[]
 }
 
 export interface NonTradePurchaseOrderHeader {
   nonTradePurchaseOrderId: number
   nonTradePurchaseOrderNum: string
   procurementAgentId: number
   trxDate: string
   trxDateTime: string
   typeCode: string
   vendorId: number
   attention: any
   locationId: number
   termPeriodId: number
   forwarderId: any
   workFlowTransactionId: number
   etaDate: string
   cancelDate: string
   countryId: number
   currencyId: number
   currencyRate: number
   nonTradePurchaseOrderUDField1: any
   nonTradePurchaseOrderUDField2: any
   nonTradePurchaseOrderUDField3: any
   nonTradePurchaseOrderUDOption1: any
   nonTradePurchaseOrderUDOption2: any
   nonTradePurchaseOrderUDOption3: any
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
   externalDocNum: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   remark: any
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   isHomeCurrency: boolean
   salesOrderId: any
   salesOrderNum: any
   backToBackOrderId: any
   backToBackOrderNum: any
   isClosed: boolean
   isOpeningBalance: boolean
   closeRemark: any
   parentObject: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }