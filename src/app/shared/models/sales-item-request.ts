export interface SalesItemRequest {
   itemId?: number[]
   search: string
   trxDate: Date
   keyId: number
   customerId: number
   locationId: number
   startIndex: number
   size: number
}