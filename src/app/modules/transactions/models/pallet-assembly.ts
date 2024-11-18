export interface PalletAssemblyList {
   palletAssemblyId: number
   palletAssemblyNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   totalPallet: number
   remark: string
   deactivated: boolean
}
export interface PalletAssemblyRoot {
   header: PalletAssemblyHeader
   details: PalletAssemblyDetail[]
}

export interface PalletAssemblyHeader {
   palletAssemblyId: number
   palletAssemblyNum: string
   trxDate: string
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   locationId: number
   workFlowTransactionId?: number
   trxDateTime: string
   printCount: number
   sourceType: string
   remark?: string
   binCode?: string
   totalPallet: number
   receiveMatchingId?: number
   receiveMatchingNum?: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated: boolean
}

export interface PalletAssemblyDetail {
   headerId: number
   lineId: number
   palletCode: string
   palletNum: number
   description?: string
   referenceNum?: string
   palletHeight?: number
   palletWidth?: number
   palletLength?: number
   palletWeight?: number
   binCode: string
   sequence: number
   palletItemList: PalletItemList[]
}

export interface PalletItemList {
   variationId: number
   headerId: number
   lineId: number
   itemId: number
   itemCode: string
   itemUomId?: number
   itemBarcode?: string
   description: string
   sequence: number
   qtyRequest: number
   lineUDDate?: Date
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   deactivated?: boolean
}
