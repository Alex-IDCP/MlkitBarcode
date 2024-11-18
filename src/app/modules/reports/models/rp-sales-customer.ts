export interface SalesByCustomer {
   customerCode: string
   customerName: string
   trxMonth: string
   salesAmount: number
}

export interface SalesByCustomerRequest {
   customerId: number[]
   dateStart: string
   dateEnd: string
}