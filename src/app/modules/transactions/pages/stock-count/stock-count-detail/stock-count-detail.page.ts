import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { StockCountService } from '../../../services/stock-count.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { v4 as uuidv4 } from 'uuid';
import { BinList } from '../../../models/transfer-bin';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Network } from '@capacitor/network';
import { ConfigService } from 'src/app/services/config/config.service';
import { StockCountDetail, StockCountRoot } from '../../../models/stock-count';
import { TransactionCode } from '../../../models/transaction-type-constant';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-stock-count-detail',
   templateUrl: './stock-count-detail.page.html',
   styleUrls: ['./stock-count-detail.page.scss'],
})
export class StockCountDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   isLocal: boolean = false;
	guid: string = null;
   currentPage: number = 1;
   itemsPerPage: number = 20;
   binList: BinList[] = [];

   constructor(
      public objectService: StockCountService,
      private commonService: CommonService,
		private toastService: ToastService,
      private loadingService: LoadingService,
		private configService: ConfigService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
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
         } 
         else {
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
         this.objectService.getInventoryCount(this.objectId).subscribe(async response => {
            let object = response;
            if (object && object.header.locationId) {
               this.objectService.getBinListByLocationId(object.header.locationId).subscribe({
                  next: (response) => {
                     this.binList = response;
                  },
                  error: (error) => {
                     console.log(error);
                  }
               })
            }
            object.header = this.commonService.convertObjectAllDateType(object.header);
            object.details.forEach(r => {
               let found = object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
               if (found) {
                  r.itemCode = found.itemCode;
                  r.itemDescription = found.description;
                  r.itemVariationXDescription = found.itemVariationLineXDescription;
                  r.itemVariationYDescription = found.itemVariationLineYDescription;
                  r.variationTypeCode = found.variationTypeCode;
                  r.itemUomId = found.itemUomId;
                  r.guid = uuidv4();
               }
            })
            await this.objectService.setHeader(object.header);
            await this.objectService.setLines(object.details);
            await this.loadingService.dismissLoading();
            await this.resetFilteredObj();
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

   async loadLocalObject() {
      try {
         await this.loadingService.showLoading();
         let localObject = await this.configService.getLocalTransactionById(TransactionCode.inventoryCountTrx, this.guid);
         let object = JSON.parse(localObject.jsonData) as StockCountRoot;
         object.header.isLocal = true;
         object.header.guid = localObject.id;
         object.header.lastUpdated = localObject.lastUpdated;
         object.details.forEach(r => {
            if (r.itemVariationXId) {
               r.itemVariationXDescription = this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description;
            }
            if (r.itemVariationYId) {
               r.itemVariationYDescription = this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description;
            }
            r.guid = uuidv4();
         })
         if (this.isLocal) {
            await this.objectService.setLocalObject(JSON.parse(JSON.stringify(localObject)));
         }
         await this.objectService.setHeader(JSON.parse(JSON.stringify(object.header)));
         await this.objectService.setLines(JSON.parse(JSON.stringify(object.details)));
         await this.loadingService.dismissLoading();
         await this.resetFilteredObj();
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   edit() {
      this.navController.navigateRoot("/transactions/stock-count/stock-count-crud/stock-count-header");
   }

   identify(index, line) {
      return line.guid;
   }

   previousStep() {
      this.objectService.resetVariables();
      this.navController.navigateBack("/transactions/stock-count");
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
         if (this.objectService.objectHeader.isLocal) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this Stock Count?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete",
                     cssClass: "danger",
                     handler: async () => {
                        if (this.objectService.localObject) {
                           await this.configService.deleteLocalTransaction(TransactionCode.inventoryCountTrx, this.objectService.localObject);
                           this.toastService.presentToast("", "Stock Count deleted", "top", "success", 1000);
                           await this.objectService.resetVariables();
                           this.navController.navigateRoot("transactions/stock-count");
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
	filteredObj: StockCountDetail[] = [];
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
				this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(r => 
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase())
               || r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase())
               || r.itemDescription?.toUpperCase().includes(searchText.toUpperCase())
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
		this.filteredObj = JSON.parse(JSON.stringify(this.objectService.objectDetail));
	}

   /* #endregion */

}
