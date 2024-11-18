export interface TransferInScanningRoot {
   transferInScanningId: number
   transferInScanningNum: string
   trxDate: Date
   trxDateTime: Date
   typeCode: string
   locationId: number
   locationDesc: string
   toLocationId: number
   toLocationDesc: string
   sourceType: string
   interTransferId: number
   interTransferNum: string
   interTransferQty: number
   deactivated: boolean
   isCompleted: boolean
   createdBy: string
   createdAt: string
   remark: any
   workFlowTransactionId: number
   totalCarton: number
   line: TransferInScanningLine[]
   transferAdjustment: TransferAdjustmentRoot
   uuid: string
}

export interface TransferInScanningLine {
   id: number
   uuid: any
   transferInScanningId: number
   interTransferLineId: number
   interTransferVariationId: number
   interTransferId: number
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId?: number
   xCd?: string
   xDesc?: string
   yId?: number
   yCd?: string
   yDesc?: string
   barcode: string
   lineQty: number
   qtyReceive: number
   isDeleted: boolean
   unitPrice?: number
   discountGroupCode?: string
   discountExpression?: string
   discountAmt?: number
   subTotal?: number

   // for local use
   qtyRequest?: number
   unitPriceExTax?: number
}

export interface TransferAdjustmentRoot {
   transferAdjustmentId: number
   transferAdjustmentNum: string
   isCompleted: boolean
   line: TransferAdjustmentLine[]
}

export interface TransferAdjustmentLine {
   transferAdjustmentId: number
   transferAdjustmentLineId: number
   transferAdjustmentVariationId: number
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId: any
   xCd: any
   xDesc: any
   yId: any
   yCd: any
   yDesc: any
   qty: number
}

export interface TransferInScanningList {
   transferInScanningId: number
   transferInScanningNum: string
   trxDate: string
   trxDateTime: string
   locationCode: string
   locationDesc: string
   deactivated: boolean
   isCompleted: boolean
   typeCode: string
}