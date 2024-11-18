export interface OtpDTO {
   header: Otp
   details: OtpLine[]
}

export interface Otp {
   otpId: number
   otpCode: string
   userId: number
   validity: string
   expiredAt: Date
   status: string
   remark: string
}

export interface OtpLine {
   otpLineId?: number
   otpId?: number
   appCode?: string
   isUse?: boolean
}

export interface OtpSimpleLine {
   otpCode?: string;
   appCode?: string;
}

export interface OtpHistory {
   otpHistoryId: number
   otpLineId: number
   usedAt: string
   originalData: string
   updatedData: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
}
