export interface TruckLoadingRoot {
  header: TruckLoadingHeader
  details: TruckLoadingDetail[]
  otp: any
}

export interface TruckLoadingHeader {
  truckLoadingId: number
  truckLoadingNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  vendorId: number
  shipMethodId: any
  plateNumber: string
  remark: string
  truckLoadingUDField1: any
  truckLoadingUDField2: any
  truckLoadingUDField3: any
  truckLoadingUDOption1: any
  truckLoadingUDOption2: any
  truckLoadingUDOption3: any
  workFlowTransactionId: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  printCount: number
  sequence: any
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface TruckLoadingDetail {
  trxType: string
  customerName: string
  qty: number
  fromLocation: string
  toLocation: any
  totalCarton: any
  routerLink?: string
  truckLoadingLineId: number
  truckLoadingId: number
  trxId: number
  trxNum: string
  description?: any
  remark?: string
  sequence: number
}

export interface TruckLoadingTrxDetails {
  trxType: string
  trxId: number
  trxNum: string
  customerName: string
  fromLocation: string
  toLocation: any
  qty: number
  totalCarton: any
  routerLink: any
}
