import { Component, OnInit, ViewChild } from '@angular/core';
import { ConsignmentCountEntryService } from '../../../services/consignment-count-entry.service';
import { ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { ViewWillEnter, NavController, AlertController, IonPopover } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Keyboard } from '@capacitor/keyboard';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { TransactionCode } from '../../../models/transaction-type-constant';
import { ConsignmentCountEntryRoot } from '../../../models/consignment-count-entry';

@Component({
   selector: 'app-consignment-count-entry-detail',
   templateUrl: './consignment-count-entry-detail.page.html',
   styleUrls: ['./consignment-count-entry-detail.page.scss'],
})
export class ConsignmentCountEntryDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   isLocal: boolean = false;
   guid: string = null;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      public objectService: ConsignmentCountEntryService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private route: ActivatedRoute,
      private navController: NavController,
      private alertController: AlertController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if ((await Network.getStatus()).connected) {
         await this.objectService.loadRequiredMaster();
      }
		this.route.queryParams.subscribe(async params => {
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
   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object.details.forEach(r => {
               r.guid = uuidv4();
            })
            this.objectService.setObject(object);
            await this.resetFilteredObj();
         }, async error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

	async loadLocalObject() {
		try {
			await this.loadingService.showLoading();
			let localObject = await this.configService.getLocalTransactionById(TransactionCode.consignmentCountEntryTrx, this.guid);
			let object = JSON.parse(localObject.jsonData) as ConsignmentCountEntryRoot;
			object.header.isLocal = true;
			object.header.guid = localObject.id;
			object.header.lastUpdated = localObject.lastUpdated;
			object.details.forEach(r => {
				if (r.itemVariationXId) {
					r.itemVariationXDesc = this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description;
				}
				if (r.itemVariationYId) {
					r.itemVariationYDesc = this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description;
				}
            r.guid = uuidv4();
			})
			if (this.isLocal) {
				await this.objectService.setLocalObject(JSON.parse(JSON.stringify(localObject)));
			}
			await this.objectService.setObject(JSON.parse(JSON.stringify(object)));
         await this.resetFilteredObj();
		} catch (e) {
			console.error(e);
		} finally {
			await this.loadingService.dismissLoading();
		}
	}

   edit() {
      this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-header");
   }

   previousStep() {
      this.objectService.resetVariables();
      this.navController.navigateBack("/transactions/consignment-count-entry");
   }

   identify(index, line) {
      return line.guid;
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

	async deleteLocal() {
		try {
			if (this.objectService.object?.header?.isLocal) {
				const alert = await this.alertController.create({
					cssClass: "custom-alert",
					header: "Delete this Consignment Count Entry?",
					message: "This action cannot be undone.",
					buttons: [
						{
							text: "Delete",
							cssClass: "danger",
							handler: async () => {
								if (this.objectService.localObject) {
									await this.configService.deleteLocalTransaction(TransactionCode.consignmentCountEntryTrx, this.objectService.localObject);
									this.toastService.presentToast("", "Consignment Count Entry deleted", "top", "success", 1000);
									await this.objectService.resetVariables();
									this.navController.navigateRoot("transactions/consignment-count");
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

   /* #region line search bar */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: TransactionDetail[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object.details.filter(r =>
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase())
               || r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase())
            )));
            this.currentPage = 1;
         } else {
            this.resetFilteredObj();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object.details));
   }

   /* #endregion */

   filter(details: InnerVariationDetail[]) {
      try {
         return details.filter(r => r.qtyRequest > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region show variaton dialog */

   selectedItem: TransactionDetail;
   showDetails(item: TransactionDetail) {
      this.filteredObj.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
   }

   /* #endregion */

}
