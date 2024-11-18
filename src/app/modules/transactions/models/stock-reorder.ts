export interface StockReorderRoot {
   stockReorderId: number
   stockReorderNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   locationId: number
   deactivated: boolean
   isCompleted: boolean
   sourceType: string
   createdBy: string
   createdAt: string
   salesOrderId: number
   salesOrderNum: string
   remark: any
   workFlowTransactionId: number
   line: StockReorderLine[]
}

export interface StockReorderLine {
   id: number
   uuid: string
   stockReorderId: number
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
   barcode: string
   lineQty: number
   isDeleted: boolean

   // local usage
   balanceQty?: number
}

export interface StockReorderList {
   stockReorderId: number
   stockReorderNum: string
   trxDate: string
   trxDateTime: string
   locationCode: string
   locationDesc: string
   deactivated: boolean
   isCompleted: boolean
   typeCode: string
}

export interface InventoryCurrentModel {
   itemId: number
   itemCode: string
   itemSku: string
   locationId: number
   locationCode: string
   locationDescription: string
   qty: number
   transitQty: number
   openQty: number
}
