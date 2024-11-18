import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ViewWillEnter } from '@ionic/angular';
import { ReportsService } from '../../../services/reports.service';
import { format, parseISO } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { ConsignmentCountAnalysisRequestObject } from '../../../models/consignment-count-analysis';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportParameterModel, ReportParamsValueModel } from 'src/app/shared/models/report-param-model';

@Component({
  selector: 'app-rp-inventory-level',
  templateUrl: './rp-inventory-level.page.html',
  styleUrls: ['./rp-inventory-level.page.scss'],
})
export class RpInventoryLevelPage implements OnInit, ViewWillEnter {

   Math: any;
   
   itemList: MasterListDetails[] = [];
   itemBrandList: MasterListDetails[] = [];
   itemDepartmentList: MasterListDetails[] = [];
   itemGroupList: MasterListDetails[] = [];
   itemCategoryList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];

   selectedItem: number[] = [];
   selectedItemBrand: number[] = [];
   selectedItemDepartment: number[] = [];
   selectedItemGroup: number[] = [];
   selectedItemCategory: number[] = [];
   selectedLocation: number[] = [];

   constructor(
      private objectService: ReportsService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService
   ) {
      this.Math = Math;
   }

   async ionViewWillEnter(): Promise<void> {
      await this.setFormattedDateString();
      await this.loadingService.showLoading();
      await this.loadMasterList();
      await this.loadingService.dismissLoading();
   }

   ngOnInit() {
      
   }

   loadMasterList() {
      this.objectService.getMasterList().subscribe({
         next: (response) => {
            let masterList = response;
            this.itemList = masterList.filter(s => s.objectName === "Item").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemBrandList = masterList.filter(s => s.objectName === "ItemBrand").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemDepartmentList = masterList.filter(s => s.objectName === "ItemDepartment").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemGroupList = masterList.filter(s => s.objectName === "ItemGroup").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemCategoryList = masterList.filter(s => s.objectName === "ItemCategory").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.locationMasterList = masterList.filter(s => s.objectName === "Location").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id) || this.configService.loginUser.locationId.length === 0);
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   onItemSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItem = event.flatMap(r => r.id);
      } else {
         this.selectedItem = [];
      }
   }

   onItemBrandSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemBrand = event.flatMap(r => r.id);
      } else {
         this.selectedItemBrand = [];
      }
   }

   onItemDepartmentSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemDepartment = event.flatMap(r => r.id);
      } else {
         this.selectedItemDepartment = [];
      }
   }

   onItemGroupSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemGroup = event.flatMap(r => r.id);
      } else {
         this.selectedItemGroup = [];
      }
   }

   onItemCateogrySelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedItemCategory = event.flatMap(r => r.id);
      } else {
         this.selectedItemCategory = [];
      }
   }

   onLocationSelected(event: SearchDropdownList[]) {
      if (event) {
         this.selectedLocation = event.flatMap(r => r.id);
      } else {
         this.selectedLocation = [];
      }
   }

   async downloadReport() {
      try {
         await this.loadingService.showLoading();
            let reportParams: ReportParamsValueModel[] = [];
            reportParams.push({ rpName: "TrxDate", rpValue: [this.dateValue] });
            if (this.selectedLocation && this.selectedLocation.length > 0) {
               reportParams.push({ rpName: "LocationCode", rpValue: this.locationMasterList.filter(r => this.selectedLocation.includes(r.id)).flatMap(r => r.code) });
            }
            if (this.selectedItemBrand && this.selectedItemBrand.length > 0) {
               reportParams.push({ rpName: "ItemBrandCode", rpValue: this.itemBrandList.filter(r => this.selectedItemBrand.includes(r.id)).flatMap(r => r.code) });
            }
            if (this.selectedItemDepartment && this.selectedItemDepartment.length > 0) {
               reportParams.push({ rpName: "ItemDepartmentCode", rpValue: this.itemDepartmentList.filter(r => this.selectedItemDepartment.includes(r.id)).flatMap(r => r.code) });
            }
            if (this.selectedItemGroup && this.selectedItemGroup.length > 0) {
               reportParams.push({ rpName: "ItemGroupCode", rpValue: this.itemGroupList.filter(r => this.selectedItemGroup.includes(r.id)).flatMap(r => r.code) });
            }
            if (this.selectedItemCategory && this.selectedItemCategory.length > 0) {
               reportParams.push({ rpName: "ItemCategoryCode", rpValue: this.itemCategoryList.filter(r => this.selectedItemCategory.includes(r.id)).flatMap(r => r.code) });
            }
            if (this.selectedItem && this.selectedItem.length > 0) {
               reportParams.push({ rpName: "ItemId", rpValue: this.selectedItem });
            }
            await this.objectService.getInventoryLevel("IMR027", reportParams).subscribe(async response => {
               await this.commonService.commonDownloadPdf(response, "InventoryLevel.pdf");
               this.toastService.presentToast("", "Downloaded", "top", "success", 1000);
            }, async error => {
               console.log(error);
            })
      } catch (error) {
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");      
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
      this.setFormattedDateString();
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

}
