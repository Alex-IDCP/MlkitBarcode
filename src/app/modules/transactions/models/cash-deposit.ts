import { SafeUrl } from "@angular/platform-browser"

export interface CashDepositRoot {
   header: CashDepositHeader
   attachmentFile: any[]
   comment: any[]
   depositFile: CashDepositFile[]
}

export interface CashDepositHeader {
   posCashDepositId: number
   posCashDepositNum: string
   depositAmount: number
   depositDateTime: Date
   depositFileId: number
   depositSlipNum: number
   paymentMethodId: number
   locationId: number
   customerId: number
   trxDate: Date
   sequence: number
   createdById: number
   createdBy: string
   createdAt: Date
   modifiedById: number
   modifiedBy: string
   modifiedAt: Date
   deactivated: boolean
   revision: number
   uuid: string
}

export interface CashDepositFile {
   filesId: number
   filesName: string
   filesType: string
   filesSize: number
   createdBy: string
   createdAt: Date
}

export interface CashDepositFileSimpleList {
   filesId: number
   filesName?: string
   imageUrl: SafeUrl
}