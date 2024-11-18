import { ItemMultiUomBase } from "./transaction-detail"

export interface CopyFromSIHeader {
   salesInvoiceId: number
   salesInvoiceNum: string
   trxDate: string
   typeCode: string
   workFlowTransactionId: number
   businessModelType: string
   salesType: string
   locationId: number
   location: string
   customerId: number
   customer: string
   isHomeCurrency: boolean
   countryId: number
   country: string
   currencyId: number
   currency: string
   qtyRequest: number
   qtyCommit: number
   qtyBalance: number
   shipAddress: any
   shipPostCode: any
   shipAreaId: number
   shipPhone: any
   shipEmail: string
   shipFax: any
   shipMethodId: number
   attention: any
   remark: any
   termPeriodId: number

   // for local
   isSelected: boolean
}

export interface CopyFromSILine {
   salesInvoiceId: number
   salesInvoiceNum: string
   trxDate: string
   customerId: number
   countryId: number
   currencyId: number
   isHomeCurrency: boolean
   shipMethodId: number
   typeCode: string
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   locationId: number
   toLocationId: any
   deactivated: boolean
   salesInvoiceLineId: number
   itemId: number
   description: string
   extendedDescription: any
   variationTypeCode: string
   unitPriceExTax: number
   discountAmtExTax: number
   itemCode: string
   itemUomId: number
   itemUomDescription: string
   sequence: number
   itemBrandId: number
   itemGroupId: number
   itemCategoryId: number
   itemDepartmentId: number
   unitPrice: number
   discountAmt: number
   discountExpression: string
   discountGroupCode: string
   subTotal: number
   taxamt: number
   taxId: any
   taxCode: any
   taxPct: any
   taxInclusive: boolean
   qtyRequest: number
   qtyCommit: number
   qtyBalance: number
   tradingMarginPct: any
   tradingMarginAmt: any
   tradingMarginAmtExTax: any
   tradingMarginExpression: any
   baseRatio: any
   uomRatio: any
   ratioExpr: any
   uomMaster: ItemMultiUomBase[]
   variationDetails: any
   assembly: any[]
   variationX: any
   variationY: any
   otherAmount: any[]
}
