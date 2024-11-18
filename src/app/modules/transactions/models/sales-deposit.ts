export interface SalesDepositRoot {
   header: SalesDepositHeader
   details: SalesDepositDetail[]
 }
 
 export interface SalesDepositHeader {
   salesDepositId: number
   salesDepositNum: string
   runningNum: number
   trxDate: string
   trxDateTime: string
   locationId: number
   locationCode: string
   stationNum: number
   customerId: any
   customerName: string
   customerContact: string
   totalAmt: number
   changeAmt: number
   remark: string
   referenceId: any
   referenceNum: any
   isUtilized: boolean
   utilizedAt: any
   utilizedBy: any
   isDeleted: boolean
   deletedAt: any
   deletedBy: any
   deleteReason: any
   userId: number
   userName: string
   depositType: string
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 
 export interface SalesDepositDetail {
   salesDepositLineId: number
   salesDepositId: number
   paymentTypeId: number
   paymentTypeDesc: string
   paymentTypeCategory: string
   totalAmt: number
   offsetAmt: number
   cardMerchantId: any
   cardMerchantCode: any
   refNo01: any
   refNo02: any
   refNo03: any
   refNo04: any
   refNo05: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 