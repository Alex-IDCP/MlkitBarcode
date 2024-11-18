export interface LocationApplicationList {
    locationPreId: number
    locationPreCode: string
    description: string
    locationType: string
    priceSegmentCode: string
    pendingStatus: string
    workFlowTransactionId: number
    deactivated: boolean
    createdAt: string
}

export interface LocationApplicationRoot {
    header: LocationApplicationHeader
    approvalHistory: any[]
    attachmentFile: any[]
    comment: any[]
}

export interface LocationApplicationHeader {
    locationPreId: number
    locationPreCode: string
    oldLocationCode?: string
    whLocationId: number
    locationId: number
    description: string
    locationType: string
    phone: number
    fax: number
    email: string
    address: string
    postcode: number
    contact: number
    locationUDField1: string
    locationUDField2: string
    locationUDField3: string
    locationUDOption1: number
    locationUDOption2: number
    locationUDOption3: number
    locationUDOption4: number
    locationUDOption5: number
    locationUDOption6: number
    isPrimary: boolean
    priceSegmentCode: string
    shipMethodId: number
    areaId: number
    stateId: number
    attention: string
    startDate: Date
    endDate: Date
    isEodEmail: boolean
    hasClosingStock: boolean
    isOrdering: boolean
    eodEmail: string
    customerCode: string
    salesAgentId?: number
    locationCategoryId?: number
    locationGroupId?: number
    locationSectionId?: number
    locationExtraCategoryId?: number
    locationExtraGroupId?: number
    locationExtraSectionId?: number
    sequence: number
    deactivated: boolean
    isBearPromo: boolean
    isBearShortOver: boolean
    marginMode: string
    invoiceMode: string
    thumbprintPassword: string
    bankInfo: string
    salesCondition: string
    workFlowTransactionId: number
    remark: string
    isECommerce: boolean
    sourceType: string
    createdById: number
    createdBy: string
    createdAt: string
    modifiedById: any
    modifiedBy: any
    modifiedAt: any
}