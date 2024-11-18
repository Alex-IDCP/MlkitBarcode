export interface TransactionInquiryRequestObject {
   type: string
   dateStart: Date
   dateEnd: Date
   customerId: number[]
   wildDocNum: string
}

export interface TransactionInquiryObject {
   type: string
   docId: number
   docNum: string
   docDate: Date
   customerCode: string
   customerName: string
}