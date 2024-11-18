import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"
import { VariationDetail } from "src/app/shared/models/variation-detail"

export interface PurchaseReqRoot {
   header: PurchaseReqHeader
   details: TransactionDetail[]
   // barcodeTag: BarcodeTag[]
   // otp: any
  approvalHistory?: ApprovalHistory[]
 }
 
 export interface PurchaseReqHeader {
   purchaseReqId: number
   purchaseReqNum: string
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
   etaDate: any
   cancelDate: any
   countryId: number
   currencyId: number
   currencyRate: number
   purchaseReqUDField1: any
   purchaseReqUDField2: any
   purchaseReqUDField3: any
   purchaseReqUDOption1: any
   purchaseReqUDOption2: any
   purchaseReqUDOption3: any
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
   /* #region  special to pass in precision */
   maxPrecision: number
   maxPrecisionTax: number
   /* #endregion */
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }

 export interface PurchaseReqDto {
  header: PurchaseReq
  details: PurchaseReqLine[]
}

export interface PurchaseReq {
  purchaseReqId?: number
  purchaseReqNum?: string
  procurementAgentId?: number
  trxDate?: string
  trxDateTime?: string
  typeCode?: string
  vendorId?: number
  attention?: any
  locationId?: number
  termPeriodId?: number
  forwarderId?: any
  workFlowTransactionId?: number
  etaDate?: any
  cancelDate?: any
  countryId?: number
  currencyId?: number
  currencyRate?: number
  purchaseReqUDField1?: any
  purchaseReqUDField2?: any
  purchaseReqUDField3?: any
  purchaseReqUDOption1?: any
  purchaseReqUDOption2?: any
  purchaseReqUDOption3?: any
  totalGrossAmt?: number
  totalDiscAmt?: number
  totalTaxAmt?: number
  grandTotal?: number
  grandTotalExTax?: number
  localTotalGrossAmt?: number
  localTotalDiscAmt?: number
  localTotalTaxAmt?: number
  localGrandTotal?: number
  localGrandTotalExTax?: number
  printCount?: number
  externalDocNum?: any
  masterUDGroup1?: any
  masterUDGroup2?: any
  masterUDGroup3?: any
  remark?: any
  isItemPriceTaxInclusive?: boolean
  isDisplayTaxInclusive?: boolean
  sequence?: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: any
  modifiedBy?: any
  modifiedAt?: any
  deactivated?: boolean
}

export interface PurchaseReqLine {
  purchaseReqLineId?: number
  purchaseReqId?: number
  itemId?: number
  itemVariationXId?: number
  itemVariationYId?: number
  itemCode: string
  itemSku: string
  itemUomId?: number
  description: string
  extendedDescription: string
  qtyRequest?: number
  unitPrice?: number
  subTotal?: number
  sequence?: number
  locationId?: number
  deactivated?: boolean
}