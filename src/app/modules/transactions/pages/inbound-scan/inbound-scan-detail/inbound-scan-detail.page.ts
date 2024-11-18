import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { InboundScanService } from '../../../services/inbound-scan.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
   selector: 'app-inbound-scan-detail',
   templateUrl: './inbound-scan-detail.page.html',
   styleUrls: ['./inbound-scan-detail.page.scss'],
})
export class InboundScanDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

   _configService: any;
   objectId: number;
   showOutstanding: boolean = true;

   constructor(
      public objectService: InboundScanService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private modalController: ModalController,
      private route: ActivatedRoute,
   ) { 
      this._configService = configService;
   }

   ionViewWillEnter(): void {
      try {         
         this.route.queryParams.subscribe(async params => {
            this.objectId = params["objectId"];
            if (this.objectId && this.objectId > 0) {
               await this.loadObject();
            } else {
               this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "warning", 1000);
               this.navController.navigateBack("/transactions/inbound-scan");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }
   
   ionViewDidEnter(): void {
      
   }

   ngOnInit() {
   }

   uniqueOutstandingDocNum: any[] = [];
   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            await this.objectService.setObject(object);
            await this.objectService.setHeader(object.header);
            this.objectService.multiInboundObject = { outstandingInboundList: object.outstandingInboundList, inboundCarton: object.details };
            if (this.objectService.object.outstandingInboundList && this.objectService.object.outstandingInboundList.length > 0) {
               if (this.objectService.object.header.groupType === "D") {
                  this.uniqueOutstandingDocNum = [...new Set(this.objectService.object.outstandingInboundList.flatMap(r => r.inboundDocNum))];
               } else {
                  this.uniqueOutstandingDocNum = [...new Set(this.objectService.object.outstandingInboundList.flatMap(r => r.itemId))];
               }
            }
            this.objectService.customerLocationMasterList = this.getCustomerLocationList(object.header.customerId);
            await this.loadingService.dismissLoading();
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {         
         await this.loadingService.dismissLoading();
      }
   }

   getCustomerLocationList(customerId: number) {
      let customerLocationList: MasterListDetails[] = [];
      var lookupValue = this.objectService.customerMasterList?.find(e => e.id == customerId);
      if (lookupValue != undefined) {
         if (lookupValue.attributeArray1.length > 0) {
            customerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
         }
      }
      return customerLocationList;
   }

   getDocRowData(rowData: any, groupType: string) {      
      if (this.objectService.object && this.objectService.object.outstandingInboundList && this.objectService.object.outstandingInboundList.length > 0) {
         if (groupType === "D") {
            return this.objectService.object.outstandingInboundList.filter(r => r.inboundDocNum === rowData);
         }
         if (groupType === "I") {
            return this.objectService.object.outstandingInboundList.filter(r => r.itemId === rowData);
         }
      }
      return null;
   }

   getInboundDocNum(rowData: number) {
      if (this.objectService.object && this.objectService.object.outstandingInboundList && this.objectService.object.outstandingInboundList.length > 0) {
         return [...new Set(this.objectService.object.outstandingInboundList.filter(r => r.itemId === rowData).flatMap(r => r.inboundDocNum))].join(", ");
      }
      return null;
   }

   getAllInboundList() {
      if (this.objectService.object && this.objectService.object.details && this.objectService.object.details.length > 0) {
         return this.objectService.object.details.flatMap(r => r.inboundList);
      }      
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   previousStep() {
      this.objectService.resetVariables();
   }

   editObject() {
      this.navController.navigateRoot("/transactions/inbound-scan/inbound-scan-item");
   }

}
