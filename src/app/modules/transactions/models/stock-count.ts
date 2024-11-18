import { BarcodeTag } from "src/app/shared/models/item-barcode"

export interface StockCount {
   inventoryCountId: number
   inventoryCountNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   description?: string
   inventoryCountBatchNum: string
   inventoryCountBatchDescription: string
   zoneCode?: string
   zoneDescription?: string
   rackCode?: string
   rackDescription?: string
   binDesc?: string
   deactivated: boolean
   createdById: number

   // local use
   isTrxLocal: boolean
   guid: string
   lastUpdated: Date
}

export interface StockCountList {
   inventoryCountId: number
   inventoryCountNum: string
   description?: string
   locationCode: string
   locationDescription: string
   batchNum: string
   deactivated: boolean
}

export interface StockCountRoot {
   header: StockCountHeader
   details: StockCountDetail[]
   barcodeTag?: BarcodeTag[]
   isWorkFlowDone?: boolean
}

export interface StockCountHeader {
   inventoryCountId: number
   inventoryCountNum: string
   description?: string
   trxDate: Date
   trxDateTime: string
   locationId: number
   inventoryCountBatchId: number
   inventoryCountBatchNum: string
   inventoryCountBatchDescription: string
   zoneId: number
   rackId: number
   inventoryCountUDField1?: string
   inventoryCountUDField2?: string
   inventoryCountUDField3?: string
   inventoryCountUDOption1?: number
   inventoryCountUDOption2?: number
   inventoryCountUDOption3?: number
   remark?: string
   printCount: number
   cartonDesc: string
   zoneDesc: string
   rackDesc: string
   sourceType: string
   sequence: number
   createdById?: number
   createdBy?: string
   createdAt?: Date
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: Date
   deactivated?: boolean
   uuId: string

   // local use
   isLocal: boolean
   guid: string
   lastUpdated: Date
}

export interface StockCountDetail {
   inventoryCountLineId: number
   inventoryCountId: number
   locationId: number
   itemId: number
   itemVariationXId?: number
   itemVariationYId?: number
   itemSku: string
   itemBarcode: string
   itemBarcodeTagId: number
   qtyRequest: number
   qtyApproved?: number
   qtyCommit?: number
   binDesc: string
   binId: number
   sequence: number
   createdById?: number
   createdBy?: string
   createdAt?: Date
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: Date
   deactivated?: boolean

   // for local use
   itemCode: string
   itemDescription: string
   itemVariationXDescription?: string
   itemVariationYDescription?: string
   variationTypeCode: string
   itemUomId: number

   // testing performance
   guid?: string
}

export interface InventoryCountBatchList {
   inventoryCountBatchId: number
   inventoryCountBatchNum: string
   description: string
   locationCode: string
   locationDescription: string
   type: string
   startDate: string
   endDate: string
   deactivated: boolean
   isCompleted: boolean
   isClosed: boolean
}

export interface InventoryCountBatchCriteria {
   randomCountType: string
   keyId: number[]
}