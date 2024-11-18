export interface CheckCn {
   transactionType: string
   docId: number
   docNum: string
   postingDate: string
   customerCode: string
   customerName: string
   unappliedAmount: number
}

export interface CheckCnRequest {
   customerIds: number[]
}