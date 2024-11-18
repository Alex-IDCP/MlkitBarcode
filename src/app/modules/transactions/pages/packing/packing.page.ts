import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MultiPackingList, MultiPackingRoot } from '../../models/packing';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { PackingService } from '../../services/packing.service';
import { ActionSheetController, AlertController, IonSearchbar, ModalController, NavController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { format } from 'date-fns';
import { FilterPage } from '../filter/filter.page';
import { NavigationExtras } from '@angular/router';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Network } from '@capacitor/network';

@Component({
   selector: 'app-packing',
   templateUrl: './packing.page.html',
   styleUrls: ['./packing.page.scss'],
})
export class PackingPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidLeave {

   objects: MultiPackingList[] = [];

   startDate: Date;
   endDate: Date;

   // uniqueGrouping: Date[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      private objectService: PackingService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private navController: NavController,
   ) {
   }

   async ionViewWillEnter(): Promise<void> {
		this.objects = [];
		this.filteredObj = [];
      try {
         if (!this.startDate) {
            this.startDate = this.commonService.getFirstDayOfTodayMonth();
         }
         if (!this.endDate) {
            this.endDate = this.commonService.getTodayDate();
         }
         await this.objectService.loadRequiredMaster();
         await this.loadLocalObjects();
      } catch (e) {
         console.error(e);
      }
   }

   async ionViewDidLeave(): Promise<void> {
      await this.objectService.stopListening();
   }

   ngOnInit() {

   }

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   /* #region  crud */

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListByDate(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
				let objects = response.filter(r => !this.objects.flatMap(rr => rr.multiPackingId).includes(r.multiPackingId))
				this.objects = [...this.objects, ...objects];
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
				await this.resetFilteredObj();
         }, async error => {
            console.error(error);
            await this.loadingService.dismissLoading();
         })
      } catch (error) {
         console.error(error);
         await this.loadingService.dismissLoading();
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region add goods packing */

   async addObject() {
      try {
         this.objectService.resetVariables();
         this.navController.navigateForward("/transactions/packing/packing-header");
      } catch (e) {
         console.error(e);
      }
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Packing",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Scan Packing Num.",
                  icon: "camera-outline",
                  handler: () => {
                     this.startScanning();
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #region scanner */

   @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;
   async startScanning() {
      const allowed = await this.checkPermission();
      if (allowed) {
         // this.scanActive = true;
         this.onCameraStatusChanged(true);
         const result = await BarcodeScanner.startScan();
         /*if (result.hasContent) {
            let barcode = result.content;
            // this.scanActive = false;
            this.onCameraStatusChanged(false);
            await this.searchbar.setFocus();
            this.itemSearchText = barcode;
            await this.search(barcode, true);
         }*/
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      try {
         this.scanActive = event;
         if (this.scanActive) {
            document.body.style.background = "transparent";
         }
      } catch (e) {
         console.error(e);
      }
   }

   async checkPermission() {
      return new Promise(async (resolve) => {
         const status = await BarcodeScanner.checkPermissions();
         if (status.camera === "granted") {
            resolve(true);
         } else if (status.camera === "denied") {
            const alert = await this.alertController.create({
               header: 'No permission',
               message: 'Please allow camera access in your setting',
               buttons: [
                  {
                     text: 'Open Settings',
                     handler: () => {
                        BarcodeScanner.openSettings();
                        resolve(false);
                     },
                  },
                  {
                     text: 'No',
                     role: 'cancel',
                  },
               ],
            });
            await alert.present();
         } else {
            resolve(false);
         }
      });
   }

   /* #endregion */

   /* #endregion */

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.startDate,
               endDate: this.endDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
				await this.loadLocalObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

	async loadLocalObjects() {
		try {
			let localObject = await this.configService.getLocalTransaction("MultiPacking");
			let d: MultiPackingList[] = [];
         if (localObject && localObject.length > 0) {
            localObject.forEach(r => {
               let dd: MultiPackingRoot = JSON.parse(r.jsonData);
               dd.header.isTrxLocal = true;
               dd.header.guid = r.id;
               dd.header.lastUpdated = r.lastUpdated;
               d.push({
                  multiPackingId: dd.header.multiPackingId,
                  multiPackingNum: dd.header.multiPackingNum,
                  trxDate: dd.header.trxDate,
                  locationCode: this.objectService.locationMasterList.find(rr => rr.id === dd.header.locationId)?.code,
                  locationDescription: this.objectService.locationMasterList.find(rr => rr.id === dd.header.locationId)?.description,
                  toLocationCode: this.objectService.locationMasterList.find(rr => rr.id === dd.header.toLocationId)?.code,
                  toLocationDescription: this.objectService.locationMasterList.find(rr => rr.id === dd.header.toLocationId)?.description,
                  warehouseAgentId: dd.header.warehouseAgentId,
                  warehouseAgentName: this.objectService.locationMasterList.find(rr => rr.id === dd.header.warehouseAgentId)?.description,
                  deactivated: dd.header.deactivated,
                  createdById: dd.header.createdById,

                  isTrxLocal: dd.header.isTrxLocal,
                  guid: dd.header.guid,
                  lastUpdated: dd.header.lastUpdated
               });
            })
            this.objects = [...this.objects, ...d];
         }
			await this.resetFilteredObj();
			if ((await Network.getStatus()).connected) {
				await this.loadObjects();
			}
		} catch (error) {
			console.error(error);
		} finally {

		}
	}

	goToDetail(objectId: number, isLocal: boolean = false, guid: string = null) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId,
               isLocal: isLocal,
               guid: guid
            }
         }
         this.navController.navigateForward("/transactions/packing/packing-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

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
   filteredObj: MultiPackingList[] = [];
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
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r =>
               r.multiPackingNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationDescription?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.toLocationDescription?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.warehouseAgentName?.toUpperCase().includes(searchText.toUpperCase())
            )));
				this.filteredObj.sort((x, y) => {
					if (x.isTrxLocal === y.isTrxLocal) {
						return x.trxDate < y.trxDate ? 0 : 1;
					} else {
						return (x.isTrxLocal === y.isTrxLocal) ? 0 : x.isTrxLocal ? -1 : 1;
					}
				});
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
      this.filteredObj = JSON.parse(JSON.stringify(this.objects));
      this.filteredObj = this.filteredObj.sort((a, b) => new Date(b.trxDate).getTime() - new Date(a.trxDate).getTime());
   }

}
