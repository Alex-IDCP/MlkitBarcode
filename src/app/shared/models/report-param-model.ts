export interface ReportParameterModel {
   appCode: string
   format: string
   documentIds: number[]
   reportName: string
   customReportParam?: CustomReportParamModel
}

export interface CustomReportParamModel {
   parameter1: number[]
   statementDate: Date
}

export interface ReportParamsValueModel {
   rpName: string
   rpValue: any
}