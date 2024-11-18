export interface MasterListDetails {
   historyInfo?: HistoryInfo[]
   objectName: string;
   id: number;
   code: string;
   description: string;
   attribute1: string;
   attribute2: string;
   attribute3: string;
   attribute4: string;
   attribute5: string;
   attribute6: string;
   attribute7: string;
   attribute8: string;
   attribute9: string;
   attribute10: string;
   attribute11: string;
   attribute12: string;
   attribute13: string;
   attribute14: string;
   attribute15: string;
   attribute16: string;
   attribute17: string;
   attribute18: string;
   attribute19?: string;
   attribute20?: string;
   attribute21?: string;
   attribute22?: string;
   attributeArray1: number[];
   shippingInfo?: ShippingInfo[]
   parentId?: number;
   sequence?: number;
   isPrimary: boolean;
   deactivated?: number;
   disabled?: boolean
}


export interface ShippingInfo {
   keyId?: number
   isPrimary?: boolean
   description?: string
   address: string
   postCode: string
   attention: any
   phone: string
   email: string
   fax: string
   areaId: number
   stateId: number
}

export interface HistoryInfo {
   effectiveDate: Date
   keyId: number
   salesAgentId?: number
   procurementAgentId?: number
   currencyId?: number
   rate?: number
}
