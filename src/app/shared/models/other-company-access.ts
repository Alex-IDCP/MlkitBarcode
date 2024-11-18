import { TransactionProcessingDoc } from "./transaction-processing"

export interface OtherCompanyAccess {
   otherCompaniesLoginId: number
   otherCompaniesId: number
   otherCompaniesUrl: string
   userId: number
   userEmail: string
   password: string
   isConnectionSuccess: boolean
}

export interface OtherCompanyTrx extends OtherCompanyAccess {
   token: string
   isGetCountSuccess: boolean
   trxList: TransactionProcessingDoc[]
}
