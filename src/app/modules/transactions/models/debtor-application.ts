export interface DebtorApplicationList {
   customerPreId: number
   name: string
   salesAgent: any
   salesAgentCide: any
   salesAgentName: string
   creditLimit: any
   termPeriodCode: any
   termPeriodDesc: any
   deactivated: boolean
   createdAt: string
   companyRegNum: any
   countryId: any
   countryCode: string
   countryName: string
   priceSegmentCode: any
   pendingStatus: string
   workFlowTransactionId: number
}

export interface DebtorApplicationRoot {
   header: DebtorApplicationHeader
   approvalHistory: any[]
   attachmentFile: any[]
   comment: any[]
}

export interface DebtorApplicationHeader {
   customerPreId: number
   customerPreCode: string
   name: string
   companyRegNum: any
   taxNum: any
   currencyId: number
   countryId: number
   controlAccountId: number
   salesAgentId: number
   termPeriodId: number
   creditLimit: number
   overDueLimit: any
   allowExceedCreditLimit: boolean
   addPDLimit: boolean
   agingOn: any
   statementType: any
   billEmail: any
   billPhone: any
   billFax: any
   billAddress: any
   billPostCode: any
   billContact: any
   shipAddress: any
   shipPostCode: any
   shipContact: any
   customerUDField1: any
   customerUDField2: any
   customerUDField3: any
   customerUDOption1: any
   customerUDOption2: any
   customerUDOption3: any
   isPrimary: boolean
   priceSegmentCode: string
   paymentMethodId: number
   bankAcct: any
   logoFileId: any
   billAreaId: number
   shipAreaId: number
   businessModelType: string
   locationId: number
   supplyTaxId: any
   shipEmail: any
   shipPhone: any
   shipFax: any
   billDescription: any
   shipDescription: any
   shipAttention: any
   billAttention: any
   shipStateId: any
   billStateId: any
   stateId: any
   isItemPriceTaxInclusive: any
   isDisplayTaxInclusive: any
   isCheckCreditLimit: boolean
   isCheckCreditTerm: boolean
   masterUDGroup1: any
   isLocal: boolean
   isMonthEndDueDate: boolean
   gracePeriodInDay: any
   salesControlAccountId: any
   isPosVisible: boolean
   remark: any
   isCompletelyFilled: boolean
   customerId: any
   workFlowTransactionId: number
   sourceType: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}
