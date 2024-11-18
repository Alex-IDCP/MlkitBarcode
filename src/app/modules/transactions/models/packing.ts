import { LineAssembly } from "src/app/shared/models/transaction-detail"

export interface MultiPackingList {
   multiPackingId: number
   multiPackingNum: string
   trxDate: Date
   locationCode: string
   locationDescription: string
   toLocationCode: string
   toLocationDescription: string
   warehouseAgentId: number
   warehouseAgentName: string
   deactivated: boolean
   createdById: number

   // local use
   isTrxLocal: boolean
   guid: string
   lastUpdated: Date
}

export interface MultiPackingRoot {
   header: MultiPackingHeader
   details: MultiPackingCarton[]
   outstandingPackList: SalesOrderLineForWD[]
   attachmentFile?: any[]
   comment?: any[]
   otp?: any
}

export interface MultiPackingHeader {
   multiPackingId: number
   multiPackingNum: string
   trxDate: Date
   groupType: string
   warehouseAgentId: number
   externalDocNum: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   locationId: number
   workFlowTransactionId: any
   customerId: number
   typeCode: string
   trxDateTime: string
   printCount: number
   toLocationId: number
   businessModelType: string
   isWithSo: boolean
   copyFrom: string
   sourceType: string
   remark: any
   totalCarton: number
   generateDate: Date
   isDeemedSupply: boolean
   deemedSupplyNum: string
   childId: any
   childNum: any
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
   uuid: string
   shipMethodId?: number

   // local use
   isTrxLocal: boolean
   guid: string
   lastUpdated: Date
}

export interface MultiPackingCarton {
   cartonNum: number
   cartonHeight: number
   cartonWidth: number
   cartonLength: number
   cartonWeight: number
   cartonCbm: number
   packagingId: number
   cartonBarcode: string
   packList: CurrentPackList[]
   // for local use
   isSelected?: boolean
}

export interface CurrentPackList {
   multiPackingLineId: number
   multiPackingId: number
   itemId: number
   itemCode: string
   itemVariationXId?: number
   itemVariationYId?: number
   itemVariationXDescription: string
   itemVariationYDescription: string
   itemUomId: number
   itemSku: string
   itemBarcode: string
   description: string
   qtyPacked: number
   sequence: number
   lineUDDate: Date
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   locationId: number
   cartonNum: number
   deactivated: boolean
   variations: CurrentPackAssignment[]
   assemblyItemId?: number
}

export interface CurrentPackAssignment {
   qtyPacked: number
   salesOrderId: number
   salesOrderLineId: number
   salesOrderVariationId: number
}

export interface MultiPackingObject {
   outstandingPackList: SalesOrderLineForWD[],
   packingCarton: MultiPackingCarton[];
}

/* #region interface from base */

export interface SalesOrderHeaderForWD {
   salesOrderId: number
   salesOrderNum: string
   trxDate: Date
   locationId: number
   locationDesc: string
   customerId: number
   customerDesc: string
   toLocationId: number
   toLocationDesc: string
   currencyId: number
   currencyDesc: string
   businessModelType: string
   isLoaded: boolean
   shipMethodId: number
   line: SalesOrderLineForWD[]
}

export interface SalesOrderLineForWD {
   multiPickingOutstandingId?: number
   multiPackingOutstandingId?: number
   multiPickingId?: number
   multiPackingId?: number
   itemId: number
   variationTypeCode: string
   itemVariationXId: number
   itemVariationYId: number
   itemCode: string
   itemSku: string
   // description: string
   // itemVariationXDescription: string
   // itemVariationYDescription: string
   itemBarcode: string
   rack: string
   subRack: string
   qtyRequest: number
   salesOrderLineId?: number
   salesOrderVariationId?: number
   salesOrderId?: number
   salesOrderNum?: string
   qtyPicked?: number
   qtyPacked?: number
   qtyCurrent?: number
   reasonId?: number
   isComponentScan?: boolean
   assembly?: LineAssembly[]
   isPrimaryUom?: boolean
   itemUomId?: number   
}