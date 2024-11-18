import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportsService } from '../../../services/reports.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { IonAccordionGroup, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CheckQohVariationRequest, CheckQohVariationRoot } from '../../../models/rp-check-qoh';
import { format, parseISO } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
   selector: 'app-rp-check-qoh-variation',
   templateUrl: './rp-check-qoh-variation.page.html',
   styleUrls: ['./rp-check-qoh-variation.page.scss'],
})
export class RpCheckQohVariationPage implements OnInit, ViewWillEnter {

   Math: any;

   objects: CheckQohVariationRoot[] = [];
   columns: any;

   itemList: MasterListDetails[] = [];
   itemBrandMasterList: MasterListDetails[] = [];
   itemCategoryMasterList: MasterListDetails[] = [];
   itemDepartmentMasterList: MasterListDetails[] = [];
   itemGroupMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];

   request: CheckQohVariationRequest = {};

   @ViewChild("accordionGroup", { static: true }) accordionGroup: IonAccordionGroup;

   constructor(
      private objectService: ReportsService,
      private authService: AuthService,
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
      this.columns = [
         { prop: "itemCode", name: "Stock Code", draggable: false },
         { prop: "itemDescription", name: "Description", draggable: false },
         { prop: "qoh", name: "QOH", draggable: false },
         { prop: "price", name: "Price", draggable: false }
      ]
   }

   loadMasterList() {
      this.objectService.getMasterList().subscribe({
         next: (response) => {
            let masterList = response;
            this.itemList = masterList.filter(s => s.objectName === "Item").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemBrandMasterList = masterList.filter(s => s.objectName === "ItemBrand").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemCategoryMasterList = masterList.filter(s => s.objectName === "ItemCategory").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemDepartmentMasterList = masterList.filter(s => s.objectName === "ItemDepartment").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.itemGroupMasterList = masterList.filter(s => s.objectName === "ItemGroup").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.locationMasterList = masterList.filter(s => s.objectName === "Location").flatMap(s => s.details).filter(s => s.deactivated === 0);
            this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id) || this.configService.loginUser.locationId.length === 0);
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   loadReport() {
      setTimeout(async () => {
         try {
            this.accordionGroup.value = null;
            if (this.request.dateStart === null || this.request.dateStart === undefined) {
               this.toastService.presentToast("Control Error", "Please select a date.", "top", "warning", 1000);
               return;
            }
            await this.loadingService.showLoading();
            this.objects = await this.objectService.getCheckQohVariation(this.configService.loginUser.loginUserType, this.request);
         } catch (error) {
            console.error(error);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }, 0);
   }

   onLocationSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.locationId = event.flatMap(r => r.id);
         } else {
            this.request = {
               locationId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.locationId = []
         } else {
            this.request = {
               locationId: []
            }
         }
      }
   }

   onItemSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.itemId = event.flatMap(r => r.id);
         } else {
            this.request = {
               itemId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.itemId = []
         } else {
            this.request = {
               itemId: []
            }
         }
      }
   }

   onItemBrandSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.brandId = event.flatMap(r => r.id);
         } else {
            this.request = {
               brandId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.brandId = []
         } else {
            this.request = {
               brandId: []
            }
         }
      }
   }

   onItemDepartmentSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.departmentId = event.flatMap(r => r.id);
         } else {
            this.request = {
               departmentId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.departmentId = []
         } else {
            this.request = {
               departmentId: []
            }
         }
      }
   }

   onItemGroupSelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.groupId = event.flatMap(r => r.id);
         } else {
            this.request = {
               groupId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.groupId = []
         } else {
            this.request = {
               groupId: []
            }
         }
      }
   }

   onItemCategorySelected(event: SearchDropdownList[]) {
      if (event) {
         if (this.request) {
            this.request.categoryId = event.flatMap(r => r.id);
         } else {
            this.request = {
               categoryId: event.flatMap(r => r.id),
            }
         }
      } else {
         if (this.request) {
            this.request.categoryId = []
         } else {
            this.request = {
               categoryId: []
            }
         }
      }
   }

   @ViewChild("myTable") table: any;
   groupExpansionDefaultStatus: boolean = true;
   toggleExpandGroup(group) {
      this.groupExpansionDefaultStatus = false;
      this.table.groupHeader.toggleExpandGroup(group);
   }

   onDetailToggle(event) {

   }


   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
      if (this.request) {
         this.request.dateStart = format(new Date(this.dateValue), "yyyy-MM-dd")
      } else {
         this.request = {
            dateStart: null
         }
      }
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
