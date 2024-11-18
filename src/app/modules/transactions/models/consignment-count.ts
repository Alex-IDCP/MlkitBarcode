import { BarcodeTag } from "src/app/shared/models/item-barcode"

export interface ConsignmentCountList {
   consignmentCountId: number
   consignmentCountNum: string
   trxDate: Date
   locationId: number
   locationCode: string
   locationDescription: string
   totalQty: number

   // local use
   isLocal: boolean
   guid: string
   lastUpdated: Date
}

export interface ConsignmentCountRoot {
  header: ConsignmentCountHeader
  details: ConsignmentCountDetail[]
  barcodeTag?: BarcodeTag[]
}

export interface ConsignmentCountHeader {
  consignmentCountId: number
  consignmentCountNum: string
  description: string
  trxDate: Date
  trxDateTime: string
  locationId: number
  consignmentCountUDField1: string
  consignmentCountUDField2: string
  consignmentCountUDField3: string
  consignmentCountUDOption1: number
  consignmentCountUDOption2: number
  consignmentCountUDOption3: number
  remark: string
  printCount: number
  rack: string
  zone: string
  sourceType: string
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: number
  modifiedBy: string
  modifiedAt: string
  deactivated: boolean
  uuId: string

  // local use
  isLocal: boolean
  guid: string
  lastUpdated: Date
}

export interface ConsignmentCountDetail {
  consignmentCountLineId: number
  consignmentCountId: number
  locationId: number
  itemId: number
  itemVariationXId: number
  itemVariationYId: number
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode: string
  qtyRequest: number
  qtyApproved?: number
  qtyCommit?: number
  sequence: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: number
  modifiedBy?: string
  modifiedAt?: string
  deactivated?: boolean

  // local col
  itemCode?: string
  itemDescription?: string
  itemVariationXDescription?: string
  itemVariationYDescription?: string
  
  // testing performance
  guid?: string
}