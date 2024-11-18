export interface TransferBinRoot {
   header: TransferBinHeader
   details: TransferBinDetail[]
}

export interface TransferBinHeader {
   transferBinId: number
   transferBinNum: string
   trxDate: string
   trxDateTime: string
   warehouseAgentId: number
   masterUDGroup1: number
   masterUDGroup2: number
   masterUDGroup3: number
   locationId: number
   remark: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
}

export interface TransferBinDetail {
   typeCode: string
   fromBinCode: string
   fromPalletCode: string
   toBinCode: string
   toPalletCode: string
   groupList: TransferBinGroupList[]
}

export interface TransferBinGroupList {
   transferBinId: number
   transferBinLineId: number
   itemId: number
   itemCode: string
   description: string
   qtyRequest: number
   deactivated: boolean
}

export interface TransferBinList {
   transferBinId: number
   transferBinNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   warehouseAgentId: number
   warehouseAgentName: any
   deactivated: boolean
}

// bin list
export interface BinList {
   binId: number
   binCode: string
   typeCode: string
}

export interface BinFromPalletList {
   binCode: string
   itemId: number
   qty: number
}
 