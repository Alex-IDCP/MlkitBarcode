import { Component, OnInit, ViewChild, ElementRef, OnDestroy, NgZone, Input, AfterViewInit } from '@angular/core';
import { IonAccordionGroup, IonPopover, ViewWillEnter, InputCustomEvent } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { InventoryLevelService } from '../../services/inventory-level.service';
import { InventoryLevelRoot, InventoryLevelVariationRoot, ItemPriceBySegment } from '../../models/inventory-level';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import {
   Barcode,
   BarcodeFormat,
   BarcodeScanner,
   LensFacing,
   StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
   selector: 'app-inventory-level-retail',
   templateUrl: './inventory-level-retail.page.html',
   styleUrls: ['./inventory-level-retail.page.scss'],
})
export class InventoryLevelRetailPage implements OnInit, ViewWillEnter, AfterViewInit, OnDestroy {

   @ViewChild("accordionGroup", { static: false }) accordionGroup: IonAccordionGroup;

   itemList: ItemList[] = [];
   itemInfo: ItemList;

   itemCode: string = "";
   selectedViewOptions: string = "item";
   selectedItem: TransactionDetail;

   object: InventoryLevelRoot;
   variationObject: InventoryLevelVariationRoot;

   @Input()
   public formats: BarcodeFormat[] = [];
   @Input()
   public lensFacing: LensFacing = LensFacing.Back;

   @ViewChild('square')
   public squareElement: ElementRef<HTMLDivElement> | undefined;

   public isTorchAvailable = false;
   public minZoomRatio: number | undefined;
   public maxZoomRatio: number | undefined;

   constructor(
      public objectService: InventoryLevelService,
      private authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private readonly ngZone: NgZone,
   ) { }


   public ngAfterViewInit(): void {
      setTimeout(() => {
         BarcodeScanner.startScan();
      }, 500);
   }

   public ngOnDestroy(): void {
      BarcodeScanner.stopScan();
   }

   public setZoomRatio(event: InputCustomEvent): void {
      if (!event.detail.value) {
         return;
      }
      BarcodeScanner.setZoomRatio({
         zoomRatio: parseInt(event.detail.value as any, 10),
      });
   }

   public async toggleTorch(): Promise<void> {
      await BarcodeScanner.toggleTorch();
   }

   async ionViewWillEnter(): Promise<void> {
      await this.loadModuleControl();
      await this.objectService.loadRequiredMaster();
      await this.loadItemList();
   }
   
   public ngOnInit(): void {
      BarcodeScanner.isTorchAvailable().then((result) => {
         this.isTorchAvailable = result.available;
      });
   }

   moduleControl: ModuleControl[] = [];
   inventoryLevelLocationList: string[] = [];
   configMobileScanItemContinuous: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let inventoryLevelLocationList = this.moduleControl.find(x => x.ctrlName === "InventoryLevelLocationList")?.ctrlValue;
            this.inventoryLevelLocationList = inventoryLevelLocationList === "ALL" ? [] : inventoryLevelLocationList.split(",");

