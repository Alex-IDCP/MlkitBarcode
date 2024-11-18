import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"
import { VariationDetail } from "src/app/shared/models/variation-detail"

export interface PurchaseOrderRoot {
   header: PurchaseOrderHeader
   details: TransactionDetail[]
   approvalHistory?: ApprovalHistory[]
 }
 
 export interface PurchaseOrderHeader {
   purchaseOrderId: number
   purchaseOrderNum: string
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
   purchaseOrderUDField1: any
   purchaseOrderUDField2: any
   purchaseOrderUDField3: any
   purchaseOrderUDOption1: any
   purchaseOrderUDOption2: any
   purchaseOrderUDOption3: any
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

 export interface PurchaseOrderDto {
  header: PurchaseOrder
  details: PurchaseOrderLine[]
}

export interface PurchaseOrder {
  purchaseOrderId?: number
  purchaseOrderNum?: string
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
  purchaseOrderUDField1?: any
  purchaseOrderUDField2?: any
  purchaseOrderUDField3?: any
  purchaseOrderUDOption1?: any
  purchaseOrderUDOption2?: any
  purchaseOrderUDOption3?: any
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

export interface PurchaseOrderLine {
  purchaseOrderLineId?: number
  purchaseOrderId?: number
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