import { HttpClient } from '@angular/common/http';
import { Injectable, QueryList } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemPricing, TransactionDetail } from '../models/transaction-detail';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AnnouncementFile } from 'src/app/modules/dashboard/models/dashboard';
import { environment } from 'src/environments/environment';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { MasterListDetails } from '../models/master-list-details';
import { MasterList } from '../models/master-list';
import { format } from 'date-fns';
import { LocalMarginConfig } from '../models/pos-download';
import { Decimal } from 'decimal.js';
import { OtherAmount } from 'src/app/modules/transactions/models/sales-order';
import { InnerVariationDetail, VariationDetail } from '../models/variation-detail';
import { VariationRatio } from '../models/variation-ratio';
import { ModuleControl } from '../models/module-control';

@Injectable({
   providedIn: 'root'
})
export class CommonService {
   
   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private loadingService: LoadingService,
      private file: File,
      private opener: FileOpener,
      private androidPermissions: AndroidPermissions
   ) { }

   /* #region common service */

   getCompanyProfile() {
      try {
         return this.http.get(this.configService.selected_sys_param.apiUrl + "account/companyInfo");
      } catch (e) {
         console.error(e);
      }
   }

   getCompanyProfileByUrl(apiUrl) {
      try {
         return this.http.get(apiUrl + "account/companyInfo").toPromise().then(r => { return r["name"] });
      } catch (e) {
         console.error(JSON.stringify(e));
      }
   }

   getMasterList() {
      try {
         return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDownload/masterlist").toPromise();
      } catch (error) {
         console.error(error);
      }
   }

   syncInbound() {
      try {
         return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDownload/itemMaster").toPromise();
      } catch (e) {
         console.error(e);
      }
   }

   syncInboundConsignment(locationId: number, trxDate: string) {
      try {
         return this.http.get(this.configService.selected_sys_param.apiUrl + `MobileDownload/itemMaster/${locationId}/${trxDate}`).toPromise();
      } catch (e) {
         console.error(e);
      }
   }

   syncMarginConfig(locationId: number) {
      return this.http.post<LocalMarginConfig[]>(this.configService.selected_sys_param.apiUrl + "MobileDownload/marginConfig", [locationId]).toPromise();
   }

   saveVersion() {
      try {
         return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDownload/mobileVersion/" + environment.version, null)
      } catch (e) {
         console.error(e);
      }
   }

   getAgentsMasterList() {
      try {
         return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDownload/masterlist");
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region date related */

   getFirstDayOfTheYear(): Date {
      try {
         let today = this.getTodayDate();
         let firstDoy = new Date(new Date().getUTCFullYear(), 0, 1, 0, 0, 0);
         firstDoy.setMinutes(today.getMinutes() - today.getTimezoneOffset());
         return firstDoy;
      } catch (e) {
         console.error(e);
      }
   }

   getFirstDayOfTodayMonth(): Date {
      try {
         let today = this.getTodayDate();
         let firstDom = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0);
         firstDom.setMinutes(today.getMinutes() - today.getTimezoneOffset());
         return firstDom;
      } catch (e) {
         console.error(e);
      }
   }

   getTodayDate(): Date {
      let today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      return today;
   }

   getDateWithoutTimeZone(inputDate: Date): Date {
      let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0)
      newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset())
      return newDate;
   }

   getDateWithoutTime(inputDate: Date): Date {
      let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0)
      return newDate;
   }

   //To add back timezone differences into UTC Date
   convertUtcDate(inputDate: Date): Date {
      let outputDate = new Date(inputDate);
      outputDate.setMinutes(outputDate.getMinutes() - outputDate.getTimezoneOffset());
      return outputDate;
   }

   //To add back timezone differences into UTC Date
   convertDateFormat(inputDate: Date): Date {
      let outputDate = new Date(inputDate);
      //outputDate.setMinutes(outputDate.getMinutes() - outputDate.getTimezoneOffset());
      return outputDate;
   }

   convertDateFormatIgnoreTimeAndDate(inputDate: Date): Date {
      try {
         let outputDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
         return outputDate;
      } catch (e) {
         console.error(e);
      }
   }

   convertDateFormatIgnoreTime(inputDate: Date): Date {
      try {
         let outputDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
         return outputDate;
      } catch (e) {
         console.error(e);
      }
   }

   convertObjectAllDateType(inputObject: any) {
      try {
         if (inputObject.hasOwnProperty("trxDate")) {
            if (inputObject.trxDate != null) {
               inputObject.trxDate = this.convertUtcDate(inputObject.trxDate);
            }
         }
         if (inputObject.hasOwnProperty("trxDateTime")) {
            if (inputObject.trxDateTime != null) {
               inputObject.trxDateTime = this.convertUtcDate(inputObject.trxDateTime);
            }
         }
         if (inputObject.hasOwnProperty("etaDate")) {
            if (inputObject.etaDate != null) {
               inputObject.etaDate = this.convertUtcDate(inputObject.etaDate);
            }
         }
         if (inputObject.hasOwnProperty("cancelDate")) {
            if (inputObject.cancelDate != null) {
               inputObject.cancelDate = this.convertUtcDate(inputObject.cancelDate);
            }
         }
         if (inputObject.hasOwnProperty("startDate")) {
            if (inputObject.startDate != null) {
               inputObject.startDate = this.convertUtcDate(inputObject.startDate);
            }
         }
         if (inputObject.hasOwnProperty("endDate")) {
            if (inputObject.endDate != null) {
               inputObject.endDate = this.convertUtcDate(inputObject.endDate);
            }
         }
         if (inputObject.hasOwnProperty("birthDate")) {
            if (inputObject.birthDate != null) {
               inputObject.birthDate = this.convertUtcDate(inputObject.birthDate);
            }
         }
         if (inputObject.hasOwnProperty("joinDate")) {
            if (inputObject.joinDate != null) {
               inputObject.joinDate = this.convertUtcDate(inputObject.joinDate);
            }
         }
         if (inputObject.hasOwnProperty("effectiveDate")) {
            if (inputObject.effectiveDate != null) {
               inputObject.effectiveDate = this.convertUtcDate(inputObject.effectiveDate);
            }
         }
         if (inputObject.hasOwnProperty("expiryDate")) {
            if (inputObject.expiryDate != null) {
               inputObject.expiryDate = this.convertUtcDate(inputObject.expiryDate);
            }
         }
         if (inputObject.hasOwnProperty("resignDate")) {
            if (inputObject.resignDate != null) {
               inputObject.resignDate = this.convertUtcDate(inputObject.resignDate);
            }
         }
         if (inputObject.hasOwnProperty("postingDate")) {
            if (inputObject.postingDate != null) {
               inputObject.postingDate = this.convertUtcDate(inputObject.postingDate);
            }
         }
         if (inputObject.hasOwnProperty("taxDate")) {
            if (inputObject.taxDate != null) {
               inputObject.taxDate = this.convertUtcDate(inputObject.taxDate);
            }
         }
         if (inputObject.hasOwnProperty("bankStatementDate")) {
            if (inputObject.bankStatementDate != null) {
               inputObject.bankStatementDate = this.convertUtcDate(inputObject.bankStatementDate);
            }
         }
         return inputObject;
      } catch (e) {
         console.error(e);
      }
   }

   convertArrayAllDateType(inputObject: any[]) {
      try {
         if (inputObject.length >= 1) {
            inputObject.forEach(x => {
               if (x.hasOwnProperty("etaDate")) {
                  if (x.etaDate != null) {
                     x.etaDate = this.convertUtcDate(x.etaDate);
                  }
               }
               if (x.hasOwnProperty("lineUDDate")) {
                  if (x.lineUDDate != null) {
                     x.lineUDDate = this.convertUtcDate(x.lineUDDate)
                  }
               }
               if (x.hasOwnProperty("startDate")) {
                  if (x.startDate != null) {
                     x.startDate = this.convertUtcDate(x.startDate);
                  }
               }
               if (x.hasOwnProperty("endDate")) {
                  if (x.endDate != null) {
                     x.endDate = this.convertUtcDate(x.endDate);
                  }
               }
               if (x.hasOwnProperty("gainLossPostDate")) {
                  if (x.gainLossPostDate != null) {
                     x.gainLossPostDate = this.convertUtcDate(x.gainLossPostDate);
                  }
               }
               if (x.hasOwnProperty("knockOffDate")) {
                  if (x.knockOffDate != null) {
                     x.knockOffDate = this.convertUtcDate(x.knockOffDate);
                  }
               }
            })
         }
         return inputObject;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region price related */

   computeUnitPriceExTax(trxLine: any, useTax: boolean, roundingPrecision: number) {
      try {
         if (useTax) {
            trxLine.unitPriceExTax = this.computeAmtExclTax(new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0), trxLine.taxPct);
         } else {
            trxLine.unitPriceExTax = new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).toNumber();
         }
         // trxLine.unitPriceExTax = trxLine.unitPriceExTax.toDecimalPlaces(roundingPrecision);
         return new Decimal(trxLine.unitPriceExTax ? trxLine.unitPriceExTax : 0).toDecimalPlaces(roundingPrecision).toNumber();
      } catch (e) {
         console.error(e);
      }
   }

   computeUnitPrice(trxLine: any, useTax: boolean, roundingPrecision: number) {
      try {
         if (useTax) {
            trxLine.unitPrice = this.computeAmtInclTax(new Decimal(trxLine.unitPriceExTax ? trxLine.unitPriceExTax : 0), trxLine.taxPct);
         } else {
            trxLine.unitPrice = new Decimal(trxLine.unitPriceExTax ? trxLine.unitPriceExTax : 0);
         }
         // trxLine.unitPrice = trxLine.unitPrice.toDecimalPlaces(roundingPrecision);
         return new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).toDecimalPlaces(roundingPrecision).toNumber();
      } catch (e) {
         console.error(e);
      }
   }

   computeOriUnitPriceExTax(trxLine: any, useTax: boolean, roundingPrecision: number) {
      try {
         if (useTax) {
            trxLine.oriUnitPriceExTax = this.computeAmtExclTax(new Decimal(trxLine.oriUnitPrice ? trxLine.oriUnitPrice : 0), trxLine.taxPct);
         } else {
            trxLine.oriUnitPriceExTax = new Decimal(trxLine.oriUnitPrice ? trxLine.oriUnitPrice : 0);
         }
         trxLine.oriUnitPriceExTax = trxLine.oriUnitPriceExTax.toDecimalPlaces(roundingPrecision);
         return trxLine.oriUnitPriceExTax.toNumber();
      } catch (e) {
         console.error(e);
      }
   }

   computeOriUnitPrice(trxLine: any, useTax: boolean, roundingPrecision: number) {
      try {
         if (useTax) {
            trxLine.oriUnitPrice = this.computeAmtInclTax(new Decimal(trxLine.oriUnitPriceExTax ? trxLine.oriUnitPriceExTax : 0), trxLine.taxPct);
         } else {
            trxLine.oriUnitPrice = new Decimal(trxLine.oriUnitPriceExTax ? trxLine.oriUnitPriceExTax : 0);
         }
         trxLine.oriUnitPrice = trxLine.oriUnitPrice.toDecimalPlaces(roundingPrecision);
         return trxLine.oriUnitPrice.toNumber();
      } catch (e) {
         console.error(e);
      }
   }

   computeAmtInclTax(amount: Decimal, taxPct: number) {
      try {
         if (taxPct == null) {
            taxPct = 0;
         }
         let amtInclTax: Decimal = amount.mul(new Decimal(1).add(new Decimal(taxPct).div(100)));
         return amtInclTax;
      } catch (e) {
         console.error(e);
      }
   }

   computeAmtExclTax(amount: Decimal, taxPct: number) {
      try {
         if (taxPct == null) {
            taxPct = 0;
         }
         let amtExclTax: Decimal = amount.div(new Decimal(100).add(taxPct)).mul(100);
         return amtExclTax;
      } catch (e) {
         console.error(e);
      }
   }

   roundToTwoDecimal(inputNumber: number): number {
      if (inputNumber) {
         return Math.round(Number(inputNumber * 100)) / 100;
      } else {
         return null;
      }
   }

   roundToPrecision(inputNumber: number, precision: number): number {
      try {
         let factor = Math.pow(10, precision);
         if (inputNumber) {
            return Math.round(Number(inputNumber * factor)) / factor;
         } else if (inputNumber === 0) {
            return 0;
         } else {
            return null;
         }
      } catch (e) {
         console.error(e);
      }
   }

   decimalJsRoundTwo(inputNumber: number) {
      let amount: Decimal = new Decimal(inputNumber ? inputNumber : 0);
      return amount.toDecimalPlaces(2).toNumber();
   }

   decimalJsRoundInt(inputNumber: number) {
      let amount: Decimal = new Decimal(inputNumber ? inputNumber : 0);
      return amount.toDecimalPlaces(0).toNumber();
   }

   decimalJsRoundPrecision(inputNumber: number, precision: number) {
      let amount: Decimal = new Decimal(inputNumber ? inputNumber : 0);
      return amount.toDecimalPlaces(precision).toNumber();
   }

   computeDiscTaxAmount(trxLine: any, useTax: boolean, isItemPriceTaxInclusive: boolean, isDisplayTaxInclusive: boolean, roundingPrecision: number) {
      try {
         let totalDiscAmt: Decimal = new Decimal(0);
         let unitPrice: Decimal = new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0);
         let unitPriceExTax: Decimal = new Decimal(trxLine.unitPriceExTax ? trxLine.unitPriceExTax : 0);
         let discExpression = trxLine.discountExpression;
         let quantity: Decimal = new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0);
         let subTotal: Decimal = new Decimal(0);

         if (isItemPriceTaxInclusive) {
            subTotal = unitPrice.mul(quantity);
         } else {
            subTotal = unitPriceExTax.mul(quantity);
         }

         //To split the expression with multi level discount, for eg. (10%/5%/3%)
         if (discExpression != "" && discExpression != null) {
            let splittedDisc = discExpression.split(/[+/]/g);
            splittedDisc.forEach(x => {
               let xDecimal: Decimal = new Decimal(parseFloat(x) ? parseFloat(x) : 0);
               if (x.includes('%')) {
                  let currentdiscPct: Decimal = xDecimal.div(100);
                  let currentDiscAmt: Decimal = subTotal.mul(currentdiscPct);
                  totalDiscAmt = totalDiscAmt.add(currentDiscAmt);
                  subTotal = subTotal.sub(currentDiscAmt);
               } else {
                  totalDiscAmt = totalDiscAmt.add(xDecimal);
                  subTotal = subTotal.sub(xDecimal);
               }
            })
         }
         if (trxLine.qtyRequest == 0) {
            totalDiscAmt = new Decimal(0);
         }
         if (useTax) {
            if (isItemPriceTaxInclusive) {
               trxLine.discountAmt = totalDiscAmt.toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.discountAmtExTax = this.computeAmtExclTax(totalDiscAmt, trxLine.taxPct).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.subTotal = (quantity.mul(unitPrice)).sub(trxLine.discountAmt).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.subTotalExTax = (quantity.mul(unitPriceExTax)).sub(trxLine.discountAmtExTax).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.taxAmt = new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).sub(trxLine.subTotalExTax).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.taxInclusive = isDisplayTaxInclusive;
            } else {
               trxLine.discountAmt = this.computeAmtInclTax(totalDiscAmt, trxLine.taxPct).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.discountAmtExTax = totalDiscAmt.toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.subTotalExTax = (quantity.mul(unitPriceExTax)).sub(trxLine.discountAmtExTax).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.taxAmt = new Decimal(trxLine.subTotalExTax ? trxLine.subTotalExTax : 0).mul(trxLine.taxPct ? trxLine.taxPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
               trxLine.taxInclusive = isDisplayTaxInclusive;
               trxLine.subTotal = (new Decimal(trxLine.subTotalExTax ? trxLine.subTotalExTax : 0).add(trxLine.taxAmt)).toDecimalPlaces(roundingPrecision).toNumber();
            }
         } else {
            trxLine.discountAmt = totalDiscAmt.toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.discountAmtExTax = totalDiscAmt.toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.subTotal = (quantity.mul(unitPrice)).sub(trxLine.discountAmt).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.subTotalExTax = new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.taxAmt = null;
            trxLine.taxInclusive = null;
         }
         return trxLine;
      } catch (e) {
         console.error(e);
      }
   }

   computeTradingMargin(trxLine: any, useTax: boolean, isItemPriceTaxInclusive: boolean, roundingPrecision: number) {
      let subTotal: Decimal = new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0).mul(new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0)).sub(new Decimal(trxLine.discountAmt ? trxLine.discountAmt : 0)).toDecimalPlaces(roundingPrecision);
      let subTotalExTax: Decimal = new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0).mul(new Decimal(trxLine.unitPriceExTax ? trxLine.unitPriceExTax : 0)).sub(new Decimal(trxLine.discountAmtExTax ? trxLine.discountAmtExTax : 0)).toDecimalPlaces(roundingPrecision);
      if (useTax) {
         if (trxLine.tradingMarginPct) {
            trxLine.tradingMarginAmt = subTotal.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.tradingMarginAmtExTax = subTotalExTax.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
         } else if (trxLine.tradingMarginExpression) {
            this.computeTradingMarginExpression(trxLine, subTotal, subTotalExTax, roundingPrecision);
         } else {
            trxLine.tradingMarginAmt = 0
            trxLine.tradingMarginAmtExTax = 0;
         }
         if (isItemPriceTaxInclusive) {
            trxLine.subTotal = subTotal.sub(new Decimal(trxLine.tradingMarginAmt)).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.subTotalExTax = subTotalExTax.sub(new Decimal(trxLine.tradingMarginAmtExTax)).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.taxAmt = new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).sub(trxLine.subTotalExTax).toDecimalPlaces(roundingPrecision).toNumber();
         } else {
            trxLine.subTotalExTax = subTotalExTax.sub(new Decimal(trxLine.tradingMarginAmtExTax)).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.taxAmt = new Decimal(trxLine.subTotalExTax ? trxLine.subTotalExTax : 0).mul(trxLine.taxPct ? trxLine.taxPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.subTotal = (new Decimal(trxLine.subTotalExTax ? trxLine.subTotalExTax : 0).add(trxLine.taxAmt)).toDecimalPlaces(roundingPrecision).toNumber();
         }
      } else {
         trxLine.tradingMarginAmt = subTotal.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
         trxLine.tradingMarginAmtExTax = subTotal.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
         if (trxLine.tradingMarginPct) {
            trxLine.tradingMarginAmt = subTotal.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
            trxLine.tradingMarginAmtExTax = subTotal.mul(trxLine.tradingMarginPct ? trxLine.tradingMarginPct : 0).div(100).toDecimalPlaces(roundingPrecision).toNumber();
         } else if (trxLine.tradingMarginExpression) {
            this.computeTradingMarginExpression(trxLine, subTotal, subTotal, roundingPrecision);
         } else {
            trxLine.tradingMarginAmt = 0
            trxLine.tradingMarginAmtExTax = 0;
         }
         trxLine.subTotal = subTotal.sub(new Decimal(trxLine.tradingMarginAmt)).toDecimalPlaces(roundingPrecision).toNumber();
         trxLine.subTotalExTax = subTotal.sub(new Decimal(trxLine.tradingMarginAmt)).toDecimalPlaces(roundingPrecision).toNumber();
      }
      if (trxLine.qtyRequest == null || (trxLine.tradingMarginPct == null && trxLine.tradingMarginExpression == null)) {
         trxLine.tradingMarginAmt = null;
         trxLine.tradingMarginAmtExTax = null;
      }
      return trxLine;
   }

   computeTradingMarginExpression(trxLine: any, subTotal: Decimal, subTotalExTax: Decimal, roundingPrecision: number) {
      let marginExpression = trxLine.tradingMarginExpression;
      let totalMarginAmt: Decimal = new Decimal(0);
      let totalMarginAmtExTax: Decimal = new Decimal(0);
      //To split the expression with multi level discount, for eg. (10%/5%/3%)
      if (marginExpression != "" && marginExpression != null) {
         let splittedDisc = marginExpression.split(/[+/]/g);
         splittedDisc.forEach(x => {
            let xDecimal: Decimal = new Decimal(parseFloat(x) ? parseFloat(x) : 0);
            if (x.includes('%')) {
               let currentMarginPct: Decimal = xDecimal.div(100);
               let currentMargincAmt: Decimal = subTotal.mul(currentMarginPct);
               let currentMargincAmtExTax: Decimal = subTotalExTax.mul(currentMarginPct);
               totalMarginAmt = totalMarginAmt.add(currentMargincAmt);
               totalMarginAmtExTax = totalMarginAmtExTax.add(currentMargincAmtExTax);
               subTotal = subTotal.sub(currentMargincAmt);
               subTotalExTax = subTotalExTax.sub(currentMargincAmtExTax);
            } else {
               totalMarginAmt = totalMarginAmt.add(xDecimal);
               totalMarginAmtExTax = totalMarginAmtExTax.add(xDecimal);
               subTotal = subTotal.sub(xDecimal);
               subTotalExTax = subTotalExTax.sub(xDecimal);
            }
         })
      }
      trxLine.tradingMarginAmt = totalMarginAmt.toDecimalPlaces(roundingPrecision).toNumber();
      trxLine.tradingMarginAmtExTax = totalMarginAmtExTax.toDecimalPlaces(roundingPrecision).toNumber();
   }

   computeMarginAmtByConsignmentConfig(trxLine: TransactionDetail, objectHeader: any, bearPromoUseGross: boolean, computeInvoiceAmt?: boolean): TransactionDetail {
      //To read bearPct from trxLine
      let bearPct: number = 0;
      if (trxLine.bearPct) {
         bearPct = trxLine.bearPct;
      }
      let beforeBearingAmt: Decimal = new Decimal(trxLine.discountAmt ? trxLine.discountAmt : 0).mul(new Decimal(bearPct ? bearPct : 0)).div(100).toDecimalPlaces(2);
      switch (objectHeader.marginMode) {
         case "G":
            trxLine.marginAmt = new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).mul(new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0)).mul(new Decimal(trxLine.marginPct ? trxLine.marginPct : 0)).div(100).toDecimalPlaces(2).toNumber();
            if (!trxLine.marginPct && trxLine.marginExpression) {
               trxLine.marginAmt = this.computeConsignmentMarginExpr(new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).mul(new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0)), trxLine.marginExpression);
            }
            break;
         case "N":
            trxLine.marginAmt = new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).mul(new Decimal(trxLine.marginPct ? trxLine.marginPct : 0)).div(100).toDecimalPlaces(2).toNumber();
            if (!trxLine.marginPct && trxLine.marginExpression) {
               trxLine.marginAmt = this.computeConsignmentMarginExpr(new Decimal(trxLine.subTotal ? trxLine.subTotal : 0), trxLine.marginExpression);
            }
            break;
         case "A":
            let afterBearingAmt = new Decimal(trxLine.discountAmt ? trxLine.discountAmt : 0).mul(new Decimal(100 - bearPct)).div(100).toDecimalPlaces(2);
            trxLine.bearPct = bearPct;
            trxLine.bearAmt = beforeBearingAmt.toNumber();
            trxLine.marginAmt = (new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).add(afterBearingAmt)).mul(new Decimal(trxLine.marginPct ? trxLine.marginPct : 0).div(100)).toDecimalPlaces(2).toNumber();
            if (!trxLine.marginPct && trxLine.marginExpression) {
               trxLine.marginAmt = this.computeConsignmentMarginExpr((new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).add(afterBearingAmt)), trxLine.marginExpression);
            }
            break;
         case null:
            trxLine.bearAmt = 0;
            trxLine.marginAmt = 0;
            break;
      }
      switch (objectHeader.isBearPromo) {
         case true:
            trxLine.bearPct = bearPct;
            trxLine.bearAmt = beforeBearingAmt.toNumber();
            if (bearPromoUseGross && trxLine.bearAmt) {
               trxLine.marginAmt = new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).mul(new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0)).mul(new Decimal(trxLine.marginPct ? trxLine.marginPct : 0)).div(100).toDecimalPlaces(2).toNumber();
               if (!trxLine.marginPct && trxLine.marginExpression) {
                  trxLine.marginAmt = this.computeConsignmentMarginExpr(new Decimal(trxLine.unitPrice ? trxLine.unitPrice : 0).mul(new Decimal(trxLine.qtyRequest ? trxLine.qtyRequest : 0)), trxLine.marginExpression);
               }
            }
            break;
         case false:
            trxLine.bearPct = 0;
            trxLine.bearAmt = 0;
            break;
      }
      if (computeInvoiceAmt) {
         trxLine.invoiceAmt = new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).sub(new Decimal(trxLine.marginAmt ? trxLine.marginAmt : 0)).toDecimalPlaces(2).toNumber();
         if (trxLine.bearAmt) {
            trxLine.invoiceAmt = new Decimal(trxLine.invoiceAmt ? trxLine.invoiceAmt : 0).add(new Decimal(trxLine.bearAmt ? trxLine.bearAmt : 0)).toDecimalPlaces(2).toNumber();
         }
         if (objectHeader.hasOwnProperty("isBearShortOver") && objectHeader.isBearShortOver == true && trxLine.hasOwnProperty("isShortOver") && trxLine.isShortOver && trxLine.hasOwnProperty("shortOverBearPct")) {
            trxLine.shortOverBearAmt = (new Decimal(trxLine.subTotal ? trxLine.subTotal : 0).sub(new Decimal(trxLine.marginAmt ? trxLine.marginAmt : 0))).mul(new Decimal(trxLine.shortOverBearPct ? trxLine.shortOverBearPct : 0).div(100)).toDecimalPlaces(2).toNumber();
         }
         if (objectHeader.hasOwnProperty("isBearShortOver") && objectHeader.isBearShortOver == true && trxLine.hasOwnProperty("isShortOver") && trxLine.hasOwnProperty("shortOverBearAmt") && trxLine.isShortOver && trxLine.shortOverBearAmt) {
            trxLine.invoiceAmt = trxLine.shortOverBearAmt;
         }
      }
      return trxLine;
   }

   computeConsignmentMarginExpr(amountDecimal: Decimal, marginExpression: string) {
      let totalMarginAmt: Decimal = new Decimal(0);
      //To split the expression with multi level discount, for eg. (10%/5%/3%)
      if (marginExpression != "" && marginExpression != null) {
         let splittedDisc = marginExpression.split(/[+/]/g);
         splittedDisc.forEach(x => {
            let xDecimal: Decimal = new Decimal(parseFloat(x) ? parseFloat(x) : 0);
            if (x.includes("%")) {
               let currentMarginPct: Decimal = xDecimal.div(100);
               let currentMargincAmt: Decimal = amountDecimal.mul(currentMarginPct);
               totalMarginAmt = totalMarginAmt.add(currentMargincAmt);
               amountDecimal = amountDecimal.sub(currentMargincAmt);
            } else {
               totalMarginAmt = totalMarginAmt.add(xDecimal);
               amountDecimal = amountDecimal.sub(xDecimal);
            }
         })
      }
      return totalMarginAmt.toDecimalPlaces(2).toNumber();
   }

   reversePromoImpact(receiptLine: TransactionDetail) {
      try {
         if (receiptLine.promoEventId != null) {
            receiptLine.promoEventId = null;
            receiptLine.isPromoImpactApplied = null;
            receiptLine.discountGroupCode = receiptLine.oriDiscountGroupCode;
            receiptLine.discountExpression = receiptLine.oriDiscountExpression;
         }
         return receiptLine;
      } catch (e) {
         console.error(e);
      }
   }

   async getMarginPct(item: TransactionDetail, trxDate: Date, locationId: number): Promise<TransactionDetail> {
      if (Capacitor.getPlatform() !== "web") {
         let matchBrand = JSON.parse(JSON.stringify(this.configService.margin_Configs.filter(r => r.type === "B" && r.typeId === item.itemBrandId && (new Date(r.trxDate) <= new Date(trxDate)) && r.locId === locationId)));
         let matchGroup = JSON.parse(JSON.stringify(this.configService.margin_Configs.filter(r => r.type === "G" && r.typeId === item.itemGroupId && (new Date(r.trxDate) <= new Date(trxDate)) && r.locId === locationId)));
         let matchCategory = JSON.parse(JSON.stringify(this.configService.margin_Configs.filter(r => r.type === "C" && r.typeId === item.itemCategoryId && (new Date(r.trxDate) <= new Date(trxDate)) && r.locId === locationId)));
         let matchDepartment = JSON.parse(JSON.stringify(this.configService.margin_Configs.filter(r => r.type === "D" && r.typeId === item.itemDepartmentId && (new Date(r.trxDate) <= new Date(trxDate)) && r.locId === locationId)));
         let base = JSON.parse(JSON.stringify(this.configService.margin_Configs.filter(r => r.type === null && r.typeId === null && (new Date(r.trxDate) <= new Date(trxDate)) && r.locId === locationId)));
         let allMatch = [...matchBrand, ...matchGroup, ...matchCategory, ...matchDepartment, ...base];
         if (allMatch && allMatch.length > 0) {
            allMatch = JSON.parse(JSON.stringify(allMatch.filter(r => r.discCode === item.discountGroupCode)));
            await allMatch.sort((a, b) => (b.id - a.id) || ((new Date(a.trxDate) < new Date(b.trxDate)) ? 1 : -1) || (b.hLevel - a.hLevel));
            // take newest trxDate only, if same trxDate but id different, sort again by id, take first one
            if (allMatch && allMatch.length > 0) {
               item.marginPct = allMatch[0].mPct;
               item.bearPct = allMatch[0].bPct;
               item.marginExpression = allMatch[0].mExpr;
            }
         }
         return item;
      }
   }

   computeItemPriceListLineDiscAmount(priceListLine: ItemPricing, useAddDiscountExpression) {
      if (priceListLine) {
         if (useAddDiscountExpression) {
            let totalDiscAmt: Decimal = new Decimal(0);
            let unitPrice: Decimal = new Decimal(priceListLine.unitPrice ? (priceListLine.unitPrice * (1 - (priceListLine.discountPercent / 100))) : 0);
            let discExpression = priceListLine.addDiscountExpression;

            if (unitPrice.toNumber() === 0) {
               return null;
            }

            if (discExpression && discExpression !== "" && discExpression !== null) {
               let splittedDisc = discExpression.split(/[+/]/g);
               splittedDisc.forEach(x => {
                  let xDecimal: Decimal = new Decimal(parseFloat(x) ? parseFloat(x) : 0);
                  if (x.includes('%')) {
                     let currentdiscPct: Decimal = xDecimal.div(100);
                     let currentDiscAmt: Decimal = unitPrice.mul(currentdiscPct);
                     totalDiscAmt = totalDiscAmt.add(currentDiscAmt);
                     unitPrice = unitPrice.sub(currentDiscAmt);
                  } else {
                     totalDiscAmt = totalDiscAmt.add(xDecimal);
                     unitPrice = unitPrice.sub(xDecimal);
                  }
               })
            }
            return unitPrice.toNumber();
         } else {
            return priceListLine.unitPrice * (1 - (priceListLine.discountPercent / 100));
         }
      }
   }

   /* #endregion */

   /* #region download */

   async commonDownload(file: Blob, object: AnnouncementFile) {
      let mimeType = this.getMimeType(object.filesType);
      console.log("🚀 ~ CommonService ~ commonDownload ~ mimeType:", mimeType)
      try {
         await this.loadingService.showLoading("Downloading");
         let filename = object.filesName;
         filename = filename.replace(" ", "").replace("/", "").replace(object.filesType, "_" + format(this.getTodayDate(), "yyyyMMdd") + object.filesType);
         if (Capacitor.getPlatform() === "android") {
            await this.file.writeFile(this.file.externalApplicationStorageDirectory, filename + object.filesType, file, { replace: true }).then(async () => {
               await this.opener.open(this.file.externalApplicationStorageDirectory + filename + object.filesType, mimeType);
               await this.loadingService.dismissLoading();
            }).catch(async (error) => {
               await this.loadingService.dismissLoading();
            })
         } else if (Capacitor.getPlatform() === "ios") {
            this.file.writeFile(this.file.tempDirectory, filename + object.filesType, file, { replace: true }).then(async () => {
               if (mimeType) {
                  await this.opener.open(this.file.tempDirectory + filename + object.filesType, mimeType);
               }
               await this.loadingService.dismissLoading();
            }).catch(async (error) => {
               await this.loadingService.dismissLoading();
            })
         } else {
            const url = window.URL.createObjectURL(file);
            const link = window.document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename + object.filesType);
            window.document.body.appendChild(link);
            link.click();
            link.remove();
            await this.loadingService.dismissLoading();
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   getMimeType(filesType: string) {
      switch (filesType.toUpperCase()) {
         case ".DOCX":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
         case ".XLSX":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
         case ".PPTX":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
         case ".CSV":
            return "text/csv";
         case ".PDF":
            return "application/pdf";
         case ".PNG":
            return "image/png";
         case ".JPG":
         case ".JPEG":
            return "image/jpeg";
         case ".JSON":
            return "application/json";
         case ".TXT":
            return "text/plain";
         default:
            return null;
      }
   }

   async commonDownloadPdf(file: Blob, filename: string) { // this filename already with extensions
      try {
         await this.loadingService.showLoading("Downloading");
         filename = filename.replace(" ", "").replace("/", "").replace(".pdf", "_" + format(this.getTodayDate(), "yyyyMMdd") + ".pdf");
         if (Capacitor.getPlatform() === "android") {
            await this.file.writeFile(this.file.externalApplicationStorageDirectory, filename, file, { replace: true }).then(async () => {
               await this.opener.open(this.file.externalApplicationStorageDirectory + filename, "application/pdf");
               await this.loadingService.dismissLoading();
            }).catch(async (error) => {
               await this.loadingService.dismissLoading();
               console.log(`this.file.writeFile ${JSON.stringify(error)}`);
            })
         } else if (Capacitor.getPlatform() === "ios") {
            await this.file.writeFile(this.file.tempDirectory, filename, file, { replace: true }).then(async () => {
               await this.opener.open(this.file.tempDirectory + filename, "application/pdf");
               await this.loadingService.dismissLoading();
            }).catch(async (error) => {
               await this.loadingService.dismissLoading();
            })
         } else {
            const url = window.URL.createObjectURL(file);
            const link = window.document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            window.document.body.appendChild(link);
            link.click();
            link.remove();
            await this.loadingService.dismissLoading();
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region misc function */

   setInputNumberSelect(viewChildrenQueryList: QueryList<any>, objectType: string) {
      setTimeout(() => {
         const viewChildElement = viewChildrenQueryList.find(element => element.el.nativeElement.id === (objectType))
         if (viewChildElement) {
            viewChildElement.input.nativeElement.select();
         }
      }, 1);
   }

   toFirstCharLowerCase(str: string) {
      return str.charAt(0).toLowerCase() + str.slice(1);
   }

   /* #endregion */

   /* #region get latest sales agent */

   lookUpSalesAgent(objectForm: UntypedFormGroup, customerMasterList: MasterListDetails[]) {
      var lookupValue = customerMasterList?.find(e => e.id == objectForm.get("customerId").value);
      if (lookupValue != undefined) {
         if (lookupValue.historyInfo && lookupValue.historyInfo.length > 0) {
            lookupValue.historyInfo.sort(function (a, b) {
               return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
            });
            let salesAgent = lookupValue.historyInfo.find(x => {
               return new Date(objectForm.get("trxDate").value).getTime() >= new Date(x.effectiveDate).getTime()
            })
            if (salesAgent) {
               objectForm.patchValue({ salesAgentId: parseFloat(salesAgent.salesAgentId.toString()) })
            } else {
               objectForm.patchValue({ salesAgentId: parseFloat(lookupValue.attribute1) })
            }
         }
      }
   }

   /* #endregion */

   /* #region other amount */

   computeOtherAmount(trxLineArray: any[], otherAmtTrxArray: OtherAmount[], roundingPrecision: number) {
      for (let i = 0; i < otherAmtTrxArray.length; i++) {
         if (i == 0) {
            otherAmtTrxArray[i].currentSubtotal = trxLineArray.filter(x => !x.deactivated).reduce((sum, current) => sum + current.subTotal, 0);
            otherAmtTrxArray[i] = this.computeOtherAmountExpression(otherAmtTrxArray[i]);
            otherAmtTrxArray[i].cumulativeAmount = otherAmtTrxArray[i].currentSubtotal + otherAmtTrxArray[i].totalAmount;
         } else {
            otherAmtTrxArray[i].currentSubtotal = otherAmtTrxArray[i - 1].cumulativeAmount;
            otherAmtTrxArray[i] = this.computeOtherAmountExpression(otherAmtTrxArray[i]);
            otherAmtTrxArray[i].cumulativeAmount = otherAmtTrxArray[i].currentSubtotal + otherAmtTrxArray[i].totalAmount;
         }
         otherAmtTrxArray[i].currentSubtotal = this.roundToPrecision(otherAmtTrxArray[i].currentSubtotal, roundingPrecision);
         otherAmtTrxArray[i].totalAmount = this.roundToPrecision(otherAmtTrxArray[i].totalAmount, roundingPrecision);
         otherAmtTrxArray[i].cumulativeAmount = this.roundToPrecision(otherAmtTrxArray[i].cumulativeAmount, roundingPrecision);
      }
      return otherAmtTrxArray;
   }

   computeOtherAmountFromInvoiceAmt(trxLineArray: any[], otherAmtTrxArray: OtherAmount[], roundingPrecision: number) {
      for (let i = 0; i < otherAmtTrxArray.length; i++) {
         if (i == 0) {
            otherAmtTrxArray[i].currentSubtotal = trxLineArray.filter(x => !x.deactivated).reduce((sum, current) => sum + current.invoiceAmt, 0);
            otherAmtTrxArray[i] = this.computeOtherAmountExpression(otherAmtTrxArray[i]);
            otherAmtTrxArray[i].cumulativeAmount = otherAmtTrxArray[i].currentSubtotal + otherAmtTrxArray[i].totalAmount;
         } else {
            otherAmtTrxArray[i].currentSubtotal = otherAmtTrxArray[i - 1].cumulativeAmount;
            otherAmtTrxArray[i] = this.computeOtherAmountExpression(otherAmtTrxArray[i]);
            otherAmtTrxArray[i].cumulativeAmount = otherAmtTrxArray[i].currentSubtotal + otherAmtTrxArray[i].totalAmount;
         }
         otherAmtTrxArray[i].currentSubtotal = this.roundToPrecision(otherAmtTrxArray[i].currentSubtotal, roundingPrecision);
         otherAmtTrxArray[i].totalAmount = this.roundToPrecision(otherAmtTrxArray[i].totalAmount, roundingPrecision);
         otherAmtTrxArray[i].cumulativeAmount = this.roundToPrecision(otherAmtTrxArray[i].cumulativeAmount, roundingPrecision);
      }
      return otherAmtTrxArray;
   }

   computeOtherAmountExpression(line: OtherAmount) {
      if (line.amountExpression) {
         let expressionValue: Decimal
         let expressionDecimal: Decimal = new Decimal(parseFloat(line.amountExpression) ? parseFloat(line.amountExpression) : 0);
         if (line.amountExpression.includes("%")) {
            expressionValue = expressionDecimal.div(100);
            line.totalAmount = new Decimal(line.currentSubtotal ? line.currentSubtotal : 0).mul(expressionValue).toNumber();
         } else {
            line.totalAmount = expressionDecimal.toNumber();
         }
      }
      return line;
   }

   /* #endregion */

   buildVariationStructure(itemList: TransactionDetail[]) {
      let result: TransactionDetail;
      if (itemList && itemList.length > 0) {
         let uniqueItem = [...new Set(itemList.flatMap(r => r.itemId))];
         let uniqueX = [...new Set(itemList.flatMap(r => r.itemVariationXId))];
         let uniqueY = [...new Set(itemList.filter(r => r.itemVariationYId !== null).flatMap(r => r.itemVariationYId))];
         result = itemList[0];

         let vd: VariationDetail[] = [];
         if (uniqueItem && uniqueItem.length > 1) {
            return null;
         }

         uniqueItem.forEach(r => {
            uniqueX.forEach(x => {
               let d: InnerVariationDetail[] = [];
               if (uniqueY && uniqueY.length > 0) {
                  uniqueY.forEach(y => {
                     let found = itemList.find(rr => rr.itemVariationXId === x && rr.itemVariationYId === y);
                     let ivd: InnerVariationDetail = {
                        itemVariationYId: y,
                        qtyRequest: null,
                        deactivated: found !== null ? false : true
                     }
                     d.push(ivd);
                  });
               } else {
                  let ivd: InnerVariationDetail = {
                     itemVariationYId: null,
                     qtyRequest: null,
                     deactivated: false
                  }
                  d.push(ivd);
               }
               vd.push({
                  itemVariationXId: x,
                  details: d
               })
            })
         })
         result.variationDetails = vd;
         result.variationX = [...new Set(itemList.flatMap(r => r.itemVariationXId))];
         result.variationY = [...new Set(itemList.flatMap(r => r.itemVariationYId))];
      }
      return result;
   }

   //lookUpCurrency
   lookUpCurrency(objectForm: FormGroup<any>, currencyMasterList: any) {
      var lookupValue = currencyMasterList?.find(e => e.id == objectForm.get("currencyId").value);
      if (lookupValue != undefined) {
         if (lookupValue.historyInfo && lookupValue.historyInfo.length > 0) {
            lookupValue.historyInfo.sort(function (a, b) {
               return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
            });
            let currency = lookupValue.historyInfo.find(x => {
               return new Date(objectForm.get("trxDate").value).getTime() >= new Date(x.effectiveDate).getTime()
            })
            if (currency) {
               objectForm.patchValue({ currencyRate: currency.rate })
            } else {
               objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) })
            }
         } else {
            objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) })
         }
      }
   }

   transformVariationRatioList(ratioMasterList: MasterListDetails[]) {
      if (ratioMasterList.length > 0) {
         let uniqueRatio = ratioMasterList.map(x => x.attribute3);
         uniqueRatio = [...new Set(uniqueRatio)];
         let finalRatio: VariationRatio[] = [];
         uniqueRatio.forEach(ratio => {
            let ratioSet = ratioMasterList.filter(x => x.attribute3 == ratio);
            if (ratioSet.length > 0) {
               let selectedData = ratioSet.map(x => ({ itemVariationYId: parseInt(x.attribute1), ratio: parseInt(x.attribute2) }))
               let newRatio = {
                  itemVariationRatioCode: ratioSet[0].code,
                  itemVariationId: ratioSet[0].id,
                  qtyPerSet: selectedData.reduce((sum, current) => sum + current.ratio, 0),
                  line: selectedData
               }
               finalRatio.push(newRatio)
            }
         })
         return finalRatio;
      } else {
         return [];
      }
   }

   getModCtrlBoolValue(moduleControl: ModuleControl[], controlName: string) {
      let findControl = moduleControl.find(x => x.ctrlName === controlName)
      if (findControl && findControl.ctrlValue.toUpperCase() == "Y") {
         return true;
      } else {
         return false;
      }
   }

}
