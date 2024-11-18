export interface TransactionProcessingDoc {
   docId: number
   docNum: string
   docType: string
   trxDate: Date
   agentName: string
   counterPartId: number
   counterPart: string
   counterPartCode: string
   country: string
   currency: string
   amount: number
   quantity: number
   createdBy: string
   createdAt: Date
   isComplete: boolean
   locationCode?: string
   locationDesc?: string
   // isWorkFlowComplete: boolean
   isPrinted: boolean
   routerLink: string
   appCode: string
   reportNum: string
   reportName: string
   deactivated: boolean
   typeDetail: string
   amountString?: string
}

export interface TransactionProcessingCount {
   pending: number
   completed: number
   total: number
   isAllowApprove: boolean
}

export interface BulkConfirmReverse {
   status: string
   reason?: string
   docId: number[]
}