export interface DebtorOutstanding {   
  customerId: number
  customerName: string
  salesAgentId: number
  salesAgentCode: string
  salesAgentName: string
  currencyCode: string
  currencyDesc: string
  balance: number
}

export interface DebtorOutstandingRequest {
  customerId: number[]
  trxDate: string
  isOverdueOnly: boolean
  trxDateFrom?: string
}