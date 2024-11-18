import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ReportParameterModel, ReportParamsValueModel } from 'src/app/shared/models/report-param-model';
import { Customer } from '../../transactions/models/customer';
import { DebtorOutstanding, DebtorOutstandingRequest } from '../models/debtor-outstanding';
import { SAPerformanceListing, SalesAgentAllPerformanceObject } from '../models/rp-sa-performance-listing';
import { ReportSOListing } from '../models/rp-so-listing';
import { SalesByCustomer, SalesByCustomerRequest } from '../models/rp-sales-customer';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { CheckQohRoot, CheckQohVariationRequest, CheckQohVariationRoot } from '../models/rp-check-qoh';
import { CheckCn, CheckCnRequest } from '../models/rp-check-cn';
import { TransactionInquiryObject, TransactionInquiryRequestObject } from '../models/transaction-inquiry';
import { SalesAnalysisObject, SalesAnalysisRequestObject } from '../models/sales-analysis';
import { ConsignmentSalesLocation } from '../../transactions/models/consignment-sales';
import { ItemSalesAnalysis, ItemSalesAnalysisRequestObject } from '../models/item-sales-analysis';
import { Item } from '../../transactions/models/item';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentCountAnalysisObject, ConsignmentCountAnalysisRequestObject } from '../models/consignment-count-analysis';
import { CustomConsignmentSalesReportObject, CustomConsignmentSalesReportRequestObject } from '../models/consignment-sales-report';

@Injectable({
   providedIn: 'root'
})
export class ReportsService {

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   getCustomers() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/customer");
   }

   getItems() {
      return this.http.get<Item[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/item/itemList");
   }

   getDebtorOutstanding(object: DebtorOutstandingRequest) {
      return this.http.post<DebtorOutstanding[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/lastOutstanding", object);
   }

   getSOListing(object: DebtorOutstandingRequest) {
      return this.http.post<ReportSOListing[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/soListing", object).toPromise();
   }

   getBOListing(object: DebtorOutstandingRequest) {
      return this.http.post<ReportSOListing[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/boListing", object).toPromise();
   }

   getSAPerformance() {
      return this.http.get<SAPerformanceListing[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/saPerformance");
   }

   getAllSalesPerformance(dateStart: string, dateEnd: string) {
      return this.http.get<SalesAgentAllPerformanceObject[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/allPerformance/" + dateStart + "/" + dateEnd);
   }

   getSalesByCustomer(object: SalesByCustomerRequest) {
      return this.http.post<SalesByCustomer[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/salesByCustomer", object);
   }

   getCheckQoh(search: string, loginUserType: string, salesAgentId: number) {
      return this.http.get<CheckQohRoot[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/checkQoh/" + search + "/" + loginUserType + "/" + salesAgentId);
   }

   getCheckQohVariation(loginUserType: string, request: CheckQohVariationRequest) {
      return this.http.post<CheckQohVariationRoot[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/checkQohVariation/" + loginUserType, request).toPromise();
   }

   getCheckCn(object: CheckCnRequest) {
      return this.http.post<CheckCn[]>(this.configService.selected_sys_param.apiUrl + "mobileReport/checkCn", object);
   }

   getPdf(model: ReportParameterModel) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "mobileReport/exportPdf", model, { responseType: 'blob' });
   }

   getCreditInfo(customerId: number) {
      return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + "mobileReport/creditInfo/" + customerId);
   }

   getTransactionInquiry(requestObject: TransactionInquiryRequestObject) {
      return this.http.post<TransactionInquiryObject[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/trxInquiry", requestObject);
   }

   getSalesAnalysis(requestObject: SalesAnalysisRequestObject) {
      return this.http.post<SalesAnalysisObject[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/salesAnalysis", requestObject);
   }

   getItemSalesAnalysis(requestObject: ItemSalesAnalysisRequestObject) {
      return this.http.post<ItemSalesAnalysis[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/itemSalesAnalysis", requestObject);
   }

   getConsignmentCountAnalysis(requestObject: ConsignmentCountAnalysisRequestObject) {
      return this.http.post<ConsignmentCountAnalysisObject[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/consignmentCountAnalysis", requestObject);
   }

   getCustomConsignmentSalesReport(requestObject: CustomConsignmentSalesReportRequestObject) {
      return this.http.post<CustomConsignmentSalesReportObject[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/custom/consignmentSalesReport", requestObject);
   }

   getConsignmentLocation() {
      return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/consignmentLocation");
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileReport/masterList");
   }

   getInventoryLevel(reportNum: string, paramModel: ReportParamsValueModel[]) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + `MobileReport/inventoryLevel/${reportNum}`, paramModel, { responseType: "blob" });
   }

}
