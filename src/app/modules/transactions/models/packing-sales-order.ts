export interface PackingSalesOrderRoot {
  header: PackingSalesOrderHeader
  details: PackingSalesOrderDetail[]
  pickingHistory: PickingHistory[]
}

export interface PackingSalesOrderHeader {
  salesOrderId: number
  salesOrderNum: string
  trxDate: string
  customerId: number
  businessModelType: string
  countryId: number
  currencyId: number
  typeCode: string
  locationId: number
  toLocationId: any
  location: string
  toLocation: any
  deactivated: any
}

export interface PackingSalesOrderDetail {
  salesOrderId: number
  itemId: number
  description: string
  itemVariationXId?: number
  itemVariationYId?: number
  itemSku: string
  itemVariationTypeCode: any
  itemCode: string
  itemVariationXDescription?: string
  itemVariationYDescription?: string
  itemUomId: number
  itemUomDescription: string
  rack?: string
  subRack?: string
  qtyRequest: number
  qtyCommit: number
  qtyBalance: any
  qtyPicked: number
  qtyPacked: number
  qtyPackedCurrent?: number
}

export interface PickingHistory {
  pickingId: number
  pickingNum: string
}
