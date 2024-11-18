export interface MultiInboundListObject {
   trxDate: Date
   multiInboundId: number
   multiInboundNum: string
   locationCode: string
   locationDescription: string
   toLocationCode: string
   toLocationDescription: string
   warehouseAgentId: number
   warehouseAgentName: string
   deactivated?: boolean
   customerCode: string
   customerName: string
   remark: string
   isGenerated?: boolean
   inboundDocNum: string
   locationId?: number
}

export interface MultiInboundRoot {
   header: MultiInbound
   details?: MultiInboundCarton[]
   otp?: any
   attachmentFile?: any[]
   comment?: any[]
   outstandingInboundList: InboundLineForWD[]
}

export interface MultiInboundObject {
   outstandingInboundList: InboundLineForWD[]
   inboundCarton: MultiInboundCarton[];
}

export interface MultiInbound {
   multiInboundId: number
   multiInboundNum: number
   typeCode: string
   trxDate: Date
   locationId: number
   toLocationId: number
   customerId: number
   warehouseAgentId: number
   warehouseAgent02Id: number
   multiInboundUDField1: string
   multiInboundUDField2: string
   multiInboundUDField3: string
   multiInboundUDOption1: number
   multiInboundUDOption2: number
   multiInboundUDOption3: number
   deactivated: boolean
   workFlowTransactionId: number
   createdBy: string
   createdAt: Date
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   businessModelType: string
   sourceType: string
   isWithDoc: boolean
   groupType: string      //I: Item S: Document
   remark: string
   totalCarton: number
   copyFrom: string
   referenceNum: string
   externalDocNum: string
   trxDateTime: Date
   returnDate: Date
   printCount: number
   childId: number
   childNum: string
   childDocType: string
   reasonId: number
   isGoodsReturn: boolean
}

export interface MultiInboundCarton {
   cartonNum: number;
   inboundList: CurrentInboundList[];
}

export interface CurrentInboundList {
   multiInboundLineId: number
   multiInboundId: number
   itemId: number
   itemCode: string
   itemVariationXId: number
   itemVariationYId: number
   itemVariationXDescription?: string
   itemVariationYDescription?: string
   itemUomId: number
   itemSku: string
   itemBarcode: string
   description: string
   qtyScanned: number
   sequence: number
   lineUDDate: Date
   masterUDGroup1: number
   masterUDGroup2: number
   masterUDGroup3: number
   locationId: number
   cartonNum: number
   deactivated: boolean
   variations?: CurrentInboundAssignment[]
}

export interface CurrentInboundAssignment {
   qtyScanned: number
   inboundDocId: number
   inboundDocLineId: number
   inboundDocVariationId: number
}

export interface InboundGenerateDocReq {
   trxId: number
   trxDate: string
}export interface InboundHeaderForWD {
   inboundDocId: number
   inboundDocNum: string
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
   isLoaded?: boolean
   line: InboundLineForWD[]
}

export interface InboundLineForWD {
   multiInboundOutstandingId?: number
   multiInboundId?: number
   itemId: number
   variationTypeCode: string
   itemVariationXId: number
   itemVariationYId: number
   itemCode: string
   itemSku: string
   description: string
   itemVariationXDescription: string
   itemVariationYDescription: string
   qtyRequest: number
   inboundDocLineId?: number
   inboundDocVariationId?: number
   inboundDocId?: number
   inboundDocNum?: string
   qtyScanned?: number
   qtyCurrent?: number
   reasonId?: number
}
