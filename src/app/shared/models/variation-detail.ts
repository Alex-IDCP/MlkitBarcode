export interface VariationDetail {
   itemVariationXId?: number
   details?: InnerVariationDetail[]
}

export interface InnerVariationDetail {
   sequence?: number
   variationId?: number
   lineId?: number
   headerId?: number
   itemVariationYId?: number
   itemSku?: string
   itemBarcodeTagId?: any
   itemBarcode?: any
   /* #region for mobile only */
   qtyInCart?: number
   /* #endregion */
   qtyRequest?: number
   qtyCommit?: any
   qtyApproved?: any
   qtyReceive?: any
   qtyBalance?: any
   parentVariationId?: any
   actualQty?: number
   openQty?: number
   availableQty?: number
   ratio?: any
   deactivated?: boolean
}
