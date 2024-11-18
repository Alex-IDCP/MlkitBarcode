import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface SalesOrderList {
   salesOrderId: number
   salesOrderNum: string
   trxDate: string
   customerCode: string
   customerName: string
   salesAgentName: string
   countryDescription: string
   currencyCode: string
   grandTotal: number
   qty: number
   otherAmountCount: number
   deactivated: boolean
   createdById: number
   isClosed: boolean

   isDraft: boolean
   draftTransactionId: number
}

export interface SalesOrderRoot {
   header: SalesOrderHeader
   details: TransactionDetail[]
   barcodeTag?: any
   otp?: any
   approvalHistory?: ApprovalHistory[]
   isWorkFlowDone?: boolean
   otherAmount?: OtherAmount[]
   orderCyle?: OrderLifeCycle[]
}

export interface SalesOrderHeader {
   salesOrderId: number
   salesOrderNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   sourceType: string
   status: string
   customerId: number
   businessModelType: string
   salesAgentId?: number
   shipAddress?: string
   shipPostCode?: string
   shipPhone?: string
   shipFax?: string
   shipEmail?: string
   shipStateId?: number
   shipAreaId?: number
   shipMethodId?: number
   attention?: string
   locationId: number
   toLocationId: number
   termPeriodId: number
   workFlowTransactionId: number
   countryId: number
   currencyId: number
   currencyRate: number
   salesOrderUDField1?: string
   salesOrderUDField2?: string
   salesOrderUDField3?: string
   salesOrderUDOption1?: number
   salesOrderUDOption2?: number
   salesOrderUDOption3?: number
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
   externalDocNum?: string
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   remark?: string
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   isHomeCurrency: boolean
   isClosed: boolean
   isOpeningBalance: boolean
   isPricingApproval: boolean
   isTrackerComplete: boolean
   trackerCompleteDate?: Date
   closeRemark?: string
   isPriority: boolean
   isPriorityDate?: Date
   deliveryDate?: Date
   orderLifeCycle: string
   customerPo?: string
   totalCarton?: number
   isAutoPromotion: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: Date
   deactivated: boolean
   shipName?: string
   uuId: string

   // local use
   priceSegmentCode: string
}

export interface OtherAmount {
   lineId: number
   headerId: number
   amountCode: string
   amountDescription: string
   amountExpression: string
   currentSubtotal: number
   totalAmount: number
   cumulativeAmount: number
   sequence: number
   remark: string
}

export interface OrderLifeCycle {
   orderLifeCycle: string
   description: string
   createdById: string
   createdBy: string
   createdAt: string
}
