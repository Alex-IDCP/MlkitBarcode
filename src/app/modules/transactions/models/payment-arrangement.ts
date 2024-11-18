export interface PaymentArrangementRoot {
   header: PaymentArrangementHeader
   details: PaymentArrangementDetail[]
 }
 
 export interface PaymentArrangementHeader {
   paymentArrangementId: number
   paymentArrangementNum: string
   trxDate: string
   scheduleDate: string
   postingDate: string
   paymentMethodId: number
   remark: string
   workFlowTransactionId: number
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
   revision: number
 }
 
 export interface PaymentArrangementDetail {
   originalAmt: number
   localOriginalAmt: number
   overdueDate: string
   currencyId: number
   paymentDescription: any
   routerLink: string
   transactionTypeDesc: string
   vendorId: number
   customerId: any
   currencyRate: number
   typeCode: string
   anonymousName: any
   reference: any
   isHomeCurrency: boolean
   locationId?: number
   updatedBalanceAmt: number
   paymentArrangementLineId: number
   paymentArrangementId: number
   trxDate: string
   documentId: number
   referenceNo: string
   description: string
   balanceAmt: number
   localBalanceAmt: number
   paymentAmt: number
   transactionType: string
   remark: any
   childDocId: any
   childDocNum: any
   isSelected: boolean
   paymentVoucherId: number
   paymentVoucherNum: string
   sequence: any
   createdById: any
   createdBy: any
   createdAt: any
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
   revision: any
 }
 