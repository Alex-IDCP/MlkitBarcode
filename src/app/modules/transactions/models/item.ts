export interface Item {
   itemId: number
   itemUomId: number
   itemCode: string
   description: string
   variationTypeCode: string
   deactivated: boolean
   itemVariationLineXId: number
   itemVariationLineYId: number
   itemSku: string
   itemVariationLineXCode: string
   itemVariationLineYCode: string
   itemVariationLineXDescription: string
   itemVariationLineYDescription: string
   unitPrice: number
   unitPriceExTax: number
   subTotal?: number
   subTotalExTax?: number
   discountGroupCode?: string
   discountExpression?: string
   discountAmt?: number
   discountAmtExTax?: number
   taxId: number
   taxCode: string
   taxPct: number
   taxAmt?: number
   taxInclusive?: boolean
   currencyId: number
   availableQty: number
   qtyRequest?: number
}

export interface ItemImage {
   keyId: number
   imageSource: string
   imageName: string
}