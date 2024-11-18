export interface InventoryCountProcessingRoot {
   header: InventoryCountProcessingHeader
   details: InventoryCountProcessingDetail[]
   barcodeTag: any
   countList: InventoryCountProcessingCountList[]
   isWorkFlowDone: boolean
}

export interface InventoryCountProcessingHeader {
   inventoryCountProcessingId: number
   inventoryCountProcessingNum: string
   description: any
   trxDate: string
   trxDateTime: string
   locationId: number
   inventoryCountBatchId: number
   snapshotDate: string
   inventoryCountProcessingUDField1: any
   inventoryCountProcessingUDField2: any
   inventoryCountProcessingUDField3: any
   inventoryCountProcessingUDOption1: any
   inventoryCountProcessingUDOption2: any
   inventoryCountProcessingUDOption3: any
   inventoryAdjustmentId: any
   inventoryAdjustmentNum: any
   totalAdjustQty: any
   printCount: number
   isIncludeNoneInventory: boolean
   isIncludeTransitQty: boolean
   workFlowTransactionId: number
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}

export interface InventoryCountProcessingDetail {
   inventoryCountProcessingLineId: number
   inventoryCountProcessingId: number
   itemId: number
   itemVariationXId?: number
   itemVariationYId?: number
   itemSku: string
   description: string
   extendedDescription?: string
   countQty: number
   snapshotQty: number
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}

export interface InventoryCountProcessingCountList {
   inventoryCountId: number
   inventoryCountNum: string
}
