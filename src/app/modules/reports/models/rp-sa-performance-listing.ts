export interface SAPerformanceListing {
  salesAgentCode: string
  salesAgentName: string
  transactionType: string
  netAmount: number
}

export interface SalesAgentAllPerformanceObject {
  salesAgentCode: string
  salesAgentName: string
  invoiceAmt: number
  cnAmount: number
  soAmount: number
  netAmount: number
}