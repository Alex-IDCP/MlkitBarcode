export interface LocalItemMaster {
   id: number
   code: string
   itemDesc: string
   typeCode: string
   newId: number
   newDate: Date
   brandId: number
   brandCd: string
   brandDesc: string
   groupId: number
   groupCd: string
   groupDesc: string
   catId: number
   catCd: string
   catDesc: string
   uomId: number
   uomCd: string
   uomDesc: string
   deptId: number
   seasonId: number
   varCd: string
   price: number
   minPrice: number
   discId: number
   discCd: string
   discPct: number
   taxId: number
   taxCd: string
   taxPct: number
   imgUrl: string
   launchDate: Date
   isActiveMobile: boolean
}

export interface LocalItemBarcode {
   id: number
   itemId: number
   xId: any
   xCd: any
   xDesc: any
   xSeq: any
   yId: any
   yCd: any
   yDesc: any
   ySeq: any
   barcode: string
   itemUomId: number
   sku: string
   qty: number
   transitQty?: number
   isOther?: string
   itemUomDesc?: string
}

export interface LocalMarginConfig {
   id: number
   trxDate: Date
   locId: number
   type?: string
   typeId?: number
   discCode: string
   hLevel: number
   mPct: number
   bPct: number
   mExpr: string
}

export interface LocalTransaction {
   id: string
   apiUrl: string
   trxType: string
   lastUpdated: Date
   jsonData: string
}