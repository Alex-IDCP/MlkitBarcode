import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { IonPopover, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MultiPickingRoot } from '../../../models/picking';
import { CommonService } from 'src/app/shared/services/common.service';
import { Capacitor } from '@capacitor/core';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
   selector: 'app-picking-detail',
   templateUrl: './picking-detail.page.html',
   styleUrls: ['./picking-detail.page.scss'],
})
export class PickingDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   isMobile: boolean = true;

   constructor(
      public objectService: PickingService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private modalController: ModalController,
      private route: ActivatedRoute,
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params['objectId'];
         if (!this.objectId) {
            this.navController.navigateBack('/transactions/picking');
         }
      })
   }

   ionViewWillEnter(): void {
      this.isMobile = Capacitor.getPlatform() !== "web";
      if (!this.objectId) {
         this.navController.navigateBack('/transactions/picking')
      } else {
         this.loadDetail();
      }
   }

   ngOnInit() {

   }

   uniqueSalesOrder: string[] = [];
   loadDetail() {
      this.uniqueSalesOrder = []
      try {
         this.objectService.getObjectById(this.objectId).subscribe(response => {
            let object = response as MultiPickingRoot;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            this.objectService.setPickingObject(object);
            this.objectService.setHeader(object.header)
            this.objectService.setMultiPickingObject({ outstandingPickList: object.outstandingPickList, pickingCarton: object.details });
            if (object.outstandingPickList && object.outstandingPickList.length > 0) {
               this.uniqueSalesOrder = [...new Set(object.outstandingPickList.flatMap(r => r.salesOrderNum))];
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
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

   /* #region find outstanding item in this SO */

   getItemOfSO(salesOrderNum: string) {
      let find = this.objectService.object.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum);
      if (find && find.length > 0) {
         return find;
      }
      return null;
   }

   lookupItemInfo(itemId: number, lookupInfoType: string) {
      if (lookupInfoType == "CODE" && Capacitor.getPlatform() !== "web") {
         let findItem = this.configService.item_Masters.find(x => x.id == itemId);
         if (findItem) {
            return findItem.code;
         } else {
            return null;
         }
      } else {
         return null;
      }
   }

   /* #endregion */

   editObject() {
      this.navController.navigateRoot('/transactions/picking/picking-item');
   }

}
