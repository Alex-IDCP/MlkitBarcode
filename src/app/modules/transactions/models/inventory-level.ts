import { ItemPricing } from "src/app/shared/models/transaction-detail"

export interface InventoryLevelRoot {
   itemInfo: InventoryLevelItemInfo[]
   priceInfo: InventoryLevelPriceInfo[]
}

export interface InventoryLevelItemInfo {
   itemId: number
   itemCode: string
   locationId: number
   locationCode: string
   locationDescription: string
   qty: number
   transitQty: number
   openQty: number
}

export interface InventoryLevelPriceInfo {
   priceSegmentCode: string
   unitPrice: number
   discountGroupCode: string
   discountPercent: number
   nettPrice: number
}

//// variation
export interface InventoryLevelVariationRoot {
   itemInfo: InventoryLevelVariationItemInfo[]
   priceInfo: InventoryLevelPriceInfo[]
}

export interface InventoryLevelVariationItemInfo {
   locationId: number
   locationCode: string
   locationDescription: string
   variation: InventoryLevelVariation
   itemVariationXDescription: string[]
   itemVariationYDescription: string[]
   itemVariationXCode: string[]
   itemVariationYCode: string[]
}

export interface InventoryLevelVariation {
   itemId: number
   itemCode: string
   variationDetails: InventoryLevelVariationDetail[]
}

export interface InventoryLevelVariationDetail {
   itemVariationXId: number
   itemVariationXCode: string
   itemVariationXDescription: string
   variationDetails: InventoryLevelVariationDetail2[]
}

export interface InventoryLevelVariationDetail2 {
   itemVariationYId: number
   itemVariationYCode: string
   itemVariationYDescription: string
   itemSku: string
   qty?: number
   transitQty?: number
   openQty?: number
}

export interface ItemPriceBySegment {
   locationId: number
   itemPricing: ItemPricing
}