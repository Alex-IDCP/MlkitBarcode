export interface CreditInfo {
   creditLimit: number;
   creditTerms: string;
   isCheckCreditLimit: boolean;
   isCheckCreditTerm: boolean;
   utilizedLimit: number;
   pendingOrderAmount: number;
   outstandingAmount: number;
   availableLimit: number;
   overdueAmount: number;
   pending: CreditInfoDetails[];
   outstanding: CreditInfoDetails[];
   overdue: CreditInfoDetails[];
}

export interface CreditInfoDetails {
   trxDate: Date;
   docId: number;
   docNum: string;
   docType: string;
   amount: number;
   routerLink: string;
   overdueDate?: Date;
   overdueDay?: number;
}