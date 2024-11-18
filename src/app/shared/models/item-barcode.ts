export interface ItemBarcodeModel {
  itemId: number
  itemCode: string
  description: string
  deactivated: boolean
  variationTypeCode: string
  itemVariationLineXId: number
  itemVariationLineYId: number
  itemSku: string
  itemVariationLineXDescription: string
  itemVariationLineYDescription: string
  itemBarcodeTagId: number
  itemBarcode: string
  itemUomId: number
  itemUomDesc: string
  brandId: number
  groupId: number
  catId: number
  unitPrice: number
}

export interface BarcodeTag {
  itemId: number
  itemCode: string
  description: string
  variationTypeCode: string
  itemVariationLineXId?: number
  itemVariationLineYId?: number
  itemVariationLineXDescription?: string
  itemVariationLineYDescription?: string
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode: string
  itemUomId: number
  itemUomDescription: string
  deactivated: boolean
}
