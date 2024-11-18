import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonSegment, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { SalesOrderHeaderForWD, SalesOrderLineForWD } from 'src/app/modules/transactions/models/picking';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { Keyboard } from '@capacitor/keyboard';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { ConfigService } from 'src/app/services/config/config.service';
import { Capacitor } from '@capacitor/core';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { v4 as uuidv4 } from 'uuid';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-picking-header',
   templateUrl: './picking-header.page.html',
   styleUrls: ['./picking-header.page.scss']
})
export class PickingHeaderPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;
   warehouseAgentId: number
   isMobile: boolean = true;
   isButtonVisible: boolean = true;
   isByLocation: boolean = false;
   customerDisabled: boolean = false;

   constructor(
      public objectService: PickingService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder,
   ) {
      this.newObjectForm();
   }

   ionViewWillEnter(): void {
      this.isMobile = Capacitor.getPlatform() !== "web";
      if (this.objectService.header && this.objectService.header.multiPickingId > 0) {
         this.isWithType = this.objectService.header?.isWithSo ? (this.objectService.header?.copyFrom === "S" ? "SO" : "B2B") : "NONE";
         this.objectForm.patchValue(this.objectService.object.header);
         this.patchInfo();
         this.loadExisitingSO(this.objectService.object.outstandingPickList.flatMap(r => r.salesOrderNum));
      } else {
         this.setDefaultValue();
      }
   }

   ngOnDestroy(): void {
      Keyboard.removeAllListeners();
   }

   @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
   ionViewDidEnter(): void {
      try {
         if (this.isWithType === "SO" || this.isWithType === "B2B") {
            this.barcodeInput?.nativeElement.focus();
         }
      } catch (e) {
         console.error(e);
      }
   }

   showKeyboard(event) {
      event.preventDefault();
      this.barcodeInput.nativeElement.focus();
      setTimeout(async () => {
         await Keyboard.show();
      }, 100);
   }

   ngOnInit() {
      this.warehouseAgentId = this.configService.loginUser.warehouseAgentId;
      if (this.warehouseAgentId === null || this.warehouseAgentId === undefined) {
         this.toastService.presentToast("System Error", "Warehouse Agent not set.", "top", "danger", 1000);
         this.navController.navigateRoot("/transactions/picking");
      }
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[];
   configSOSelectionEnforceSameOrigin: boolean = true;
   configSOSelectionEnforceSameDestination: boolean = true;
   configSystemWideCustomerLocationSelection: string = "C";
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let config = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameOrigin");
         if (config != undefined) {
            if (config.ctrlValue.toUpperCase() == "Y") {
               this.configSOSelectionEnforceSameOrigin = true;
            } else {
               this.configSOSelectionEnforceSameOrigin = false;
            }
         }
         let config2 = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameDestination");
         if (config2 != undefined) {
            if (config2.ctrlValue.toUpperCase() == "Y") {
               this.configSOSelectionEnforceSameDestination = true;
            } else {
               this.configSOSelectionEnforceSameDestination = false;
            }
         }
         let systemWideCustomerLocationSelection = this.moduleControl.find(x => x.ctrlName === "SystemWideCustomerLocationSelection")?.ctrlValue;
         if (systemWideCustomerLocationSelection) {
            this.configSystemWideCustomerLocationSelection = systemWideCustomerLocationSelection;
         }
         if (this.configSystemWideCustomerLocationSelection === "L") {
            this.swapCustomerLocation("L");
         }
      })
   }

   patchInfo() {
      this.selectedCustomerId = this.objectService.header.customerId;

      var lookupValue = this.objectService.customerMasterList?.find(e => e.id === this.selectedCustomerId);
      if (lookupValue != undefined) {
         if (lookupValue.attributeArray1.length > 0) {
            this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
         } else {
            this.selectedCustomerLocationList = [];
         }

         if (lookupValue.attribute5 === "T") {
            // handle location
            this.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 === "W");
            if (lookupValue !== undefined) {
               this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6) });
               this.selectedLocationId = parseFloat(lookupValue.attribute6);
            }
         } else {
            this.fLocationMasterList = this.objectService.locationMasterList;
         }
      }

      this.selectedLocationId = this.objectService.header.locationId;
      this.selectedToLocationId = this.objectService.header.toLocationId;
   }

   loadExisitingSO(salesOrderNums: string[]) {
      this.objectService.getSOHeader(salesOrderNums).subscribe(response => {
         if (response.status === 200) {
            let doc = response.body[0] as SalesOrderHeaderForWD;
            if (doc === undefined) {
               this.toastService.presentToast("", "Sales Order not found.", "top", "warning", 1000);
               return;
            }
            // checking for picking, refer to base system
            if (this.seletcedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.seletcedDocs[0].locationId != doc.locationId) {
               this.toastService.presentToast("", "Not allow to combine sales order with different origin location.", "top", "warning", 1000);
               return;
            }
            if (this.seletcedDocs.length > 0 && this.seletcedDocs[0].customerId != doc.customerId) {
               this.toastService.presentToast("", "Not allow to combine sales order with different customer.", "top", "warning", 1000);
               return;
            }
            this.seletcedDocs.unshift(doc);
            if (this.seletcedDocs && this.seletcedDocs.length > 0) {
               this.onCustomerSelected({ id: this.seletcedDocs[0].customerId }, false);
               this.onCustomerLocationSelected({ id: this.seletcedDocs[0].toLocationId });
               this.objectForm.patchValue({
                  locationId: this.seletcedDocs[0].locationId,
                  customerId: this.seletcedDocs[0].customerId,
                  toLocationId: this.seletcedDocs[0].toLocationId
               })
               this.selectedLocationId = this.seletcedDocs[0].locationId;
               this.selectedCustomerId = this.seletcedDocs[0].customerId;
               this.selectedToLocationId = this.seletcedDocs[0].toLocationId;
            }
            // this.objectService.multiPickingObject.outstandingPickList = [...this.objectService.multiPickingObject.outstandingPickList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
            this.uniqueDoc = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
            this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
            this.uniqueSku = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(rr => rr.itemSku))];
            this.uniqueSku.forEach(r => {
               this.uniqueItemSkuAndCode.set(r, this.objectService.multiPickingObject.outstandingPickList.find(rr => rr.itemSku === r).itemCode);
            })
         }
      }, error => {
         console.error(error);
      });
   }

   setDefaultValue() {
      if (!this.objectForm.controls.locationId.value) {
         let defaultLocation = this.fLocationMasterList.find(item => item.isPrimary)?.id;
         if (defaultLocation) {
            this.objectForm.patchValue({ locationId: defaultLocation });
         } else {
            let findWh = this.fLocationMasterList.find(x => x.attribute1 == 'W');
            if (findWh) {
               this.objectForm.patchValue({ locationId: findWh.id });
            }
         }
         if (this.configService.loginUser.defaultLocationId) {
            let findLocation = this.objectService.locationMasterList.find(x => x.id == this.configService.loginUser.defaultLocationId);
            if (findLocation) {
               this.objectForm.patchValue({ locationId: findLocation.id });
            }
         }
      }

      if (!this.objectForm.controls.warehouseAgentId.value) {
         let defaultAgent = this.objectService.warehouseAgentMasterList.find(item => item.isPrimary)?.id;
         if (defaultAgent) {
            this.objectForm.patchValue({ warehouseAgentId: defaultAgent });
         }
      }
      if (!this.objectForm.controls.customerId.value) {
         let defaultCustomer = this.objectService.customerMasterList.find(r => r.isPrimary);
         if (defaultCustomer) {
            this.objectForm.patchValue({ customerId: defaultCustomer.id });
            this.onCustomerSelected(defaultCustomer.id, true);
         }
      }
   }

   /* #region scanner input */

   itemSearchValue: string;
   handleSoKeyDown(e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         this.barcodeInput.nativeElement.focus();
         if (this.isWithType === "SO") {
            this.validateSalesOrder(this.itemSearchValue);
         } else if (this.isWithType === "B2B") {
            this.validateB2B(this.itemSearchValue);
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      }
   }

   /* #endregion */

   /* #region handle Doc */

   seletcedDocs: SalesOrderHeaderForWD[] = [];
   uniqueDoc: string[] = [];
   uniqueItemCode: string[] = [];
   uniqueSku: string[] = [];
   uniqueItemSkuAndCode: Map<string, string> = new Map([]);
   async validateSalesOrder(input: string) {
      setTimeout(async () => {
         try {

            if (input && input.length > 0) {
               this.itemSearchValue = null;
               if (this.seletcedDocs.findIndex(r => r.salesOrderNum.toLowerCase() === input.toLowerCase()) > -1) {
                  this.toastService.presentToast("", "Document already selected.", "top", "warning", 1000);
               } else {

                  await this.loadingService.showLoading("Loading", false);

                  this.objectService.getSOHeader([input]).subscribe(response => {
                     if (response.status === 200) {
                        let doc = response.body[0] as SalesOrderHeaderForWD;
                        if (doc === undefined) {
                           this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
                           return;
                        }
                        // checking for picking, refer to base system
                        if (this.seletcedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.seletcedDocs[0].locationId != doc.locationId) {
                           this.toastService.presentToast("", "Not allow to combine Doc with different origin location.", "top", "warning", 1000);
                           return;
                        }
                        if (this.seletcedDocs.length > 0 && this.seletcedDocs[0].customerId != doc.customerId) {
                           this.toastService.presentToast("", "Not allow to combine Doc with different customer.", "top", "warning", 1000);
                           return;
                        }
                        this.objectForm.patchValue({ copyFrom: "S" });
                        // doc.line.sort((a, b) => a.itemCode.localeCompare(b.itemCode));
                        this.seletcedDocs.unshift(doc);
                        if (this.seletcedDocs && this.seletcedDocs.length > 0) {
                           this.onCustomerSelected({ id: this.seletcedDocs[0].customerId }, false);
                           this.onCustomerLocationSelected({ id: this.seletcedDocs[0].toLocationId });
                           this.objectForm.patchValue({
                              locationId: this.seletcedDocs[0].locationId,
                              customerId: this.seletcedDocs[0].customerId,
                              toLocationId: this.seletcedDocs[0].toLocationId,
                              copyFrom: "S"
                           })
                           this.selectedLocationId = this.seletcedDocs[0].locationId;
                           this.selectedCustomerId = this.seletcedDocs[0].customerId;
                           this.selectedToLocationId = this.seletcedDocs[0].toLocationId;
                        }
                        this.objectService.multiPickingObject.outstandingPickList = [...this.objectService.multiPickingObject.outstandingPickList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
                        this.objectService.multiPickingObject.outstandingPickList.forEach(r => {
                           if (r.multiPickingOutstandingId === null) r.multiPickingOutstandingId = 0;
                           r.multiPickingId = this.objectForm.controls.multiPickingId.value;
                        })
                        this.uniqueDoc = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
                        this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
                        this.uniqueSku = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(rr => rr.itemSku))];
                        this.uniqueSku.forEach(r => {
                           this.uniqueItemSkuAndCode.set(r, this.objectService.multiPickingObject.outstandingPickList.find(rr => rr.itemSku === r).itemCode);
                        })
                     }
                  }, async error => {
                     console.error(error);
                  });

               }
            } else {
               this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
            }
         } catch (error) {
            console.error(error);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }, 0);
   }

   validateB2B(input: string) {
      setTimeout(async () => {
         try {

            if (input && input.length > 0) {
               this.itemSearchValue = null;
               if (this.seletcedDocs.findIndex(r => r.salesOrderNum.toLowerCase() === input.toLowerCase()) > -1) {
                  this.toastService.presentToast("", "Document already selected.", "top", "warning", 1000);
               } else {

                  await this.loadingService.showLoading("Loading", false);

                  this.objectService.getB2BHeader([input]).subscribe(response => {
                     if (response.status === 200) {
                        let doc = response.body[0] as SalesOrderHeaderForWD;
                        if (doc === undefined) {
                           this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
                           return;
                        }
                        // checking for picking, refer to base system
                        if (this.seletcedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.seletcedDocs[0].locationId != doc.locationId) {
                           this.toastService.presentToast("", "Not allow to combine Doc with different origin location.", "top", "warning", 1000);
                           return;
                        }
                        if (this.seletcedDocs.length > 0 && this.seletcedDocs[0].customerId != doc.customerId) {
                           this.toastService.presentToast("", "Not allow to combine sales order with different customer.", "top", "warning", 1000);
                           return;
                        }
                        this.objectForm.patchValue({ copyFrom: "B" });
                        // doc.line.sort((a, b) => a.itemCode.localeCompare(b.itemCode));
                        this.seletcedDocs.unshift(doc);
                        if (this.seletcedDocs && this.seletcedDocs.length > 0) {
                           this.onCustomerSelected({ id: this.seletcedDocs[0].customerId }, false);
                           this.onCustomerLocationSelected({ id: this.seletcedDocs[0].toLocationId });
                           this.objectForm.patchValue({
                              locationId: this.seletcedDocs[0].locationId,
                              customerId: this.seletcedDocs[0].customerId,
                              toLocationId: this.seletcedDocs[0].toLocationId,
                              copyFrom: "B"
                           })
                           this.selectedLocationId = this.seletcedDocs[0].locationId;
                           this.selectedCustomerId = this.seletcedDocs[0].customerId;
                           this.selectedToLocationId = this.seletcedDocs[0].toLocationId;
                        }
                        this.objectService.multiPickingObject.outstandingPickList = [...this.objectService.multiPickingObject.outstandingPickList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
                        this.objectService.multiPickingObject.outstandingPickList.forEach(r => {
                           if (r.multiPickingOutstandingId === null) r.multiPickingOutstandingId = 0;
                           r.multiPickingId = this.objectForm.controls.multiPickingId.value;
                        })
                        this.uniqueDoc = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
                        this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
                        this.uniqueSku = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(rr => rr.itemSku))];
                        this.uniqueSku.forEach(r => {
                           this.uniqueItemSkuAndCode.set(r, this.objectService.multiPickingObject.outstandingPickList.find(rr => rr.itemSku === r).itemCode);
                        })
                     }
                  }, error => {
                     console.error(error);
                  });
               }
            } else {
               this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
            }
         } catch (error) {
            console.error(error);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }, 0);
   }

   async deleteSo(salesOrderNum) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            subHeader: "Changes made will be discard.",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: async () => {
                     // this.seletcedDocs = this.seletcedDocs.filter(r => r.salesOrderNum !== salesOrderNum);
                     // this.objectService.multiPickingObject.outstandingPickList = this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum != salesOrderNum);
                     // this.uniqueSo = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
                     // this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
                     // if (this.seletcedDocs && this.seletcedDocs.length === 0) {
                     //   this.setDefaultValue();
                     // }
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region handle display mode */

   getSoLineBySo(salesOrderNum: string) {
      return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum);
   }

   getUniqueItemBySoNum(salesOrderNum: string) {
      return [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum))];
   }

   getSoLineByItemCode(itemCode: string): SalesOrderLineForWD[] {
      let ret: SalesOrderLineForWD[] = [];
      let l = this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode);
      if (l && l.length > 0) {
         l.forEach(r => {
            let y = [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.itemSku))];
            y.forEach(rr => {
               let t: SalesOrderLineForWD = {
                  itemId: r.itemId,
                  itemCode: r.itemCode,
                  itemSku: r.itemSku,
                  itemBarcode: r.itemBarcode,
                  // description: r.description,
                  variationTypeCode: r.variationTypeCode,
                  itemVariationXId: r.itemVariationXId,
                  // itemVariationXDescription: r.itemVariationXDescription,
                  itemVariationYId: r.itemVariationYId,
                  // itemVariationYDescription: r.itemVariationYDescription,
                  qtyRequest: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyRequest).reduce((a, c) => Number(a) + Number(c), 0),
                  qtyCurrent: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyCurrent).reduce((a, c) => Number(a) + Number(c), 0),
                  qtyPicked: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyPicked).reduce((a, c) => Number(a) + Number(c), 0),
                  isComponentScan: r.isComponentScan,
                  rack: r.rack,
                  subRack: r.subRack
               }
               if (ret.findIndex(rr => rr.itemSku === t.itemSku) === -1) {
                  ret.push(t);
               }
            })
         })
      }
      return ret;
   }

   getSoNumByItemCode(itemCode: string) {
      return [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.salesOrderNum))].join(", ");
   }

   getSoQtyBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
   }

   getCurrentBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
   }

   getPickedBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
   }

   /* #endregion */

   /* #region detail modal */

   async showDetail() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/picking/picking-item");
   }

   /* #endregion */

   /* #region real header handle here */

   selectedLocationId: number;
   onOriginChanged(event) {
      if (event) {
         this.selectedLocationId = event.id;
         this.objectForm.patchValue({ locationId: this.selectedLocationId });
      } else {
         this.selectedLocationId = null;
         this.objectForm.patchValue({ locationId: this.selectedLocationId });
      }
   }

   onWarehouseAgentSelected(event) {
      if (event) {
         this.objectForm.patchValue({ warehouseAgentId: event.id });
         if (this.isWithType === "SO" || this.isWithType === "B2B") {
            this.barcodeInput.nativeElement.focus();
         }
      } else {
         this.objectForm.patchValue({ warehouseAgentId: null });
      }
   }

   selectedCustomerId: number;
   selectedCustomerLocationList: MasterListDetails[] = [];
   fLocationMasterList: MasterListDetails[] = [];
   onCustomerSelected(event, bindToLocationId: boolean) {
      try {
         this.selectedCustomerId = event ? event.id : null;
         this.objectForm.patchValue({ customerId: this.selectedCustomerId });
         if (this.selectedCustomerId) {
            var lookupValue = this.objectService.customerMasterList?.find(e => e.id == this.selectedCustomerId);
            if (lookupValue != undefined) {
               this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
               if (lookupValue.attributeArray1.length > 0) {
                  this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
               } else {
                  this.selectedCustomerLocationList = [];
               }
               this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6), toLocationId: null });
               this.selectedLocationId = parseFloat(lookupValue.attribute6);
               if (bindToLocationId) {
                  this.selectedToLocationId = null;
               }
            }
            if (lookupValue.attribute5 == "T") {
               this.objectForm.controls.toLocationId.clearValidators();
               this.objectForm.controls.toLocationId.updateValueAndValidity();
            }
            if (lookupValue.attributeArray1.length == 1) {
               this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
               if (bindToLocationId) {
                  this.selectedToLocationId = this.selectedCustomerLocationList[0].id;
               }
            }

            //Auto map object type code
            if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F" || lookupValue.attribute5 == "B") {
               this.objectForm.patchValue({ typeCode: "S" });
               this.objectForm.controls["typeCode"].disable();
            } else {
               this.objectForm.patchValue({ typeCode: "T" });
               this.objectForm.controls["typeCode"].disable();
            }

            if (lookupValue.attribute5 === "T") {
               // handle location
               this.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 === "W");
               if (lookupValue !== undefined) {
                  this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6) });
                  this.selectedLocationId = parseFloat(lookupValue.attribute6);
               }
            } else {
               this.fLocationMasterList = this.objectService.locationMasterList;
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   selectedToLocationId: number;
   onCustomerLocationSelected(event) {
      if (event) {
         this.selectedToLocationId = event.id;
         this.objectForm.patchValue({ toLocationId: this.selectedToLocationId });
      } else {
         this.selectedToLocationId = null;
         this.objectForm.patchValue({ toLocationId: this.selectedToLocationId });
      }
   }

   onFullToLocationSelected(event: SearchDropdownList) {
      if (event) {
         let findLocation = this.objectService.locationMasterList.find(x => x.id === event.id);
         if (findLocation) {
            if (findLocation.attribute13) {
               this.objectForm.patchValue({ customerId: parseInt(findLocation.attribute13) });
               // this.objectForm.controls["customerId"].disable();
               this.customerDisabled = true;
            } else {
               this.objectForm.patchValue({ toLocationId: null, customerId: null });
               // this.objectForm.controls["customerId"].enable();
               this.customerDisabled = false;
               this.toastService.presentToast("Selected Denied", `${findLocation.description} is not mapped to any customer.`, "top", "warning", 1000);
            }
            this.onCustomerSelected({ id: this.objectForm.controls.customerId.value }, true);
            this.onCustomerLocationSelected(event);
         }
      } else {
         this.objectForm.patchValue({ toLocationId: null });
      }
   }

   swapCustomerLocation(type: string = null) {
      if (type === "C") {
         this.isByLocation = false;
      } else if (type === "L") {
         this.isByLocation = true;
      } else {
         this.isByLocation = !this.isByLocation;
      }
      if (this.isByLocation) {
         this.objectForm.patchValue({ customerId: null, toLocationId: null, businessModelType: null });
      } else {
         this.objectForm.patchValue({ customerId: null, toLocationId: null, businessModelType: null });
      }
      this.customerDisabled = false;
   }

   @ViewChild("segment", { static: false }) segment: IonSegment;
   isWithType: string = "SO";
   async isWithDocChanged(event) {
      try {
         if (event.detail.value === "SO" || event.detail.value === "B2B") {
            this.objectForm.patchValue({ isWithSo: true });
            setTimeout(() => {
               if (this.isWithType === "SO" || this.isWithType === "B2B") {
                  this.barcodeInput.nativeElement.focus();
               }
            }, 10);
         } else {
            this.objectForm.patchValue({ isWithSo: false });
         }
         this.objectService.multiPickingObject.pickingCarton = []; // clear picked when setting changed
      } catch (e) {
         console.error(e);
      }
   }

   groupType: string = "S"; // use S for doc, I for non-doc
   groupTypeChanged(event) {
      if (event) {
         this.objectForm.patchValue({ groupType: event.detail.value });
      }
   }

   /* #endregion */

   /* #region  form */

   newObjectForm() {
      try {
         this.objectForm = this.formBuilder.group({
            multiPickingId: [0],
            multiPickingNum: [null],
            trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
            locationId: [null, [Validators.required]],
            toLocationId: [null],
            customerId: [null, [Validators.required]],
            typeCode: [null],
            warehouseAgentId: [JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId, [Validators.required]],
            deactivated: [null],
            workFlowTransactionId: [null],
            masterUDGroup1: [null],
            masterUDGroup2: [null],
            masterUDGroup3: [null],
            businessModelType: [null],
            isWithSo: [true],
            sourceType: ["M"],
            remark: [null],
            groupType: ["S"],
            copyFrom: [null],
            uuid: [uuidv4()]
         });
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region camera scanner */

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

   onDoneScanning(event) {
      try {
         if (event) {
            this.barcodeInput.nativeElement.focus();
            if (this.isWithType === "SO") {
               this.validateSalesOrder(event);
            } else if (this.isWithType === "B2B") {
               this.validateB2B(event);
            } else {
               this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region steps */

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
            subHeader: "Changes made will be discard.",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
               },
               {
                  text: "No",
                  role: "cancel",
               }]
         });
         await actionSheet.present();

         const { role } = await actionSheet.onWillDismiss();

         if (role === "confirm") {
            this.objectService.resetVariables();
            this.navController.navigateBack("/transactions/picking");
         }
      } catch (e) {
         console.error(e);
      }
   }

   nextStep() {
      try {
         if (!this.objectForm.valid) {
            this.toastService.presentToast("", "Something went wrong!", "top", "danger", 1000);
            return;
         }
         this.objectService.setHeader(this.objectForm.getRawValue());
         this.navController.navigateForward("/transactions/picking/picking-item");
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   onWAScanCompleted(event: string) { // warehouse agent
      try {
         let found = this.objectService.warehouseAgentMasterList.find(r => r.code.toUpperCase() === event.toUpperCase());
         if (found) {
            this.onWarehouseAgentSelected({ id: found.id });
         } else {
            this.toastService.presentToast("", "Invalid Warehouse Agent", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   onWADoneScanning(event) { // warehouse agent
      try {
         if (event) {
            let found = this.objectService.warehouseAgentMasterList.find(r => r.code.toUpperCase() === event.toUpperCase());
            if (found) {
               this.onWarehouseAgentSelected({ id: found.id });
            } else {
               this.toastService.presentToast("", "Invalid Warehouse Agent", "top", "warning", 1000);
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

}
