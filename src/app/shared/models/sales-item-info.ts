export interface SalesItemInfoRoot {
   masterInfo: SalesMasterInfo
   quantityInfo: SalesQuantityInfo[]
   historyInfo: SalesHistoryInfo[]
}

export interface SalesMasterInfo {
   itemId: number
   itemCode: string
   itemType: string
   extendedDescription: string
   itemBrand: string
   itemGroup: string
   itemSubGroup: string
   itemCategory: string
   itemSubCategory: string
   height: number
   width: number
   length: number
   weight: number
}

export interface SalesQuantityInfo {
   location: string
   quantity: number
}

export interface SalesHistoryInfo {
   documentId: number
   documentNumber: string
   documentDate: string
   customer: string
   agent: string
   country: string
   currency: string
   currencyRate: number
   quantity: number
   unitPrice: number
   customerId: number
   discountGroupCode: string
   discountExpression: string
}
