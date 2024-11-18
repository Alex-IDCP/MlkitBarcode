export interface ItemSalesAnalysis {
   trxDate: Date
   docType: string
   docId: number
   docNum: string
   customerCode: string
   customerName: string
   itemCode: string
   itemDesc: string
   qtyRequest?: number
   unitPrice?: number
   discountAmt?: number
   subTotal?: number
}

export interface ItemSalesAnalysisRequestObject {
   dateStart: Date
   dateEnd: Date
   itemId: number[]
   customerId: number[]
   groupByType: string
}