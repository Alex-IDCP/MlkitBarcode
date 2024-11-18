export interface LoginUser {
   userId: number
   userEmail: string
   token: string
   refreshToken: string
   playerId: string
   userName: string
   salesAgentId: number
   warehouseAgentId: number
   procurementAgentId: number
   loginUserType: string
   companyCode: string
   loginUserGroupType: string
   locationId: number[]
   defaultLocationId: number
   
   status: string;    // SCS: Success, 2FA: Required 2 Factor, IAC: Invalid Authenticator Code
   tokenExpiredBehavior: string;
   options: AuthenticatorOption[]
}

export interface LoginRequest {
   userEmail: string;
   password: string;
   loginUserType: string;
   twoFactorType?: string;
   twoFactorAuthCode?: string;
}

export interface TokenRequest {
   accessToken: string;
   refreshToken: string;
}

export interface ForgotPasswordRequest {
   userEmail: string;
   clientURI: string;
}

export interface CustomToken {
   nameid: string,
   unique_name: string,
   email: string,
   role: string,
   debug_mode: string,
   nbf: number,
   exp: number,
   iat: number
   lid: string
}

export interface ResetPassword {
   password: string;
   confirmPassword: string;
   userEmail: string;
   token: string;
}

export interface AuthenticatorOption {
   type: string;
   setupInfo: AuthenticatorSetupInfo
}

export interface AuthenticatorSetupInfo {
   manualEntryKey: string;
   qrCodeSetupImageUrl: string;
}
