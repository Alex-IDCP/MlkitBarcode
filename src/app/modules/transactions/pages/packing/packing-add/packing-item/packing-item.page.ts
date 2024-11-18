import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonPopover, ModalController, NavController, ViewDidEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { CurrentPackAssignment, CurrentPackList, MultiPackingCarton, MultiPackingObject, MultiPackingRoot, SalesOrderLineForWD } from 'src/app/modules/transactions/models/packing';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { LocalTransaction } from 'src/app/shared/models/pos-download';
import { ItemListMultiUom, LineAssembly, TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-packing-item',
   templateUrl: './packing-item.page.html',
   styleUrls: ['./packing-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePacking' }]
})
export class PackingItemPage implements OnInit, ViewDidEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   showItemList: boolean = false;
   showCartonInfo: boolean = false;

   constructor(
      public objectService: PackingService,
      public authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController
   ) { }

   ionViewDidEnter(): void {
      try {
         this.barcodescaninput.setFocus();
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
      this.loadModuleControl();
      if (this.objectService.multiPackingObject.packingCarton.length === 0) {
         this.addCarton();
      } else {
         this.selectedCartonNum = this.objectService.multiPackingObject.packingCarton[0].cartonNum;
      }
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   packingQtyControl: string = "0";
   packingMatchPickingQty: string = "0";
   systemWideScanningMethod: string;
   systemWideBlockConvertedCode: boolean;
   packingActivateReasonSelection: boolean = false;
   pickPackAllowCopyCode: boolean = false;
   mobilePickPackAutoFocusQtyUponScan: boolean = false;
   configMultiPackActivateAllLineScanning: boolean = false;
   packingBlockIncompletePicking: boolean = false;
   configMPAShowAlertToBlockInvalidAction: boolean = false;
   configMobileScanItemContinuous: boolean = false;
   configSystemWideActivateMultiUOM: boolean = false;
   configMultiPackAutoTransformLooseUom: boolean = false;
   pickPackAllowAssemblyPartialSave: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
         if (config != undefined) {
            this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
         }
         let packingControl = this.moduleControl.find(x => x.ctrlName === "PackingQtyControl");
         if (packingControl != undefined) {
            this.packingQtyControl = packingControl.ctrlValue;
         }
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
         }
         let packPickCtrl = this.moduleControl.find(x => x.ctrlName === "PackingMatchPickingQty");
         if (packPickCtrl) {
            this.packingMatchPickingQty = packPickCtrl.ctrlValue;
         }
         let activateReason = this.moduleControl.find(x => x.ctrlName === "PackingActivateReasonSelection")
         if (activateReason) {
            this.packingActivateReasonSelection = activateReason.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }
         let allowCopyCode = this.moduleControl.find(x => x.ctrlName === "PickPackAllowCopyCode")
         if (allowCopyCode && allowCopyCode.ctrlValue.toUpperCase() === "Y") {
            this.pickPackAllowCopyCode = true;
         } else {
            this.pickPackAllowCopyCode = false;
         }
         let mobilePickPackAutoFocusQtyUponScan = this.moduleControl.find(x => x.ctrlName === "MobilePickPackAutoFocusQtyUponScan")
         if (mobilePickPackAutoFocusQtyUponScan && mobilePickPackAutoFocusQtyUponScan.ctrlValue.toUpperCase() === "Y") {
            this.mobilePickPackAutoFocusQtyUponScan = true;
         } else {
            this.mobilePickPackAutoFocusQtyUponScan = false;
         }
         let multiPackActivateAllLineScanning = this.moduleControl.find(x => x.ctrlName === "MultiPackActivateAllLineScanning")
         if (multiPackActivateAllLineScanning && multiPackActivateAllLineScanning.ctrlValue.toUpperCase() === "Y") {
            this.configMultiPackActivateAllLineScanning = true;
         } else {
            this.configMultiPackActivateAllLineScanning = false;
         }
         let blockIncompletePick = this.moduleControl.find(x => x.ctrlName === "PackingBlockIncompletePicking")
         if (blockIncompletePick && blockIncompletePick.ctrlValue.toUpperCase() === "Y") {
            this.packingBlockIncompletePicking = true;
         } else {
            this.packingBlockIncompletePicking = false;
         }
         let mPAShowAlertToBlockInvalidAction = this.moduleControl.find(x => x.ctrlName === "MPAShowAlertToBlockInvalidAction")
         if (mPAShowAlertToBlockInvalidAction && mPAShowAlertToBlockInvalidAction.ctrlValue.toUpperCase() === "Y") {
            this.configMPAShowAlertToBlockInvalidAction = true;
         } else {
            this.configMPAShowAlertToBlockInvalidAction = false;
         }

         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }

         let activateMultiUom = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateMultiUOM")?.ctrlValue;
         if (activateMultiUom && activateMultiUom.toUpperCase() === "Y") {
            this.configSystemWideActivateMultiUOM = true;
         } else {
            this.configSystemWideActivateMultiUOM = false;
         }
         let transformUom = this.moduleControl.find(x => x.ctrlName === "MultiPackAutoTransformLooseUom")?.ctrlValue;
         if (transformUom && transformUom.toUpperCase() === "Y") {
            this.configMultiPackAutoTransformLooseUom = true;
         } else {
            this.configMultiPackAutoTransformLooseUom = false;
         }
         let allowPartialScan = this.moduleControl.find(x => x.ctrlName === "PickPackAllowAssemblyPartialSave")
         if (allowPartialScan && allowPartialScan.ctrlValue.toUpperCase() === "Y" ) {
            this.pickPackAllowAssemblyPartialSave = true;
         } else {
            this.pickPackAllowAssemblyPartialSave = false;
         }
         if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
            this.loadItemListMultiUom();
         }
      })
   }

   itemListMultiUom: ItemListMultiUom[] = [];
   loadItemListMultiUom() {
      this.objectService.getItemListMultiUom().subscribe({
         next: (response) => {
            this.itemListMultiUom = response;
         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   /* #region picking engine */

   async runPackingEngine(itemFound: TransactionDetail, inputQty: number) {
      if (itemFound) {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0);
         let findMainCodeScanned = findAssemblyItem.find(x => x.itemId === itemFound.itemId);
         if (findMainCodeScanned) {
            this.toastService.presentToast("Control Validation", "Please scan component item code instead of main assembly code.", "top", "warning", 1000);
            return;
         }
         let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku === itemFound.itemSku);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
            let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
            switch (this.packingQtyControl.toUpperCase()) {
               //No control
               case "0":
                  this.insertPackingLine(itemFound, inputQty, outstandingLines, "N");
                  break;
               //Not allow pack quantity more than SO quantity
               case "1":
                  if (osTotalAvailableQty >= inputQty) {
                     this.insertPackingLine(itemFound, inputQty, outstandingLines, "1");
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     let reinsertLine: boolean = false;
                     if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
                        reinsertLine = this.transformItemScannedUom(itemFound, inputQty);
                     }
                     if (!reinsertLine) {
                        let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
                        if (!operationSuccess) {
                           if (this.configMPAShowAlertToBlockInvalidAction) {
                              await this.presentAlert("Control Validation", "", "Input quantity exceeded SO quantity.");
                           } else {
                              this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                           }
                        }
                     }
                  }
                  break;
               //Not allow pack quantity more than pick quantity
               case "2":
                  if (osTotalAvailableQtyPicked >= inputQty) {
                     this.insertPackingLine(itemFound, inputQty, outstandingLines, "2");
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyPicked) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     let reinsertLine: boolean = false;
                     if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
                        reinsertLine = this.transformItemScannedUom(itemFound, inputQty);
                     }
                     if (!reinsertLine) {
                        let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
                        if (!operationSuccess) {
                           if (this.configMPAShowAlertToBlockInvalidAction) {
                              await this.presentAlert("Control Validation", "", "Input quantity exceeded packing quantity.");
                           } else {
                              this.toastService.presentToast("Control Validation", "Input quantity exceeded packing quantity.", "top", "warning", 1000);
                           }
                        }
                     }
                  }
                  break;
            }
         } else {
            let reinsertLine: boolean = false;
            if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
               reinsertLine = this.transformItemScannedUom(itemFound, inputQty);
            }
            if (!reinsertLine) {
               let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
               if (!operationSuccess) {
                  if (this.configMPAShowAlertToBlockInvalidAction) {
                     await this.presentAlert("Control Validation", "", "Item is not available in the selected Sales Order.");
                  } else {
                     this.toastService.presentToast("Control Validation", "Item is not available in the selected Sales Order.", "top", "warning", 1000);
                  }
               }
            }
         }
      } else {
         this.toastService.presentToast("Control Validation", "Invalid Item Barcode", "top", "warning", 1000);
      }
   }

   transformItemScannedUom(itemFound: TransactionDetail, inputQty: number) {
      //Check whether item has multi UOM
      let findItem = this.itemListMultiUom.find(x => x.itemId == itemFound.itemId);
      if (findItem) {
         //Look for scanned item UOM ratio
         let currentItemUom = findItem.multiUom.find(x => x.itemUomId == itemFound.itemUomId);
         if (currentItemUom) {
            //Filter for scanned item other UOM ratio which is lower than current
            let otherItemUom = findItem.multiUom.filter(x => x.itemUomId != itemFound.itemUomId && x.ratio < currentItemUom.ratio);
            otherItemUom.sort((a, b) => (a.ratio > b.ratio) ? 1 : -1);
            if (otherItemUom.length > 0) {
               let findOsLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId == itemFound.itemId);
               if (findOsLines.length > 0) {
                  for (let uom of otherItemUom) {
                     let transformQty = inputQty * currentItemUom.ratio / uom.ratio;
                     if (Number.isInteger(transformQty)) {
                        //To futher enhance this part
                        //Checking on multiple lines and consolidate the qty
                        let findOsLinesWithQty = findOsLines.filter(x => ((x.qtyRequest??0) - (x.qtyPacked??0) - (x.qtyCurrent??0)) >= transformQty);
                        if (findOsLinesWithQty.length > 0) {
                           itemFound.itemBarcode = currentItemUom.itemSku;
                           itemFound.itemSku = uom.itemSku;
                           itemFound.itemUomId = uom.itemUomId;
                           this.runPackingEngine(itemFound, transformQty);
                           return true;
                        }
                     } else {
                        return false;
                     }
                  }
               } else {
                  return false;
               }
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }
   
   transformAssemblyItemScannedUom(itemFound: TransactionDetail, inputQty: number, findAssemblyItem: SalesOrderLineForWD[], outstandingLines: SalesOrderLineForWD[]) {
      //Check whether item has multi UOM
      let findItem = this.itemListMultiUom.find(x => x.itemId == itemFound.itemId);
      if (findItem) {
         //Look for scanned item UOM ratio
         let currentItemUom = findItem.multiUom.find(x => x.itemUomId == itemFound.itemUomId);
         if (currentItemUom) {
            //Filter for scanned item other UOM ratio which is lower than current
            let otherItemUom = findItem.multiUom.filter(x => x.itemUomId != itemFound.itemUomId && x.ratio < currentItemUom.ratio);
            otherItemUom.sort((a, b) => (a.ratio > b.ratio) ? 1 : -1);
            if (otherItemUom.length > 0) {
               let assemblyOutstandingLines = outstandingLines.flatMap(x => x.assembly).filter(y => y.itemComponentId == itemFound.itemId);
               if (outstandingLines.length > 0) {
                  for (let uom of otherItemUom) {
                     let transformQty = inputQty * currentItemUom.ratio / uom.ratio;
                     if (Number.isInteger(transformQty)) {
                        //To futher enhance this part
                        //Checking on multiple lines and consolidate the qty
                        let findOsLinesWithQty = assemblyOutstandingLines.filter(x => ((x.qtyRequest??0) - (x.qtyPacked??0) - (x.qtyCurrent??0)) >= transformQty);
                        if (findOsLinesWithQty.length > 0) {
                           itemFound.itemBarcode = currentItemUom.itemSku;
                           itemFound.itemSku = uom.itemSku;
                           itemFound.itemUomId = uom.itemUomId;
                           this.runAssemblyPackingEngine(itemFound, transformQty, findAssemblyItem);
                           return true;
                        }
                     } else {
                        return false;
                     }
                  }
               } else {
                  return false;
               }
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   async runAssemblyPackingEngine(itemFound: TransactionDetail, inputQty: number, findAssemblyItem: SalesOrderLineForWD[]) {
      let findComponentItem: LineAssembly;
      if (findAssemblyItem) {
         let anyOperationSuccess: boolean = false;
         for (let item of findAssemblyItem) {
            let componentOperationSuccess: boolean = false;
            findComponentItem = item.assembly.find(x => x.itemComponentId === itemFound.itemId);
            if (findComponentItem) {
               let mainItemFound = this.objectService.multiPackingObject.outstandingPackList.find(x => x.itemId === findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
               let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId === findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
               let assemblyOutstandingLines = outstandingLines.flatMap(x => x.assembly).filter(y => y.itemComponentId === itemFound.itemId && y.itemUomId == itemFound.itemUomId);
               if (outstandingLines.length > 0) {
                  let osTotalQtyRequest = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyRequest ?? 0), 0);
                  let osTotalQtyPicked = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyPicked ?? 0), 0);
                  let osTotalQtyPacked = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyPacked ?? 0), 0);
                  let osTotalQtyCurrent = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                  let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
                  let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
                  switch (this.packingQtyControl) {
                     //No control
                     case "0":
                        this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                        componentOperationSuccess = true;
                        break;
                     //Not allow pack quantity more than SO quantity
                     case "1":
                        if (osTotalAvailableQty >= inputQty) {
                           this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                           componentOperationSuccess = true;
                           let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                           let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                           let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                           if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                              this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                           }
                        } else {
                           if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
                              componentOperationSuccess = this.transformAssemblyItemScannedUom(itemFound, inputQty, findAssemblyItem, outstandingLines);
                           } else {
                              componentOperationSuccess = false;
                           }
                        }
                        break;
                     //Not allow pack quantity more than pick quantity
                     case "2":
                        if (osTotalAvailableQtyPicked >= inputQty) {
                           this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                           componentOperationSuccess = true;
                           let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                           let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                           let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                           if (totalQtyCurrent + totalQtyPacked === totalQtyPicked) {
                              this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                           }
                        } else {
                           if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
                              componentOperationSuccess = this.transformAssemblyItemScannedUom(itemFound, inputQty, findAssemblyItem, outstandingLines);
                           } else {
                              componentOperationSuccess = false;
                           }
                        }
                        break;
                  }
                  if (componentOperationSuccess) {
                     anyOperationSuccess = true;
                     break;
                  } else {
                     anyOperationSuccess = false;
                     continue;
                  }
               }
               return true;
            }
         }
         if (anyOperationSuccess) {
            return true;
         } else {
            if (this.configMPAShowAlertToBlockInvalidAction) {
               await this.presentAlert("Control Validation", "", "Input quantity exceeded packing quantity.");
            } else {
               this.toastService.presentToast("Control Validation", "Input quantity exceeded packing quantity.", "top", "warning", 1000);
            }
            return false;
         }
      } else {
         return false;
      }
   }

   checkPackingRules(itemSku: string, inputQty: number) {
      let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku === itemSku);
      if (outstandingLines.length > 0) {
         let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
         let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
         let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
         let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
         let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
         let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
         switch (this.packingQtyControl) {
            //No control
            case "0":
               return true;
            //Not allow pack quantity more than SO quantity
            case "1":
               if (osTotalAvailableQty >= inputQty) {
                  return true;
               } else {
                  return false;
               }
            //Not allow pack quantity more than pick quantity
            case "2":
               if (osTotalAvailableQtyPicked >= inputQty) {
                  return true;
               } else {
                  return false;
               }
         }
      } else {
         return false;
      }
   }

   checkAssemblyPackingRules(assemblyItemId: number, itemId: number, inputQty: number) {
      let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId === assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
      let outstandingLines = findAssemblyItem.flatMap(x => x.assembly).filter(y => y.itemComponentId === itemId);
      if (outstandingLines.length > 0) {
         let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
         let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
         let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
         let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
         let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
         let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
         switch (this.packingQtyControl) {
            //No control
            case "0":
               return true;
            //Not allow pack quantity more than SO quantity
            case "1":
               if (osTotalAvailableQty >= inputQty) {
                  return true;
               } else {
                  return false;
               }
            //Not allow pack quantity more than pick quantity
            case "2":
               if (osTotalAvailableQtyPicked >= inputQty) {
                  return true;
               } else {
                  return false;
               }
         }
      } else {
         return false;
      }
   }

   insertAssemblyPackingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], assemblyItemId: number) {
      //When scanning the same item, add the quantity to first line, instead of adding new row
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (!this.configMultiPackActivateAllLineScanning && packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode && itemFound.itemBarcode === packingCartonTag?.packList[0]?.itemBarcode && packingCartonTag?.packList[0]?.assemblyItemId === assemblyItemId) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty, assemblyItemId);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }

      //Filter out currentPickList with same item
      let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemId === itemFound.itemId && x.assemblyItemId);
      this.computeAssemblyPackingAssignment(inputQty, outstandingLines, packListLines);
   }

   computeAssemblyPackingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      //Update left side qtyCurrent
      for (let os of outstandingLines) {
         for (let assembly of os.assembly) {
            if (assembly.itemComponentId === currentPackListLines[0].itemId) {
               let availableQty = (assembly.qtyRequest ?? 0) - (assembly.qtyPacked ?? 0) - (assembly.qtyCurrent ?? 0);
               if (availableQty >= inputQty) {
                  assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) + inputQty;
                  inputQty = 0;
               } else {
                  assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) + availableQty;
                  inputQty = (inputQty ?? 0) - (availableQty ?? 0)
               }
            }

            assembly.qtyPossible = (assembly.qtyCurrent ?? 0) / assembly.itemComponentQty;
         }
         let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
         if (qtyPossibleArray.length > 0) {
            qtyPossibleArray.sort((a, b) => a - b);
            os.qtyCurrent = qtyPossibleArray[0];
         }
      }
      //This condition only applies to picking without control. User will be able to overscan  
      if (inputQty != 0) {
         let findFirstAssembly = outstandingLines[0].assembly.find(x => x.itemComponentId === currentPackListLines[0].itemId);
         if (findFirstAssembly) {
            findFirstAssembly.qtyCurrent = (findFirstAssembly.qtyCurrent ?? 0) + inputQty;
            inputQty = 0;
         }
      }
      this.mapAssemblyPackingAssignment(outstandingLines, currentPackListLines);
   }

   mapAssemblyPackingAssignment(outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      currentPackListLines = currentPackListLines.filter(x => x.assemblyItemId === outstandingLines[0].itemId)
      currentPackListLines.forEach(x => {
         x.variations = [];
      })
      currentPackListLines.reverse();
      let duplicateOutstandingLines: SalesOrderLineForWD[] = JSON.parse(JSON.stringify(outstandingLines));
      currentPackListLines.forEach(current => {
         let balanceQty: number = current.qtyPacked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            for (let assembly of os.assembly) {
               if (assembly.itemComponentId === currentPackListLines[0].itemId && assembly.assemblyItemId === currentPackListLines[0].assemblyItemId) {
                  let currentPackAssignment: CurrentPackAssignment = {
                     qtyPacked: assembly.qtyCurrent,
                     salesOrderId: os.salesOrderId,
                     salesOrderLineId: os.salesOrderLineId,
                     salesOrderVariationId: os.salesOrderVariationId
                  }
                  if (balanceQty != 0) {
                     if (balanceQty === assembly.qtyCurrent) {
                        currentPackAssignment.qtyPacked = balanceQty;
                        current.variations.push(currentPackAssignment);
                        duplicateOutstandingLines.shift();
                        balanceQty = 0;
                        break;
                     }
                     else if (balanceQty > assembly.qtyCurrent) {
                        currentPackAssignment.qtyPacked = assembly.qtyCurrent;
                        current.variations.push(currentPackAssignment);
                        balanceQty = (balanceQty ?? 0) - (assembly.qtyCurrent ?? 0);
                        rightLoopCount++;
                     }
                     else if (balanceQty < assembly.qtyCurrent) {
                        currentPackAssignment.qtyPacked = balanceQty;
                        current.variations.push(currentPackAssignment);
                        assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) - (balanceQty ?? 0);
                        balanceQty = 0;
                     }
                  }
               }
            }
         }
         if (rightLoopCount > 0) {
            duplicateOutstandingLines.splice(0, rightLoopCount);
         }
      })
   }

   insertPackingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], packingQtyControl: string) {
      // When scanning the same item, add the quantity to first line, instead of adding new row
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (!this.configMultiPackActivateAllLineScanning && packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode === packingCartonTag?.packList[0]?.itemBarcode && !packingCartonTag.packList[0].assemblyItemId) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }
      // Filter out currentPickList with same item
      let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemSku === itemFound.itemSku && !x.assemblyItemId);
      this.computePickingAssignment(inputQty, outstandingLines, packListLines);
      // this.setDataEntryState();
      // this.objectForm.markAsDirty();
      // this.barcodeScan.setInputFocus();
   }

   assignItemFoundToNewLine(itemFound: any, inputQty: number, assemblyItemId?: number) {
      let newLine: CurrentPackList = {
         multiPackingLineId: 0,
         multiPackingId: this.objectService.header.multiPackingId,
         itemId: itemFound.itemId,
         itemCode: itemFound.itemCode,
         itemVariationXId: itemFound.itemVariationXId,
         itemVariationYId: itemFound.itemVariationYId,
         itemVariationXDescription: this.objectService.itemVariationXMasterList.find(r => r.id === itemFound.itemVariationXId)?.description,
         itemVariationYDescription: this.objectService.itemVariationYMasterList.find(r => r.id === itemFound.itemVariationYId)?.description,
         itemSku: itemFound.itemSku,
         itemUomId: itemFound.itemUomId,
         itemBarcode: itemFound.itemBarcode,
         description: itemFound.description,
         qtyPacked: inputQty,
         sequence: 0,
         lineUDDate: null,
         masterUDGroup1: null,
         masterUDGroup2: null,
         masterUDGroup3: null,
         locationId: this.objectService.header.locationId,
         cartonNum: 0,
         deactivated: false,
         variations: []
      }
      if (assemblyItemId) {
         newLine.assemblyItemId = assemblyItemId;
      }
      return newLine;
   }

   computePickingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      // Update left side qtyCurrent
      for (let os of outstandingLines) {
         let availableQty = os.qtyRequest - os.qtyPacked - os.qtyCurrent;
         if (availableQty >= inputQty) {
            os.qtyCurrent = (os.qtyCurrent ?? 0) + inputQty;
            inputQty = 0;
         } else {
            os.qtyCurrent = (os.qtyCurrent ?? 0) + availableQty;
            inputQty = (inputQty ?? 0) - (availableQty ?? 0)
         }
      }
      // This condition only applies to picking without control. User will be able to overscan  
      if (inputQty != 0) {
         outstandingLines[0].qtyCurrent = (outstandingLines[0].qtyCurrent ?? 0) + inputQty;
         inputQty = 0;
      }
      this.mapPickingAssignment(outstandingLines, currentPackListLines);
   }

   mapPickingAssignment(outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      currentPackListLines.forEach(x => {
         x.variations = [];
      })
      currentPackListLines.reverse();
      let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
      currentPackListLines.forEach(current => {
         let balanceQty: number = current.qtyPacked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            let currentPackAssignment: CurrentPackAssignment = {
               qtyPacked: os.qtyCurrent,
               salesOrderId: os.salesOrderId,
               salesOrderLineId: os.salesOrderLineId,
               salesOrderVariationId: os.salesOrderVariationId
            }
            if (balanceQty != 0) {
               if (balanceQty === os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPackAssignment);
                  duplicateOutstandingLines.shift();
                  balanceQty = 0;
                  break;
               }
               else if (balanceQty > os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = os.qtyCurrent;
                  current.variations.push(currentPackAssignment);
                  balanceQty = (balanceQty ?? 0) - (os.qtyCurrent ?? 0);
                  rightLoopCount++;
               }
               else if (balanceQty < os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPackAssignment);
                  os.qtyCurrent = (os.qtyCurrent ?? 0) - (balanceQty ?? 0);
                  balanceQty = 0;
               }
            }
         }
         if (rightLoopCount > 0) {
            duplicateOutstandingLines.splice(0, rightLoopCount);
         }
      })
   }

   insertPackingLineWithoutSo(itemFound: TransactionDetail, inputQty: number) {
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (!this.configMultiPackActivateAllLineScanning && packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode === packingCartonTag?.packList[0]?.itemBarcode) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }
   }

   lookupItemInfo(itemId: number, lookupInfoType: string) {
      if (lookupInfoType === "CODE" && Capacitor.getPlatform() !== "web") {
         let findItem = this.configService.item_Masters.find(x => x.id === itemId);
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

   /* #region carton segment */

   selectedCartonNum: number = 0;
   addCarton(duplicateFrom?: MultiPackingCarton, autoSelectCarton: boolean = true) {
      let nextCartonNum = this.objectService.multiPackingObject.packingCarton.length > 0 ? this.objectService.multiPackingObject.packingCarton[0].cartonNum + 1 : 1;
      let newPackList: CurrentPackList[] = [];
      let defaultPackaging = this.objectService.packagingMasterList.find(x => x.isPrimary);
      let newCarton: MultiPackingCarton = {
         cartonNum: nextCartonNum,
         cartonHeight: duplicateFrom ? duplicateFrom.cartonHeight : null,
         cartonWidth: duplicateFrom ? duplicateFrom.cartonWidth : null,
         cartonLength: duplicateFrom ? duplicateFrom.cartonLength : null,
         cartonWeight: duplicateFrom ? duplicateFrom.cartonWeight : null,
         cartonCbm: duplicateFrom ? duplicateFrom.cartonCbm : null,
         cartonBarcode: null,
         packagingId: duplicateFrom ? duplicateFrom.packagingId : (defaultPackaging ? defaultPackaging.id : null),
         packList: newPackList
      };
      this.objectService.multiPackingObject.packingCarton.unshift(newCarton);
      if (autoSelectCarton) {
         this.selectedCartonNum = nextCartonNum;
      }
   }

   async deleteCarton() {
      try {
         if (this.selectedCartonNum) {
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
                        if (this.objectService.header.isWithSo) {
                           await this.objectService.multiPackingObject.packingCarton.find(r => Number(this.selectedCartonNum) === Number(r.cartonNum)).packList.forEach(item => {
                              this.resetOutstandingListQuantityCurrent(item);
                           })
                           this.objectService.multiPackingObject.packingCarton = this.objectService.multiPackingObject.packingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        } else {
                           this.objectService.multiPackingObject.packingCarton = this.objectService.multiPackingObject.packingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        }
                        this.selectedCartonNum = this.objectService.multiPackingObject.packingCarton.length > 0 ? this.objectService.multiPackingObject.packingCarton[0].cartonNum : null;
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
         } else {
            this.toastService.presentToast("", "Please select a carton.", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteCartonLine(rowIndex: number, item: CurrentPackList) {
      try {
         if (this.selectedCartonNum) {
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
                        this.resetOutstandingListQuantityCurrent(item);
                        let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                        if (packingCartonTag) {
                           let rowIndex = packingCartonTag.packList.findIndex(x => x === item);
                           packingCartonTag.packList.splice(rowIndex, 1);
                           packingCartonTag.packList = [...packingCartonTag.packList];
                        }
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
         } else {
            this.toastService.presentToast("", "Please select a carton.", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetOutstandingListQuantityCurrent(item: CurrentPackList) {
      if (item.assemblyItemId) {
         let findOs = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0 && x.itemId === item.assemblyItemId);
         if (findOs.length > 0) {
            let inputQty = item.qtyPacked;
            findOs.forEach(os => {
               os.assembly.forEach(assembly => {
                  if (assembly.itemComponentId === item.itemId) {
                     if (assembly.qtyCurrent >= inputQty) {
                        assembly.qtyCurrent -= inputQty;
                        inputQty = 0;
                     } else {
                        assembly.qtyCurrent = 0;
                        inputQty -= assembly.qtyCurrent
                     }
                  }
                  assembly.qtyPossible = assembly.qtyCurrent / assembly.itemComponentQty;
               })
               let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
               if (qtyPossibleArray.length > 0) {
                  qtyPossibleArray.sort((a, b) => a - b);
                  os.qtyCurrent = qtyPossibleArray[0];
               }
            })
         }
      } else {
         if (item.variations) {
            item.variations.forEach(inner => {
               let findOs = this.objectService.multiPackingObject.outstandingPackList.find(x => x.salesOrderVariationId === inner.salesOrderVariationId);
               if (findOs) {
                  findOs.qtyCurrent -= inner.qtyPacked;
               }
            })
         }
      }
   }

   getCartonItems() {
      if (Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList;
      }
      return [];
   }

   getCarton() {
      if (Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      }
      return null;
   }

   /* #endregion */

   /* #region barcode & check so */

   async validateBarcode(barcode: string) {
      try {
         if (barcode) {
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
               if (found_barcode) {
                  let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
                  let outputData: TransactionDetail = {
                     itemId: found_item_master.id,
                     itemCode: found_item_master.code,
                     description: found_item_master.itemDesc,
                     typeCode: found_item_master.typeCode,
                     variationTypeCode: found_item_master.varCd,
                     discountGroupCode: found_item_master.discCd,
                     discountExpression: (found_item_master.discPct ?? "0") + "%",
                     taxId: found_item_master.taxId,
                     taxCode: found_item_master.taxCd,
                     taxPct: found_item_master.taxPct,
                     qtyRequest: null,
                     itemPricing: {
                        itemId: found_item_master.id,
                        unitPrice: found_item_master.price,
                        discountGroupCode: found_item_master.discCd,
                        discountExpression: (found_item_master.discPct ?? "0") + "%",
                        discountPercent: found_item_master.discPct ?? 0,
                        discountGroupId: null,
                        unitPriceMin: null,
                        currencyId: null
                     },
                     itemVariationXId: found_barcode.xId,
                     itemVariationYId: found_barcode.yId,
                     itemSku: found_barcode.sku,
                     itemBarcode: found_barcode.barcode,
                     itemUomId: found_barcode.itemUomId,
                     itemUomDesc: found_barcode.itemUomDesc,
                  }
                  return outputData;
               } else {
                  this.toastService.presentToast("", "Barcode not found.", "top", "danger", 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (this.objectService.multiPackingObject.packingCarton.length === 0) {
            this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
         } else {
            if (event) {
               if (this.objectService.header.isWithSo) {
                  event.forEach(async r => {
                     let isBlock: boolean = false;
                     isBlock = this.validateNewItemConversion(r);
                     if (!isBlock) {
                        if (this.mobilePickPackAutoFocusQtyUponScan) {
                           await this.cartonLineQtyInput().then(async res => {
                              setTimeout(async () => {
                                 await this.runPackingEngine(r, Number(res));
                                 await this.barcodescaninput.setFocus();                                 
                              }, 0);
                           })
                        } else {
                           await this.runPackingEngine(r, Number(((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1)));
                        }
                     }
                  })
               } else {
                  // Not allow to add assembly item for scanning without document
                  if (event && event.length > 0 && event.filter(r => r.typeCode === "AS")?.length > 0) {
                     this.toastService.presentToast(" Item Detected", `Item ${event.filter(r => r.typeCode === "AS").flatMap(r => r.itemCode).join(", ")} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
                     return;
                  }
                  event.forEach(async r => {
                     let isBlock: boolean = false;
                     isBlock = this.validateNewItemConversion(r);
                     if (!isBlock) {
                        if (this.mobilePickPackAutoFocusQtyUponScan) {
                           await this.cartonLineQtyInput().then(async res => {
                              setTimeout(async () => {
                                 await this.insertPackingLineWithoutSo(r, Number(res));
                                 await this.barcodescaninput.setFocus();                                 
                              }, 0);
                           })
                        } else {
                           await this.insertPackingLineWithoutSo(r, Number(((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1)));
                        }
                     }
                  })
               }
            }
         }
      } catch (e) {
         console.error(e);
      } finally {
      }
   }

   /* #endregion */

   /* #region line qty alert during insert */

   async cartonLineQtyInput() {
      return new Promise(async (resolve) => {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            backdropDismiss: false,
            header: "Enter Quantity",
            inputs: [
               {
                  name: "inputQty",
                  type: "number",
                  placeholder: "Enter Quantity",
                  value: 1,
                  min: 1
               }
            ],
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: async (data) => {
                     resolve(data.inputQty);
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel"
               },
            ],
         });
         await alert.present().then(() => {
            const firstInput: any = document.querySelector("ion-alert input");
            setTimeout(() => {
               firstInput.focus();
            }, 1000);
            return;
         });
      })
   }

   /* #endregion */

   /* #region update carton line qty */

   async editCartonLine(item: CurrentPackList) {
      await this.clonePackingQty(item);
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         backdropDismiss: false,
         header: "Enter Quantity",
         inputs: [
            {
               name: "inputQty",
               type: "number",
               placeholder: "Enter Quantity",
               value: Number(item.qtyPacked),
               min: 1
            }
         ],
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "success",
               handler: async (data) => {
                  item.qtyPacked = Number(data.inputQty);
                  if (this.objectService.header.isWithSo) {
                     this.updatePackingQty(item);
                  }
               },
            },
            {
               text: "Cancel",
               role: "cancel"
            },
         ],
      });
      await alert.present().then(() => {
         const firstInput: any = document.querySelector("ion-alert input");
         firstInput.focus();
         return;
      });
   }

   clonedQty: { [s: number]: CurrentPackList } = {};
   clonePackingQty(item: CurrentPackList) {
      let rowIndex = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList.findIndex(x => x === item);
      this.clonedQty[rowIndex] = { ...item };
   }

   async updatePackingQty(item: CurrentPackList) {
      let rowIndex = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum))?.packList.findIndex(x => x === item);
      let inputQty: number = item.qtyPacked - this.clonedQty[rowIndex].qtyPacked;
      if (!item.assemblyItemId) {
         let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku === item.itemSku);
         let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemSku === item.itemSku && !x.assemblyItemId);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
            let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
            switch (this.packingQtyControl) {
               //No control
               case "0":
                  this.resetOutstandingListQuantityCurrent(item);
                  this.computePackingAssignment(item.qtyPacked, outstandingLines, packListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "1":
                  if (osTotalAvailableQty >= inputQty) {
                     this.resetOutstandingListQuantityCurrent(item);
                     this.computePackingAssignment(item.qtyPacked, outstandingLines, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [...this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                     if (this.configMPAShowAlertToBlockInvalidAction) {
                        await this.presentAlert("Control Validation", "", "Input quantity exceeded SO quantity.");
                     } else {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
               //Not allow pack quantity more than pick quantity
               case "2":
                  if (osTotalAvailableQtyPicked >= inputQty) {
                     this.resetOutstandingListQuantityCurrent(item);
                     this.computePackingAssignment(item.qtyPacked, outstandingLines, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyPicked) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [...this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                     if (this.configMPAShowAlertToBlockInvalidAction) {
                        await this.presentAlert("Control Validation", "", "Input quantity exceeded packing quantity.");
                     } else {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded packing quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            if (this.configMPAShowAlertToBlockInvalidAction) {
               await this.presentAlert("Control Validation", "", "Matching outstanding list not found.");
            } else {
               this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
            }
         }
      } else {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId === item.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
         let outstandingLines = findAssemblyItem.flatMap(x => x.assembly).filter(y => y.itemComponentId === item.itemId);
         let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemId === item.itemId && x.assemblyItemId === outstandingLines[0].assemblyItemId);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
            let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
            switch (this.packingQtyControl) {
               //No control
               case "0":
                  let clonedItem = JSON.parse(JSON.stringify(item));
                  let aggregatedQtyPacked = packListLines.reduce((sum, current) => sum + current.qtyPacked, 0);
                  clonedItem.qtyPacked = aggregatedQtyPacked - item.qtyPacked + this.clonedQty[rowIndex].qtyPacked;
                  this.resetOutstandingListQuantityCurrent(clonedItem);
                  this.computeAssemblyPackingAssignment(aggregatedQtyPacked, findAssemblyItem, packListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "1":
                  if (osTotalAvailableQty >= inputQty) {
                     let clonedItem = JSON.parse(JSON.stringify(item));
                     let aggregatedQtyPacked = packListLines.reduce((sum, current) => sum + current.qtyPacked, 0);
                     clonedItem.qtyPacked = aggregatedQtyPacked - item.qtyPacked + this.clonedQty[rowIndex].qtyPacked;
                     this.resetOutstandingListQuantityCurrent(clonedItem);
                     this.computeAssemblyPackingAssignment(aggregatedQtyPacked, findAssemblyItem, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [... this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                     if (this.configMPAShowAlertToBlockInvalidAction) {
                        await this.presentAlert("Control Validation", "", "Input quantity exceeded SO quantity.");
                     } else {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
               //Not allow pack quantity more than pick quantity
               case "2":
                  if (osTotalAvailableQtyPicked >= inputQty) {
                     let clonedItem = JSON.parse(JSON.stringify(item));
                     let aggregatedQtyPacked = packListLines.reduce((sum, current) => sum + current.qtyPacked, 0);
                     clonedItem.qtyPacked = aggregatedQtyPacked - item.qtyPacked + this.clonedQty[rowIndex].qtyPacked;
                     this.resetOutstandingListQuantityCurrent(clonedItem);
                     this.computePackingAssignment(aggregatedQtyPacked, findAssemblyItem, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyPicked) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                     this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [... this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                     if (this.configMPAShowAlertToBlockInvalidAction) {
                        await this.presentAlert("Control Validation", "", "Input quantity exceeded packing quantity.");
                     } else {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded packing quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            if (this.configMPAShowAlertToBlockInvalidAction) {
               await this.presentAlert("Control Validation", "", "Matching outstanding list not found.");
            } else {
               this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
            }
         }
      }
      delete this.clonedQty[rowIndex];
   }

   computePackingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      //Update left side qtyCurrent
      for (let os of outstandingLines) {
         let availableQty = os.qtyRequest - os.qtyPacked - os.qtyCurrent;
         if (availableQty >= inputQty) {
            os.qtyCurrent += inputQty;
            inputQty = 0;
         } else {
            os.qtyCurrent += availableQty;
            inputQty -= availableQty
         }
      }
      //This condition only applies to packing without control. User will be able to overscan  
      if (inputQty != 0) {
         outstandingLines[0].qtyCurrent += inputQty;
         inputQty = 0;
      }
      this.mapPackingAssignment(outstandingLines, currentPackListLines);
   }

   validateNewItemConversion(itemList: TransactionDetail) {
      if (itemList.newItemId && itemList.newItemEffectiveDate && this.commonService.convertUtcDate(itemList.newItemEffectiveDate) <= this.objectService.header.trxDate) {
         let newItemCode = this.configService.item_Masters.find(r => r.id === itemList.newItemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${itemList.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(itemList.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.systemWideBlockConvertedCode) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   mapPackingAssignment(outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      currentPackListLines.forEach(x => {
         x.variations = [];
      })
      currentPackListLines.reverse();
      let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
      currentPackListLines.forEach(current => {
         let balanceQty: number = current.qtyPacked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            let currentPackAssignment: CurrentPackAssignment = {
               qtyPacked: os.qtyCurrent,
               salesOrderId: os.salesOrderId,
               salesOrderLineId: os.salesOrderLineId,
               salesOrderVariationId: os.salesOrderVariationId
            }
            if (balanceQty != 0) {
               if (balanceQty === os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPackAssignment);
                  duplicateOutstandingLines.shift();
                  balanceQty = 0;
                  break;
               }
               else if (balanceQty > os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = os.qtyCurrent;
                  current.variations.push(currentPackAssignment);
                  balanceQty -= os.qtyCurrent;
                  rightLoopCount++;
               }
               else if (balanceQty < os.qtyCurrent) {
                  currentPackAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPackAssignment);
                  os.qtyCurrent -= balanceQty;
                  balanceQty = 0;
               }
            }
         }
         if (rightLoopCount > 0) {
            duplicateOutstandingLines.splice(0, rightLoopCount);
         }
      })
   }

   /* #endregion */

   /* #region show variaton dialog */

   selectedItem: TransactionDetail;
   showDetails(item: any) {
      if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
         // this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
         item.isSelected = !item.isSelected;
      }
   }

   /* #endregion */

   /* #region image modal */

   isImageModalOpen: boolean = false;
   imageUrl: string;
   showImageModal(itemCode: string) {
      let itemId = this.objectService.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode).itemId;
      this.imageUrl = null;
      this.objectService.getItemImage(itemId).subscribe(response => {
         if (response && response.length > 0) {
            this.imageUrl = "data:image/png;base64, " + response[0].imageSource;
            this.isImageModalOpen = true;
         }
      }, error => {
         console.error(error);
      })
   }

   showZoom: boolean = false;
   showZoomedImage() {
      this.isImageModalOpen = false;
      this.showZoom = true;
   }

   hideZoomedImage() {
      this.showZoom = false;
   }


   /* #endregion */

   /* #region camera scanner */

   scanActive: boolean = false;
   async onCameraStatusChanged(event) {
      try {
         this.scanActive = event;
         if (this.scanActive) {
            document.body.style.background = "transparent";
         } else {
            await this.barcodescaninput.setFocus();
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onDoneScanning(event) {
      try {
         if (event) {
            let itemFound = await this.validateBarcode(event);
            if (itemFound) {
               if (this.objectService.header.isWithSo) {
                  await this.runPackingEngine(itemFound, 1);
               } else {
                  await this.insertPackingLineWithoutSo(itemFound, 1);
               }
            } else {
               this.toastService.presentToast("Item Not Found", "", "top", "warning", 1000);
            }
            await this.barcodescaninput.setFocus();
            if (this.configMobileScanItemContinuous) {
               await this.barcodescaninput.startScanning();
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

   async saveButtonClicked(saveLocal: boolean) {
      switch (this.packingMatchPickingQty) {
         case "0":
            if (saveLocal) {
               this.nextStepLocal();
            } else {
               this.nextStep();
            }
            break;
         case "1":
            let check1 = this.checkPackingPickingQty();
            if (!check1) {
               const alert = await this.alertController.create({
                  cssClass: "custom-alert",
                  header: "Are you sure to proceed?",
                  subHeader: "Packing quantity doesn't match with picking quantity. Please confirm to proceed.",
                  buttons: [
                     {
                        text: "Confirm",
                        cssClass: "success",
                        handler: async () => {
                           if (this.objectService.header.multiPackingId === 0) {
                              await this.insertObject();
                           } else {
                              await this.updateObject();
                           }
                        },
                     },
                     {
                        text: "Cancel",
                        role: "cancel",
                        cssClass: "cancel",
                     },
                  ],
               });
               await alert.present();
            } else {
               if (saveLocal) {
                  this.nextStepLocal();   
               } else {
                  this.nextStep();
               }
            }
            break;
         case "2":
            let check2 = this.checkPackingPickingQty();
            if (!check2) {
               this.toastService.presentToast("Validation Failed", "Packing quantity does not match with picking quantity. Please rectify to save the transaction.", "top", "warning", 2000);
            } else {
               if (saveLocal) {
                  this.nextStepLocal();
               } else {
                  this.nextStep();
               }
            }
            break;
      }
   }

   checkPackingPickingQty() {
      let qtyMatched: boolean = true;
      this.objectService.multiPackingObject.outstandingPackList.forEach(os => {
         if (os.qtyPicked != (os.qtyPacked + os.qtyCurrent)) {
            qtyMatched = false;
         }
      })
      return qtyMatched;
   }

	async nextStepLocal() {
		try {
			const alert = await this.alertController.create({
				cssClass: "custom-alert",
				header: "Are you sure to proceed?",
				buttons: [
					{
						text: "Confirm",
						cssClass: "success",
						handler: async () => {
							await this.insertObjectLocal();
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
		} catch (e) {
			console.error(e);
		} finally {
         
		}
	}

   async nextStep() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     if (this.objectService.header.multiPackingId === 0) {
                        await this.insertObject();
                     } else {
                        await this.updateObject();
                     }
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "cancel",
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async insertObject() {
      try {
         let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
         if (!this.pickPackAllowAssemblyPartialSave) {
            let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPackingObject);
            if (!checkFullComponentScan) {
               this.toastService.presentToast("Insert Failed", "Component items are partially scan. Not allow to save.", "top", "warning", 1000);
               return;
            }
         }
         if (this.allowDocumentWithEmptyLine === "N") {
            if (newObjectDto.details.length < 1) {
               this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "danger", 1000);
               return;
            }
         }
			await this.loadingService.showLoading();
         this.objectService.insertObject(newObjectDto).subscribe(async response => {
            if (response.status === 201) {
               let object = response.body as MultiPackingRoot;
               this.toastService.presentToast("Insert Complete", "New packing has been created.", "top", "success", 1000);
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction("MultiPacking", this.objectService.localObject);
					}
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPackingId
                  }
               }
					await this.objectService.resetVariables();
					await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/packing/packing-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   async updateObject() {
      try {
         let updateObjectDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
         if (!this.pickPackAllowAssemblyPartialSave) {
            let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPackingObject);
            if (!checkFullComponentScan) {
               this.toastService.presentToast("Insert Failed", "Component items are partially scan. Not allow to save.", "top", "warning", 1000);
               return;
            }
         }
         if (this.allowDocumentWithEmptyLine === "N") {
            if (updateObjectDto.details.length < 1) {
               this.toastService.presentToast("Update Failed", "System unable to insert document without item line.", "top", "danger", 1000);
               return;
            }
         }
			await this.loadingService.showLoading();
         this.objectService.updateObject(updateObjectDto).subscribe(async response => {
            if (response.status === 201) {
               let object = response.body as MultiPackingRoot;
               this.toastService.presentToast("Update Complete", "Packing has been updated.", "top", "success", 1000);
					if (this.objectService.localObject) {
						await this.configService.deleteLocalTransaction("MultiPacking", this.objectService.localObject);
					}
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPackingId
                  }
               }
					await this.objectService.resetVariables();
					await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/packing/packing-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   async insertObjectLocal() {
      try {
         let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
         let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPackingObject)
         if (!checkFullComponentScan) {
            this.toastService.presentToast("Insert Failed", "Component items are partially scan. Not allow to save.", "top", "warning", 1000);
            return;
         }
         if (this.allowDocumentWithEmptyLine === "N") {
            if (newObjectDto.details.length < 1) {
               this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "danger", 1000);
               return;
            }
         }
			let localTrx: LocalTransaction;
			if (newObjectDto.header.isTrxLocal) {
				localTrx = {
					id: newObjectDto.header.guid,
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: "MultiPacking",
					lastUpdated: new Date(),
					jsonData: JSON.stringify(newObjectDto)
				}
				await this.configService.updateLocalTransaction(localTrx);
			} else {
				localTrx = {
					id: uuidv4(),
					apiUrl: this.configService.selected_sys_param.apiUrl,
					trxType: "MultiPacking",
					lastUpdated: new Date(),
					jsonData: JSON.stringify(newObjectDto)
				}
				await this.configService.insertLocalTransaction(localTrx);
			}
         this.toastService.presentToast("Insert Complete", "New packing has been created.", "top", "success", 1000);
			await this.objectService.resetVariables();
			let navigationExtras: NavigationExtras = {
				queryParams: {
					objectId: 0,
					isLocal: true,
					guid: localTrx.id
				}
			}
			this.navController.navigateRoot("/transactions/packing/packing-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      // this.modalController.dismiss();
      try {
         this.navController.navigateBack("/transactions/packing/packing-header");
      } catch (e) {
         console.error(e);
      }
      // this.modalController.dismiss(this.filters);
   }

   transformObjectToTrxDto(multiPackingObject: MultiPackingObject): MultiPackingRoot {
      if (this.allowDocumentWithEmptyLine === "N") {
         multiPackingObject.packingCarton.forEach(carton => {
            carton.packList = carton.packList.filter(x => x.qtyPacked > 0);
         })
      }
      this.objectService.header.totalCarton = multiPackingObject.packingCarton.length;
      if (!this.objectService.header.businessModelType) {                              
         var lookupValue = this.objectService.customerMasterList?.find(e => e.id === this.objectService.header.customerId);
         if (lookupValue) {
            this.objectService.header.businessModelType = lookupValue.attribute5;
         }
      }
      let trxDto: MultiPackingRoot = {
         header: this.objectService.header,
         details: multiPackingObject.packingCarton,
         otp: null,
         outstandingPackList: multiPackingObject.outstandingPackList
      };
      return trxDto;
   }

   checkAssemblyFullScan(multiPackingObject: MultiPackingObject) {
      let isFullScan: boolean = true;
      multiPackingObject.outstandingPackList.forEach(os => {
         if (os.isComponentScan && os.assembly && os.assembly.length > 0) {
            let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
            qtyPossibleArray = [...new Set(qtyPossibleArray)];
            if (qtyPossibleArray.length > 1) {
               isFullScan = false;
            }
         }
      })
      return isFullScan;
   }

   sendForDebug() {
      let trxDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
      let jsonObjectString = JSON.stringify(trxDto);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status === 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

   calculateCbm(item: MultiPackingCarton) {
      if (item.cartonHeight && item.cartonWidth && item.cartonLength) {
         item.cartonCbm = (item.cartonHeight / 100) * (item.cartonWidth / 100) * (item.cartonLength / 100);
         item.cartonCbm = this.commonService.roundToTwoDecimal(item.cartonCbm);
      } else {
         item.cartonCbm = null;
      }
   }

   onCartonNumClicked(cartonNum: number) {
      if (cartonNum.toString() === this.selectedCartonNum.toString()) {
         this.showCartonInfo = !this.showCartonInfo;
      }
   }

   copyModal: boolean = false;
   showCopyModal() {
      this.copyModal = true;
   }

   hideCopyModal() {
      this.copyModal = false;
   }

   async cloneItemToRight(rowData: any, typeCode: string) {
      let udItemList: TransactionDetail;
      udItemList = await this.barcodescaninput.validateBarcode(rowData.itemBarcode, false);
      if (udItemList) {
         let itemQty: number
         itemQty = rowData.qtyRequest - (rowData.qtyCurrent ?? 0) - rowData.qtyPacked;
         await this.runPackingEngine(udItemList, itemQty);
      }
   }

   async duplicateCartonConfirmation() {
      if (this.selectedCartonNum) {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            backdropDismiss: false,
            header: "Enter Quantity",
            inputs: [
               {
                  name: "inputQty",
                  type: "number",
                  placeholder: "Enter Quantity",
                  value: 1,
                  min: 1
               }
            ],
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: async (data) => {
                     if (data.inputQty) {
                        await this.duplicateCarton(data.inputQty)
                     }
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel"
               },
            ],
         });
         await alert.present().then(() => {
            const firstInput: any = document.querySelector("ion-alert input");
            setTimeout(() => {
               firstInput.focus();
            }, 500);
            return;
         });
      } else {
         this.toastService.presentToast("Control Error", "No Carton selected.", "top", "warning", 1000);
      }
   }

   async duplicateCarton(inputNumber) {
      if (inputNumber) {
         for (let i = 0; i < inputNumber; i++) {
            let packingCartonPackList = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum))?.packList;
            if (packingCartonPackList) {
               let duplicatedList: CurrentPackList[] = JSON.parse(JSON.stringify(packingCartonPackList));
               this.addCarton(this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)), false);
               if (this.objectService.header.isWithSo) {
                  let allLinesDuplicated: boolean = true;
                  let nonComponentList: CurrentPackList[] = duplicatedList.filter(x => !x.assemblyItemId);
                  let componentList: CurrentPackList[] = duplicatedList.filter(x => x.assemblyItemId);
                  nonComponentList.forEach(line => {
                     line.multiPackingLineId = 0;
                     line.multiPackingId = this.objectService.object.header.multiPackingId;
                     line.cartonNum = this.objectService.multiPackingObject.packingCarton[0].cartonNum;
                     let checking = this.checkPackingRules(line.itemSku, line.qtyPacked);
                     if (checking) {
                        this.objectService.multiPackingObject.packingCarton[0].packList.push(line);
                        let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku == line.itemSku);
                        let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemSku == line.itemSku && x.assemblyItemId);
                        this.computePackingAssignment(line.qtyPacked, outstandingLines, packListLines);
                     } else {
                        allLinesDuplicated = false;
                     }
                  })
                  componentList.forEach(line => {
                     line.multiPackingLineId = 0;
                     line.multiPackingId = this.objectService.header.multiPackingId;
                     line.cartonNum = this.objectService.multiPackingObject.packingCarton[0].cartonNum;
                     let checking = this.checkAssemblyPackingRules(line.assemblyItemId, line.itemId, line.qtyPacked);
                     if (checking) {
                        this.objectService.multiPackingObject.packingCarton[0].packList.push(line);
                        let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId == line.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
                        let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemId == line.itemId && x.assemblyItemId);
                        this.computeAssemblyPackingAssignment(line.qtyPacked, outstandingLines, packListLines);
                     } else {
                        allLinesDuplicated = false;
                     }
                  })
                  if (!allLinesDuplicated) {
                     if (this.configMPAShowAlertToBlockInvalidAction) {
                        await this.presentAlert("Control Validation", "", "Complete duplication is not possible due to quantity control.");
                     } else {
                        this.toastService.presentToast("Control Validation", "Complete duplication is not possible due to quantity control.", "top", "warning", 1000);
                     }
                     break;
                  }
               } else {
                  duplicatedList.forEach(line => {
                     line.multiPackingLineId = 0;
                     line.multiPackingId = this.objectService.header.multiPackingId;
                     line.cartonNum = this.objectService.multiPackingObject.packingCarton[0].cartonNum;
                  })
                  this.objectService.multiPackingObject.packingCarton[0].packList = [...duplicatedList];
               }
            } else {
               this.toastService.presentToast("System Error", "Unable to locate Pack List.", "top", "danger", 1000);
            }
         }
      }
   }

   async presentAlert(header: string, subHeader: string, message: string) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: header,
         subHeader: subHeader,
         message: message,
         buttons: [{
            text: "Ok",
            cssClass: "success",
            handler: () => {
               this.barcodescaninput.setFocus();
            },
         }]
      });
      await alert.present();
   }

}
