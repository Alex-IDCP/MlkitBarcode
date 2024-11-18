export interface CustomConsignmentSalesReportObject {
   locationCode: string
   locationDesc: string
   itemCode: string
   itemDesc: string
   itemBrandCode: string
   itemBrandDesc: string
   itemCategoryCode: string
   itemCategoryDesc: string
   itemGroupCode: string
   itemGroupDesc: string
   subTotal: number
   qtyRequest: number
}

export interface CustomConsignmentSalesReportRequestObject {
   dateStart: Date
   dateEnd: Date
   locationId: number[]
   itemId?: number[]
   itemBrandId?: number[]
   itemCategoryId?: number[]
   itemGroupId?: number[]
}
