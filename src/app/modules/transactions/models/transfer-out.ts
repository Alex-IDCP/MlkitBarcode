export interface TransferOutRoot {
   transferOutId: number
   transferOutNum: string
   interTransferId: number
   interTransferNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   locationId: number
   toLocationId: number
   sourceType: string
   deactivated: boolean
   isCompleted: boolean
   remark: string
   totalCarton: number
   workFlowTransactionId: number
   line: TransferOutLine[]
   createdBy?: string
   createById?: number
   createdAt?: Date
   handleBy?: string
   totalBag?: number
}

export interface TransferOutLine {
   id: number
   uuid: string
   transferOutId: number
   sequence: number
   itemId: number
   itemCode: string
   itemSku: string
   itemDesc: string
   xId: number
   xCd: string
   xDesc: string
   yId: number
   yCd: string
   yDesc: string
   barcode: string
   lineQty: number
   isDeleted: boolean
   unitPrice?: number
   discountGroupCode?: string
   discountExpression?: string
   discountAmt?: number
   subTotal?: number
   containerNum: number

   // for local use
   qtyRequest?: number
   unitPriceExTax?: number
}

export interface TransferOutList {
   transferOutId: number
   transferOutNum: string
   trxDate: string
   trxDateTime: string
   fromLocationCode: string
   fromLocationDesc: string
   toLocationCode: string
   toLocationDesc: string
   isCompleted: boolean
   deactivated: boolean
   typeCode: string
}
