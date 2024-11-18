import { ApprovalHistory } from "src/app/shared/models/approval-history"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface BranchReceivingRoot {
   header: BranchReceivingHeader
   details: TransactionDetail[]
   approvalHistory: ApprovalHistory[]
 }
 
 export interface BranchReceivingHeader {
   branchReceivingId: number
   branchReceivingNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   vendorId: number
   vendorType: string
   attention: any
   locationId: number
   termPeriodId: any
   forwarderId: any
   workFlowTransactionId: number
   etaDate: any
   cancelDate: any
   countryId: number
   currencyId: number
   currencyRate: number
   branchReceivingUDField1: any
   branchReceivingUDField2: any
   branchReceivingUDField3: any
   branchReceivingUDOption1: any
   branchReceivingUDOption2: any
   branchReceivingUDOption3: any
   printCount: number
   childType: any
   childId: any
   externalDocNum: any
   parentObject: string
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   remark: any
   isHomeCurrency: boolean
   grandTotal: any
   localGrandTotal: any
   isCompleted: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
 }