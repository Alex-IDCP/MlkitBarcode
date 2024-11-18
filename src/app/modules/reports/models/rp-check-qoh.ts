import { ItemPricing } from "src/app/shared/models/transaction-detail"

export interface CheckQohRoot {
   itemId: number
   itemCode: string
   itemDescription: string
   inventoryLevel: CheckQohRootInventoryLevel[]
   segmentPricing: CheckQohRootSegmentPricing[]
}

export interface CheckQohRootInventoryLevel {
   itemId: number
   itemCode: string
   locationId: number
   locationCode: string
   locationDescription: string
   qty: number
   transitQty: number
   openQty: number
}

export interface CheckQohRootSegmentPricing {
   locationId: any
   itemPricing: ItemPricing
}




export interface CheckQohVariationRequest {
   locationId?: number[]
   itemId?: number[]
   brandId?: number[]
   departmentId?: number[]
   groupId?: number[]
   categoryId?: number[]
   dateStart?: string // .net is datetime
}

export interface CheckQohVariationRoot {
   locationId: number
   locationCode: string
   locationDescription: string
   variation: CheckQohVariationVariation
   itemVariationXDescription: string[]
   itemVariationYDescription: string[]
   itemVariationXCode: string[]
   itemVariationYCode: string[]
 }
 
 export interface CheckQohVariationVariation {
   itemId: number
   itemCode: string
   variationDetails: CheckQohVariationVariationDetail[]
 }
 
 export interface CheckQohVariationVariationDetail {
   itemVariationXId: number
   itemVariationXCode: string
   itemVariationXDescription: string
   variationDetails: CheckQohVariationInnerVariationDetail[]
 }
 
 export interface CheckQohVariationInnerVariationDetail {
   itemVariationYId: number
   itemVariationYCode: string
   itemVariationYDescription: string
   itemSku: string
   qty: number
   transitQty: number
   openQty: number
 }
 