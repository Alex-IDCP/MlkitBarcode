export interface TransferInHeader {
  interTransferId: number
  interTransferNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  locationId: number
  toLocationId: number
  sourceType: string
  transferOutId?: number
  transferOutNum?: string
  deactivated: boolean
  isCompleted: boolean
  createdBy: string
  createdAt: string
  receivedAt: string
  line: TransferInLine[]
}

export interface TransferInLine {
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
  qty: number
  qtyReceive?: number
  isDeleted?: boolean
  unitPrice?: number
  discountGroupCode?: string
  discountExpression?: string
  discountAmt?: number
  subTotal?: number
}

export interface TransferInList {
  interTransferId: number
  interTransferNum: string
  trxDate: string
  trxDateTime: string
  fromLocationCode: string
  fromLocationDesc: string
  toLocationCode: string
  toLocationDesc: string
  isCompleted: boolean
  deactivated: boolean
}
