import { CreditInfo } from "src/app/shared/models/credit-info"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"
import { OrderLifeCycle, OtherAmount } from "./sales-order"

export interface BackToBackOrderList {
   backToBackOrderId: number
   trxDate: string
   backToBackOrderNum: string
   customerName: string
   salesAgentName: string
   countryDescription: string
   currencyCode: string
   posLocationCode: string
   deactivated: boolean
   isCompleted: boolean
   grandTotal: number
   otherAmountCount: number
}

export interface BackToBackOrderRoot {
   header: BackToBackOrderHeader
   details: TransactionDetail[]
   creditInfo?: CreditInfo
   depositInfo?: any[]
   barcodeTag?: any
   otp?: any
   attachmentFile?: any[]
   comment?: any[]
   otherAmount?: OtherAmount[]
   orderCyle?: OrderLifeCycle[]
}

export interface BackToBackOrderHeader {
   backToBackOrderId: number
   backToBackOrderNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   sourceType: string
   status: string
   customerId: number
   businessModelType: string
   salesAgentId: number
   shipAddress: string
   shipPostCode: string
   shipPhone: string
   shipFax: string
   shipEmail: string
   shipStateId: any
   shipAreaId: number
   shipMethodId: number
   attention: string
   locationId: number
   toLocationId: number
   termPeriodId: number
   workFlowTransactionId: any
   countryId: number
   currencyId: number
   currencyRate: number
   backToBackOrderUDField1: any
   backToBackOrderUDField2: any
   backToBackOrderUDField3: any
   backToBackOrderUDOption1: any
   backToBackOrderUDOption2: any
   backToBackOrderUDOption3: any
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
   isCompleted: boolean
   isPricingApproval: boolean
   posLocationId: any
   posLocationCode: any
   isAutoPromotion: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
   shipName?: string
   priceSegmentCode: string
   orderLifeCycle: string
}