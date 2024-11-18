export interface DoAcknowledgement {
   truckArrangementNum: string
   deliveryOrderId: number
   deliveryOrderNum: string
   customerId: number
   customerCode: string
   customerName: string
}

export interface DOAcknowledegementRequest {
   truckArrangementNum: string
   vehicleId: number[]
   deliveryOrderNum: string
}