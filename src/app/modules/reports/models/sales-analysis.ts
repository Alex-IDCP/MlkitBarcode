export interface SalesAnalysisObject {
   trxDate?: Date
   itemCode?: string
   itemVariationXCode?: string
   itemVariationYCode?: string
   discountGroupCode?: string
   qtyRequest?: number
   subTotal?: number
   normal?: number
   bestBuy?: number
   promotion?: number
   total?: number
}

export interface SalesAnalysisRequestObject {
   locationId?: number
   dateStart?: Date
   dateEnd?: Date
   reportType?: number
   itemid?: number[]
}

