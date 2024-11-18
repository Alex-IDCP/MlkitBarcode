export interface VariationRatio {
   itemVariationRatioCode: string
   itemVariationId: number
   qtyPerSet: number
   line: VariationRatioLine[]
}

export interface VariationRatioLine {
   itemVariationYId: number
   ratio: number
}