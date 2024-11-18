export interface CartonTruckLoadingList {
   cartonTruckLoadingId: number
   cartonTruckLoadingNum: string
   trxDate: string
   vehicleCode: string
   plateNumber: string
   deactivated: boolean
}

export interface CartonTruckLoadingRoot {
   header: CartonTruckLoadingHeader
   details: CartonTruckLoadingDetail[]
   otp?: any
}

export interface CartonTruckLoadingHeader {
   cartonTruckLoadingId: number
   cartonTruckLoadingNum: string
   trxDate: string
   truckArrangementId: number
   truckArrangementNum: string
   vehicleId: number
   remark?: string
   cartonTruckLoadingUDField1?: string
   cartonTruckLoadingUDField2?: string
   cartonTruckLoadingUDField3?: string
   cartonTruckLoadingUDOption1?: number
   cartonTruckLoadingUDOption2?: number
   cartonTruckLoadingUDOption3?: number
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   sequence?: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated: boolean
}

export interface CartonTruckLoadingDetail {
   cartonInfo: CartonInfo[]
   cartonBarcode: string[]
   cartonTruckLoadingLineId: number
   cartonTruckLoadingId: number
   truckArrangementLineId: number
   trxNum: string
   typeCode: string
   trxId: number
   trxType: string
   customerName: string
   qty: number
   totalCarton: number
   remark: string
   transportId?: number
   sequence: number
   createdById?: number
   createdBy?: string
   createdAt?: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated?: boolean
}

export interface CartonInfo {
   cartonNum: number
   qtyPacked: number
   packaging: string
   packagingCode: string
}

export interface TruckArrangementListForCTL {
   truckArrangementId: number
   truckArrangementNum: string
   trxDate: string
   vehicleCode: string
   locationCode: string
}

// for reference only
export interface TruckArrangementRootForCTL {
   header: TruckArrangementHeaderForCTL
   details: TruckArrangementDetailForCTL[]
   otp?: any
   cartonBarcode: TruckArrangementCartonBarcodeForCTL[]
}

// for reference only
export interface TruckArrangementHeaderForCTL {
   truckArrangementId: number
   truckArrangementNum: string
   trxDate: string
   locationId: number
   vehicleId: number
   driverId: number
   transportAgentId1?: number
   transportAgentId2?: number
   remark?: string
   truckArrangementUDField1?: string
   truckArrangementUDField2?: string
   truckArrangementUDField3?: string
   truckArrangementUDOption1?: number
   truckArrangementUDOption2?: number
   truckArrangementUDOption3?: number
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   mileageStart?: number
   mileageEnd?: number
   timeStart?: Date
   timeEnd?: Date
   tripCount: number
   sequence?: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
}

// for reference only
export interface TruckArrangementDetailForCTL {
   isAcknowledge?: boolean
   acknowledgeAt?: Date
   cartonInfo?: CartonInfo[]
   truckArrangementLineId: number
   truckArrangementId: number
   trxId?: number
   trxNum: string
   trxType?: string
   typeCode: string
   customerName: string
   qty?: number
   totalCarton: number
   description?: string
   remark?: string
   receivedAt?: Date
   transportId?: number
   isCheque: boolean
   isCash: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated: boolean
}

// for reference only
export interface TruckArrangementCartonBarcodeForCTL {
   trxNum: string
   trxId: number
   trxType: string
   cartonBarcode?: string
}
