export interface BinCountRoot {
   header: BinCountHeader
   details: BinCountDetail[]
}

export interface BinCountHeader {
   binCountId: number
   binCountNum: string
   description: string
   trxDate: Date
   trxDateTime: Date
   locationId?: number
   locationZoneId?: number
   binCountBatchId?: number
   /* #region for local use */
   binCountBatchNum?: string
   binCountBatchDescription?: string
   /* #endregion */
   sectionCode?: string
   rackCode?: string
   levelCode?: string
   binCountUDField1?: string
   binCountUDField2?: string
   binCountUDField3?: string
   binCountUDOption1?: number
   binCountUDOption2?: number
   binCountUDOption3?: number
   remark?: string
   printCount?: number
   sourceType: string
   createdBy: string
   createdById: number
   createdAt: Date
}

export interface BinCountDetail {
   binCountLineId: number
   binCountId: number
   locationId?: number
   binCode: string
   itemId?: number
   itemSku?: string
   itemVariationXId?: number
   itemVariationYId?: number
   itemBarcode?: string
   itemBarcodeTagId?: number
   qtyRequest?: number
   qtyApproved?: number
   qtyCommit?: number
   /* #region for local use */
   itemCode: string
   itemDescription: string
   guid?: string
   sequence: number
   /* #endregion */
}

export interface BinCountList {
   binCountId: number
   binCountNum: string
   trxDate: Date
   description: string
   locationCode: string
   locationDescription: string
   batchNum: string
   deactivated?: boolean
   sectionCode: string
   rackCode: string
   levelCode: string
   remark: string
}

export interface BinCountBatchList {
   binCountBatchId: number
   binCountBatchNum: string
   description: string
   locationCode: string
   locationDescription: string
   type: string
   startDate?: Date
   endDate?: Date
   deactivated?: boolean
   isCompleted?: boolean
}

export interface LocalBinCountBatchList {
   id: string
   sequence: number
   binCode: string
   detail: BinCountDetail[]
}