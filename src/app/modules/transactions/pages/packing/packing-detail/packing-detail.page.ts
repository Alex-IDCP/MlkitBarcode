import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MultiPackingCarton, MultiPackingRoot } from '../../../models/packing';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Capacitor } from '@capacitor/core';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
   selector: 'app-packing-detail',
   templateUrl: './packing-detail.page.html',
   styleUrls: ['./packing-detail.page.scss'],
})
export class PackingDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
	isLocal: boolean = false;
	guid: string = null;
   isMobile: boolean = true;

   constructor(
      public objectService: PackingService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private modalController: ModalController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) {}

   async ionViewWillEnter(): Promise<void> {
      this.route.queryParams.subscribe(async params => {
         this.objectId = params['objectId'];
			this.isLocal = params["isLocal"];
			this.guid = params["guid"];
			if (this.isLocal) {
				if (this.guid) {
					await this.loadLocalObject();
				} else {
					this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
				}
			} else {
				this.objectId = params["objectId"];
				if (this.objectId) {
					await this.loadObject();
				}
			}
      })
      await this.loadModuleControl();
      this.isMobile = Capacitor.getPlatform() !== "web";
   }

   ngOnInit() {

   }

   moduleControl: ModuleControl[] = [];
   configSystemWideActivateMultiUOM: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let activateMultiUom = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateMultiUOM")?.ctrlValue;
         if (activateMultiUom && activateMultiUom.toUpperCase() === "Y") {
            this.configSystemWideActivateMultiUOM = true;
         } else {
            this.configSystemWideActivateMultiUOM = false;
         }
      })
   }

   uniqueSalesOrder: string[] = [];
   loadObject() {
      this.uniqueSalesOrder = []
      try {
         this.objectService.getObjectById(this.objectId).subscribe(response => {
            let object = response as MultiPackingRoot;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            this.objectService.setPackingObject(object);
            this.objectService.setHeader(object.header);
            this.objectService.setMultiPackingObject({ outstandingPackList: object.outstandingPackList, packingCarton: object.details });
            if (object.outstandingPackList && object.outstandingPackList.length > 0) {
               this.uniqueSalesOrder = [...new Set(object.outstandingPackList.flatMap(r => r.salesOrderNum))];
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   async loadLocalObject() {
      this.uniqueSalesOrder = []
      try {
			let localObject = await this.configService.getLocalTransactionById("MultiPacking", this.guid);
			let object = JSON.parse(localObject.jsonData) as MultiPackingRoot;
			object.header.isTrxLocal = true;
			object.header.guid = localObject.id;
			object.header.lastUpdated = localObject.lastUpdated;
         // object.header = this.commonService.convertObjectAllDateType(object.header);
			if (this.isLocal) {
				await this.objectService.setLocalObject(JSON.parse(JSON.stringify(localObject)));
			}
         this.objectService.setPackingObject(object);
         this.objectService.setHeader(object.header);
         this.objectService.setMultiPackingObject({ outstandingPackList: object.outstandingPackList, packingCarton: object.details });
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
      let found = this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum);
      if (found && found.length > 0) {
         return found;
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
      this.navController.navigateRoot("/transactions/packing/packing-item");
   }
   
   showDetails(rowData: MultiPackingCarton) {
      this.objectService.object.details.filter(r => r.cartonBarcode !== rowData.cartonBarcode).flatMap(r => r.isSelected = false);
      rowData.isSelected = !rowData.isSelected;
   }

	async deleteLocal() {
		try {
			if (this.objectService.header.isTrxLocal) {
				const alert = await this.alertController.create({
					cssClass: "custom-alert",
					header: "Delete this Multi Packing?",
					message: "This action cannot be undone.",
					buttons: [
						{
							text: "Delete",
							cssClass: "danger",
							handler: async () => {
								if (this.objectService.localObject) {
									await this.configService.deleteLocalTransaction("MultiPacking", this.objectService.localObject);
									this.toastService.presentToast("", "Multi Packing deleted", "top", "success", 1000);
									await this.objectService.resetVariables();
									this.navController.navigateRoot("transactions/packing");
								} else {
									this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
								}
							}
						},
						{
							text: "Cancel",
							role: "cancel",
							cssClass: "cancel",
							handler: async () => {

							}
						}
					]
				});
				await alert.present();
			} else {
				this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
			}
		} catch (e) {
			console.error(e);
		}
	}

}