            let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
            if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
               this.configMobileScanItemContinuous = true;
            } else {
               this.configMobileScanItemContinuous = false;
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   itemSearchDropdownList: SearchDropdownList[] = [];
   async loadItemList() {
      try {
         await this.loadingService.showLoading("Loading", false);
         this.objectService.getItemList().subscribe(async response => {
            this.itemList = response;
            for await (const r of this.itemList) {
               this.itemSearchDropdownList.push({
                  id: r.itemId,
                  code: r.itemCode,
                  description: r.description
               })
            }
            await this.loadingService.dismissLoading();
         }, async error => {
            console.error(error);
            await this.loadingService.dismissLoading();
         })
      } catch (e) {
         console.error(e);
         await this.loadingService.dismissLoading();
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   onLocationChanged(event: SearchDropdownList) {
      if (event) {
         this.selectedLocationId = event.id;
         this.selectedLocation = event.code;
      } else {
         this.selectedLocationId = null;
         this.selectedLocation = null;
      }
      this.advancedFilter();
   }

   onItemChanged(event) {
      if (event) {
         this.itemCode = event.code;
         this.validateItemCode();
      } else {
         this.itemCode = null;
         this.selectedItem = null;
         this.validateItemCode();
      }
   }

   validateItemCode() {
      try {
         if (this.itemCode && this.itemCode.length > 0) {
            let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
            if (lookUpItem) {
               this.itemInfo = lookUpItem;
               if (this.itemInfo.variationTypeCode === "0") {
                  this.selectedViewOptions = "item";
               }
               this.search();
            } else {
               this.itemCode = null;
               this.itemInfo = null;
               this.toastService.presentToast("", "Invalid Item Code", "top", "danger", 1000);
            }
         } else {
            this.itemCode = null;
            this.itemInfo = null;
            this.object = null;
            this.variationObject = null;
            this.prices = [];
         }
      } catch (e) {
         console.error(e);
      }
   }

   search() {
      try {
         if (!this.itemCode) {
            this.toastService.presentToast("", "Item not selected", "top", "danger", 1000);
            return;
         }
         let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
         if (lookUpItem) {
            this.itemInfo = lookUpItem;
            this.hideEmpty = false;
            this.objectService.getInventoryLevelByItem(this.itemInfo.itemId, this.configService.loginUser.loginUserType, this.configService.loginUser.salesAgentId).subscribe(async response => {
               this.object = response;
               await this.computeLocationList();
            }, error => {
               console.log(error);
            })
            if (lookUpItem.variationTypeCode !== "0") {
               this.objectService.getInventoryLevelByVariation(this.itemInfo.itemId, this.configService.loginUser.loginUserType, this.configService.loginUser.salesAgentId).subscribe(async response => {
                  this.variationObject = response;
                  await this.computeLocationList();
                  await this.computeVariationXY();
               }, error => {
                  console.log(error);
               })
            }
         } else {
            this.toastService.presentToast("", "Invalid Item Code", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   locationSearchDropdownList: SearchDropdownList[] = [];
   selectedLocationId: number;
   locationMasterList: any[] = [{ label: "All", value: "all" }];
   selectedLocation: string = "all";
   computeLocationList() {
      try {
         this.locationMasterList = [{ label: "All", value: "all" }];
         this.locationSearchDropdownList = [];
         this.selectedLocation = "all";
         if (this.selectedViewOptions === "item") {
            this.object?.itemInfo.forEach(r => {
               if (this.objectService.locationMasterList.filter(rr => rr.attribute11 === "1").findIndex(rr => rr.code.toUpperCase() === r.locationCode) > -1) {
                  this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
                  this.locationSearchDropdownList.push({
                     id: r.locationId,
                     code: r.locationCode,
                     description: r.locationDescription
                  })
               }
            })
         } else {
            this.variationObject?.itemInfo.forEach(r => {
               if (this.objectService.locationMasterList.filter(rr => rr.attribute11 === "1").findIndex(rr => rr.code.toUpperCase() === r.locationCode) > -1) {
                  this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
                  this.locationSearchDropdownList.push({
                     id: r.locationId,
                     code: r.locationCode,
                     description: r.locationDescription
                  })
               }
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   itemVariationX: any[] = [{ label: "All", value: "all" }];
   selectedVariationX: string = "all";
   itemVariationY: any[] = [{ label: "All", value: "all" }];
   selectedVariationY: string = "all";
   computeVariationXY() {
      try {
         this.itemVariationX = [{ label: "All", value: "all" }];
         this.selectedVariationX = "all";
         this.itemVariationY = [{ label: "All", value: "all" }];
         this.selectedVariationY = "all";
         if (this.variationObject.itemInfo.length > 0) {
            let variationX = this.variationObject.itemInfo[0]?.itemVariationXDescription;
            let variationY = this.variationObject.itemInfo[0]?.itemVariationYDescription;
            if (variationX.length > 0) {
               variationX.forEach(x => {
                  if (x !== null) {
                     this.itemVariationX.push({ label: x, value: x });
                  }
               })
            }
            if (variationY.length > 0) {
               variationY.forEach(y => {
                  if (y !== null) {
                     this.itemVariationY.push({ label: y, value: y });
                  }
               })
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   hideEmpty: boolean = true;
   advancedFilter() {
      try {
         if (this.selectedViewOptions === "item") {
            this.objectService.getInventoryLevelByItem(this.itemInfo.itemId, this.configService.loginUser.loginUserType, this.configService.loginUser.salesAgentId ?? 0).subscribe(response => {
               this.object = response;
               if (this.selectedLocation) {
                  this.object.itemInfo = this.object.itemInfo.filter(r => r.locationCode === this.selectedLocation);
               }
               if (this.hideEmpty) {
                  this.object.itemInfo = this.object.itemInfo.filter(r => r.qty !== 0);
               }
            }, error => {
               console.log(error);
            })
         }
         else {
            this.objectService.getInventoryLevelByVariation(this.itemInfo.itemId, this.configService.loginUser.loginUserType, this.configService.loginUser.salesAgentId ?? 0).subscribe(response => {
               this.variationObject = response;
               // location filter
               if (this.selectedLocation) {
                  this.variationObject.itemInfo = this.variationObject.itemInfo.filter(r => r.locationCode === this.selectedLocation);
               }
               // show 0 filter
               if (this.hideEmpty) {
                  let locationIds = [];
                  let temp = this.variationObject.itemInfo;
                  for (let index = 0; index < this.variationObject.itemInfo.length; index++) {
                     let total = 0;
                     this.variationObject.itemInfo[index].variation.variationDetails.forEach(rr => {
                        rr.variationDetails.forEach(rrr => {
                           total += rrr.qty
                        })
                     })
                     if (total === 0) {
                        locationIds.push(this.variationObject.itemInfo[index].locationId);
                     }
                  }
                  locationIds.forEach(r => {
                     temp.splice(temp.findIndex(rr => rr.locationId === r), 1);
                  })
                  this.variationObject.itemInfo = [...temp];
               }
               // variation x, y filter
               if (this.selectedVariationX !== "all" || this.selectedVariationY !== "all") {
                  let temp = this.variationObject.itemInfo;
                  let itemVariationXIds = [];
                  let itemVariationYIds = [];
                  for (let r = 0; r < temp.length; r++) {
                     let variations = temp[r].variation.variationDetails;
                     for (let rr = 0; rr < variations.length; rr++) {
                        if (variations[rr].itemVariationXDescription === this.selectedVariationX) {
                           itemVariationXIds.push(variations[rr].itemVariationXId);
                        } else {
                           for (let rrr = 0; rrr < variations[rr].variationDetails.length; rrr++) {
                              if (this.selectedVariationY !== "all") {
                                 if (variations[rr].variationDetails[rrr].itemVariationYDescription === this.selectedVariationY) {
                                    itemVariationYIds.push(variations[rr].variationDetails[rrr].itemVariationYId);
                                 }
                              }
                           }
                        }
                     }
                  }
                  temp.forEach(r => {
                     let tempVariation = r.variation.variationDetails;
                     itemVariationXIds.forEach(r => {
                        tempVariation = tempVariation.filter(rr => rr.itemVariationXId === r);
                     })
                     r.variation.variationDetails = [...tempVariation];
                  })
                  temp.forEach(r => {
                     let tempVariation = r.variation.variationDetails;
                     itemVariationYIds.forEach(r => {
                        tempVariation.forEach(rr => {
                           rr.variationDetails = rr.variationDetails.filter(rrr => rrr.itemVariationYId === r);
                        })
                     })
                     r.variation.variationDetails = [...tempVariation];
                  })
                  this.variationObject.itemInfo = [...temp];
               }
               // this.toastService.presentToast("Search result has been populated.", "", "top", "success", 1000);
            }, error => {
               console.error(error);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region item price */

   prices: ItemPriceBySegment[] = [];
   getItemPrice(itemId: number) {
      if (itemId) {
         this.prices = [];
         try {
            this.objectService.getSegmentItemPriceBySalesAgent(this.itemInfo.itemId, this.configService.loginUser.loginUserType, this.configService.loginUser.salesAgentId ?? 0).subscribe(response => {
               this.prices = response;
            }, error => {
               console.error(error);
            })
         } catch (e) {
            console.error(e);
         }
      } else {
         this.toastService.presentToast("Invalid Item", "Please select Item.", "top", "warning", 1000);
      }
   }

   /* #endregion */

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

   priceModal: boolean = false;
   async showPriceDialog() {
      try {
         if (this.itemInfo !== undefined) {
            await this.getItemPrice(this.itemInfo.itemId);
            this.priceModal = true;
         } else {
            this.toastService.presentToast("", "Item not selected", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   hidePriceDialog() {
      this.priceModal = false;
   }

   /* #region  barcode scanner */

   scanActive: boolean = false;
   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(barcode: any) {
      if (barcode) {
         await this.barcodescaninput.validateBarcode(barcode);
         // if (this.configMobileScanItemContinuous) {
         //    await this.barcodescaninput.startScanning();
         // }
      }
   }

   /*private async startScan(): Promise<void> {
      // Hide everything behind the modal (see `src/theme/variables.scss`)
      document.querySelector('body')?.classList.add('barcode-scanning-active');
  
      const options: StartScanOptions = {
        formats: this.formats,
        lensFacing: this.lensFacing,
      };
  
      const squareElementBoundingClientRect =
        this.squareElement?.nativeElement.getBoundingClientRect();
      const scaledRect = squareElementBoundingClientRect
        ? {
            left: squareElementBoundingClientRect.left * window.devicePixelRatio,
            right:
              squareElementBoundingClientRect.right * window.devicePixelRatio,
            top: squareElementBoundingClientRect.top * window.devicePixelRatio,
            bottom:
              squareElementBoundingClientRect.bottom * window.devicePixelRatio,
            width:
              squareElementBoundingClientRect.width * window.devicePixelRatio,
            height:
              squareElementBoundingClientRect.height * window.devicePixelRatio,
          }
        : undefined;
      const detectionCornerPoints = scaledRect
        ? [
            [scaledRect.left, scaledRect.top],
            [scaledRect.left + scaledRect.width, scaledRect.top],
            [
              scaledRect.left + scaledRect.width,
              scaledRect.top + scaledRect.height,
            ],
            [scaledRect.left, scaledRect.top + scaledRect.height],
          ]
        : undefined;
      const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async (event) => {
          this.ngZone.run(() => {
            const cornerPoints = event.barcode.cornerPoints;
            if (detectionCornerPoints && cornerPoints) {
              if (
                detectionCornerPoints[0][0] > cornerPoints[0][0] ||
                detectionCornerPoints[0][1] > cornerPoints[0][1] ||
                detectionCornerPoints[1][0] < cornerPoints[1][0] ||
                detectionCornerPoints[1][1] > cornerPoints[1][1] ||
                detectionCornerPoints[2][0] < cornerPoints[2][0] ||
                detectionCornerPoints[2][1] < cornerPoints[2][1] ||
                detectionCornerPoints[3][0] > cornerPoints[3][0] ||
                detectionCornerPoints[3][1] < cornerPoints[3][1]
              ) {
                return;
              }
            }
            listener.remove();
          });
        },
      );
      await BarcodeScanner.startScan(options);
      void BarcodeScanner.getMinZoomRatio().then((result) => {
        this.minZoomRatio = result.zoomRatio;
      });
      void BarcodeScanner.getMaxZoomRatio().then((result) => {
        this.maxZoomRatio = result.zoomRatio;
      });
    }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }*/

   async onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         this.itemCode = event[0].itemCode;
         this.selectedItem = event[0];
         if (this.selectedItem.variationTypeCode === "1" || this.selectedItem.variationTypeCode === "2") {
            this.selectedViewOptions = "variation";
         }
         await this.validateItemCode();
         await this.barcodescaninput.setFocus();
      } else {
         this.itemCode = null;
         this.selectedItem = null;
         this.validateItemCode();
         await this.barcodescaninput.setFocus();
      }
   }

   /* #endregion */

}
