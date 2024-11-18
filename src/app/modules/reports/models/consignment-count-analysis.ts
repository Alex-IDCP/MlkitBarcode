export interface ConsignmentCountAnalysisObject {
   locationCode: string
   locationDesc: string
   itemCode: string
   itemDesc: string
   xCode: string
   xDesc: string
   yCode: string
   yDesc: string
}

export interface ConsignmentCountAnalysisRequestObject {
   dateStart: string
   dateEnd: string
   locationId: number[]
}