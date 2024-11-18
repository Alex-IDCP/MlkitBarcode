import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface InventoryAdjustmentReqRoot {
   header: InventoryAdjustmentReqHeader
   details: TransactionDetail[]
   barcodeTag: any
   otp: any
   attachmentFile: any[]
   comment: any[]
}

export interface InventoryAdjustmentReqHeader {
   inventoryAdjustmentReqId: number
   inventoryAdjustmentReqNum: string
   trxDate: string
   trxDateTime: string
   locationId: number
   typeCode: string
   description: any
   inventoryAdjustmentReqUDField1: any
   inventoryAdjustmentReqUDField2: any
   inventoryAdjustmentReqUDField3: any
   inventoryAdjustmentReqUDOption1: any
   inventoryAdjustmentReqUDOption2: any
   inventoryAdjustmentReqUDOption3: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   printCount: number
   workFlowTransactionId: number
   childType: any
   childId: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}