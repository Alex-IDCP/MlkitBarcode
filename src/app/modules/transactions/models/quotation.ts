import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"
import { OtherAmount } from "./sales-order"

export interface QuotationList {
   quotationId: number
   quotationNum: string
   trxDate: string
   customerName: string
   salesAgentName: string
   countryDescription: string
   currencyCode: string
   grandTotal: number
   qty: number
   deactivated: boolean
   createdById: number
   otherAmountCount?: number
}

export interface QuotationRoot {
   header: QuotationHeader
   details: TransactionDetail[]
   barcodeTag?: any
   otp?: any
   approvalHistory?: ApprovalHistory[]
   otherAmount?: OtherAmount[]
}

export interface QuotationHeader {
   quotationId: number
   quotationNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   sourceType: string
   customerId: number
   businessModelType: string
   salesAgentId: number
   shipAddress: string
   shipPostCode: string
   shipPhone: string
   shipEmail: string
   shipFax: string
   shipStateId: number
   shipAreaId: number
   shipMethodId: number
   attention: string
   locationId: number
   toLocationId?: number
   termPeriodId: number
   workFlowTransactionId?: number
   countryId: number
   currencyId: number
   currencyRate: number
   quotationUDField1?: string
   quotationUDField2?: string
   quotationUDField3?: string
   quotationUDOption1?: number
   quotationUDOption2?: number
   quotationUDOption3?: number
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
   childType?: string
   childId?: number
   externalDocNum?: string
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   remark?: string
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   isHomeCurrency: boolean
   isPricingApproval: boolean
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
