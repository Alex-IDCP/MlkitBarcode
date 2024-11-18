export interface ItemList {
   itemId: number
   itemCode: string
   itemSku: string
   description: string
   unitPrice: number
   unitPriceExTax: number
   subTotal: number
   subTotalExTax: number
   discountGroupCode?: string
   discountExpression?: string
   discountAmt?: number
   discountAmtExTax?: number
   taxId: number
   taxPct: number
   taxAmt?: number
   taxInclusive?: boolean
   variationTypeCode: string
   qtyRequest?: number
}