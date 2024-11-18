export interface PosApproval {
   posApprovalId: number
   trxDate: string
   trxDateTime: string
   locationId: number
   locationCode: string
   stationNum: number
   reason: string
   posApprovalType: string
   posBillId: number
   posBillNum: string
   posRefundMethodId: number
   posRefundAmount: number
   posSpecialExchangeDetails: string
   posSpecialExchangeId: number
   posSpecialExchangeNum: string
   salesDepositId: number
   salesDepositNum: string
   salesDepositAmount: number
   isApproved: boolean
   isCompleted: boolean
   approvedAt: Date
   approvedBy: string
   remark: string
   sequence: number
   createdBy: string
   createdAt: Date
   deactivated: boolean
}

export interface PosApprovalLine {
   posApprovalLineId: number
   posApprovalId: number
   posBillLineId: number
   posBillId: any
   posDatabaseLineId: any
   uuid: string
   posDatabaseId: any
   itemId: number
   itemCode: string
   imgUrl: string
   description: string
   itemVariationXId: any
   itemVariationYId: any
   itemVariationXDesc: any
   itemVariationYDesc: any
   itemSku: string
   itemBarcode: string
   itemBrandId: number
   itemGroupId: number
   itemCategoryId: number
   qtyRequest: number
   unitPrice: number
   discountGroupId1: string
   discountGroupCode1: string
   discountGroupId2: any
   discountGroupCode2: any
   discountExpression: string
   discountExpression1: string
   discountExpression2: any
   discountAmt: number
   discountedUnitPrice: number
   taxId: any
   taxPct: number
   taxAmt: number
   totalAmt: number
   promoId: any
   posOfferId: any
   posOfferCode: any
   posOfferCodeExpression: any
   isPriceOverride: any
   isDiscOverride: any
   attrStr01: any
   attrStr02: any
   attrStr03: any
   attrStr04: any
   attrStr05: any
   attrNum01: any
   attrNum02: any
   attrNum03: any
   attrNum04: any
   attrNum05: any
   promotionDesc: any
   oriUnitPrice: number
   oriDiscountGroupId1: number
   oriDiscountGroupCode1: string
   oriDiscountGroupId2: any
   oriDiscountGroupCode2: any
   oriDiscountExpression: string
   oriDiscountExpression1: string
   oriDiscountExpression2: any
   oriDiscountAmt: number
   oriLineAmt: number
   isPromoImpactApplied: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}