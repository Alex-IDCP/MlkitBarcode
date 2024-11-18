import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CheckQohRoot } from '../../../models/rp-check-qoh';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ItemPricing } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';

@Component({
   selector: 'app-rp-check-qoh',
   templateUrl: './rp-check-qoh.page.html',
   styleUrls: ['./rp-check-qoh.page.scss'],
})
export class RpCheckQohPage implements OnInit {

   Math: any;

   objects: CheckQohRoot[] = [];
   loginUser: any;
   columns: any;

   constructor(
      private objectService: ReportsService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService
   ) {
      this.Math = Math;
      this.loginUser = JSON.parse(localStorage.getItem("loginUser"));
   }

   ngOnInit() {
      this.loadModuleControl();
      this.columns = [
         { prop: "itemCode", name: "Stock Code", draggable: false },
         { prop: "itemDescription", name: "Description", draggable: false },
         { prop: "qoh", name: "QOH", draggable: false },
         { prop: "price", name: "Price", draggable: false }
      ]
   }
   
   moduleControl: ModuleControl[];
   configSystemWideActivateExtraDiscount: boolean = false;
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let systemWideActivateExtraDiscount = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateExtraDiscount")?.ctrlValue;
            if (systemWideActivateExtraDiscount && systemWideActivateExtraDiscount.toUpperCase() === "Y") {
               this.configSystemWideActivateExtraDiscount = true;
            } else {
               this.configSystemWideActivateExtraDiscount = false;
            }
         })
         this.authService.precisionList$.subscribe(precision => {
            if (precision) {
               this.precisionSales = precision.find(x => x.precisionCode === "SALES");
               if (this.precisionSales.localMin === null) this.precisionSales.localMin = 2;
               if (this.precisionSales.localMax === null) this.precisionSales.localMax = 2;
               if (this.precisionSales.localFormat === null) this.precisionSales.localFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;
               if (this.precisionSales.foreignMin === null) this.precisionSales.foreignMin = 2;
               if (this.precisionSales.foreignMax === null) this.precisionSales.foreignMax = 2;
               if (this.precisionSales.foreignFormat === null) this.precisionSales.foreignFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

	async onKeyDown(event, searchText) {
		if (event.keyCode === 13) {
			await this.search(searchText, true);
		}
	}

   itemSearchText: string;
   async search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.objects = [];
         this.realObject = [];
      }
      this.itemSearchText = searchText;
      try {
         await this.loadingService.showLoading();
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.objectService.getCheckQoh(searchText, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(async response => {
               this.objects = response;
               await this.massageData();
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 300, true);
            })
         } else {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   realObject: any[] = [];
   async massageData() {
      this.realObject = [];

      for await (const r of this.objects) {
         this.realObject.push({
            itemId: r.itemId,
            itemCode: r.itemCode,
            itemDescription: r.itemDescription,
            qoh: r.inventoryLevel.reduce((a, c) => a + (c.qty - c.openQty), 0),
            price: r.segmentPricing.flatMap(r => r.itemPricing)
         })
      }
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   hasInventoryLevel(row) {
      return (this.objects.find(r => r.itemId === row.itemId).inventoryLevel && this.objects.find(r => r.itemId === row.itemId).inventoryLevel.length > 0);
   }

   getInventoryLevel(row) {
      return this.objects.find(r => r.itemId === row.itemId).inventoryLevel;
   }

   getNettPrice(rowData: ItemPricing) {
      if (rowData) {
         return this.commonService.computeItemPriceListLineDiscAmount(rowData, this.configSystemWideActivateExtraDiscount);
      }
   }

}
