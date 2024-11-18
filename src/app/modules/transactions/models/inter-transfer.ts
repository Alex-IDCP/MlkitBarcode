import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface InterTransferList {
   interTransferId: number
   interTransferNum: string
   trxDate: Date
   locationCode: string
   locationDescription: string
   toLocationCode: string
   toLocationDescription: string
   deactivated: boolean
}


export interface InterTransferRoot {
   header: InterTransferHeader
   details: TransactionDetail[]
   cBMMapping: CBMMapping[]
}

export interface InterTransferHeader {
   interTransferId: number
   interTransferNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   shipAddress: string
   shipPostCode: string
   shipPhone: string
   shipFax: string
   shipEmail: string
   shipStateId: number
   shipAreaId: number
   shipMethodId: number
   attention: string
   locationId: number
   toLocationId: number
   workFlowTransactionId: number
   interTransferUDField1: string
   interTransferUDField2: string
   interTransferUDField3: string
   interTransferUDOption1: number
   interTransferUDOption2: number
   interTransferUDOption3: number
   masterUDGroup1: number
   masterUDGroup2: number
   masterUDGroup3: number
   printCount: number
   externalDocNum: string
   sourceType: string
   isCompleted: boolean
   transferOutId: number
   transferOutNum: string
   packingId: number
   packingNum: string
   multiPackingId: number
   multiPackingNum: string
   parentObject: string
   receivedAt: Date
   receivedBy: string
   remark: string
   totalCarton: number
   completedAppCode: string
   completedAt: Date
   ackDate: Date
   grnNum: string
   sequence: number
   createdBy?: string
   createdById?: number
   createdAt?: Date
}

export interface TransferConfirmationRoot {
   interTransferId: number
   interTransferNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   locationId: number
   toLocationId: number
   sourceType: string
   transferOutId: number
   transferOutNum: string
   deactivated: boolean
   isCompleted: boolean
   createdBy: string
   createdAt: string
   line: TransferConfirmationLine[]
}

export interface TransferConfirmationLine {
   interTransferLineId: number
   interTransferVariationId: number
   interTransferId: number
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId: number
   xDesc: string
   yId: number
   yDesc: string
   barcode: string
   qty: number
   qtyReceive: number
   isDeleted: boolean

}

export interface CBMMapping {
   cbmValue: number
   cbmMappingId: number
   cartonQty: number
   totalCBMValue: number
   interTransferId: number
   interTransferCbmId: number
}
