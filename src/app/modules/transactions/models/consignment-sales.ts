import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentSalesList {
  consignmentSalesId: number
  consignmentSalesNum: string
  trxDate: Date
  customerCode: string
  customerName: string
  locationId: number
  locationDesc: string
  toLocationId: number
  toLocationCode: string
  toLocationDesc: string
  grandTotal: number
  qtyRequest: number
  deactivated: boolean
  isEntryCompleted: boolean
}

export interface ConsignmentSalesRoot {
  header: ConsignmentSalesHeader
  details: TransactionDetail[]
}

export interface ConsignmentSalesHeader {
  consignmentSalesId: number
  consignmentSalesNum: string
  trxDate: Date
  trxDateTime: Date
  typeCode: string
  salesAgentId: number
  customerId: number
  locationId?: number
  toLocationId: number
  countryId?: number
  currencyId: number
  currencyRate: number
  sourceType: string
  businessModelType: string
  consignmentSalesUDField1?: string
  consignmentSalesUDField2?: string
  consignmentSalesUDField3?: string
  consignmentSalesUDOption1?: number
  consignmentSalesUDOption2?: number
  consignmentSalesUDOption3?: number
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  posMemberId?: number
  posMemberName?: string
  remark?: string
  printCount: number
  isItemPriceTaxInclusive: boolean
  isDisplayTaxInclusive: boolean
  isHomeCurrency: boolean
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
  isBearPromo: boolean
  marginMode: string
  grossPromoMarginCategoryCode: string
  consignmentSettlementId?: number
  consignmentSettlementNum?: string
  isEntryCompleted?: boolean
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById?: number
  modifiedBy?: string
  modifiedAt?: string
  deactivated: boolean

  // local usage
  maxPrecision?: number
  maxPrecisionTax?: number
}

export interface ConsignmentSalesLocation {
  locationId: number
  locationCode: string
  locationDescription: string
  customerId: number
  isPrimary: boolean
}