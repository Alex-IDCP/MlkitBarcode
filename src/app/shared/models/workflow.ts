export interface WorkFlowState {
  stateId: number
  title: string
  trxId: number
  trxIds?: number[]
  trxNum: string
  trxNums?: string[]
  trxDate: Date
  trxDates?: Date[]
  trxBy: string
  routerLink: string
  routerLinks?: string[]
  icon: string
  stateType: string
  isCompleted: boolean
  sequence: number
  interval: string
  currentService?: string
}
