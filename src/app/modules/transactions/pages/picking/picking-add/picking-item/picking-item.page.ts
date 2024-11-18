import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonPopover, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { ItemListMultiUom, LineAssembly, TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CurrentPickList, MultiPickingCarton, MultiPickingObject, MultiPickingRoot, PickingLineVariation, SalesOrderLineForWD } from 'src/app/modules/transactions/models/picking';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { format } from 'date-fns';
import { Capacitor } from '@capacitor/core';

@Component({
   selector: 'app-picking-item',
   templateUrl: './picking-item.page.html',
   styleUrls: ['./picking-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePicking' }]
})
export class PickingItemPage implements OnInit, ViewDidEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   showItemList: boolean = false;

   constructor(
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      public objectService: PickingService,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
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
      if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
         this.addCarton();
      } else {
         this.selectedCartonNum = this.objectService.multiPickingObject.pickingCarton[0].cartonNum;
      }
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   pickingQtyControl: string = "0";
   systemWideScanningMethod: string;
   systemWideBlockConvertedCode: boolean;
   pickPackAllowCopyCode: boolean = false;
   mobilePickPackAutoFocusQtyUponScan: boolean = false;
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
         let pickingControl = this.moduleControl.find(x => x.ctrlName === "PickingQtyControl");
         if (pickingControl != undefined) {
            this.pickingQtyControl = pickingControl.ctrlValue;
         }
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
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

   runPickingEngine(itemFound: TransactionDetail, inputQty: number) {
      if (itemFound) {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0);
         let findMainCodeScanned = findAssemblyItem.find(x => x.itemId === itemFound.itemId);
         if (findMainCodeScanned) {
            this.toastService.presentToast("Control Validation", "Please scan component item code instead of main assembly code.", "top", "warning", 1000);
            return;
         }
         let outstandingLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemSku === itemFound.itemSku);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
            switch (this.pickingQtyControl.toUpperCase()) {
               //No control
               case "N":
                  this.insertPickingLine(itemFound, inputQty, outstandingLines, "N");
                  break;
               //Not allow pick quantity more than SO quantity
               case "Y":
                  if (osTotalAvailableQty >= inputQty) {
                     this.insertPickingLine(itemFound, inputQty, outstandingLines, "Y");
                     let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPicked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPicked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     let reinsertLine: boolean = false;
                     if (this.configSystemWideActivateMultiUOM && this.configMultiPackAutoTransformLooseUom) {
                        reinsertLine = this.transformItemScannedUom(itemFound, inputQty);
                     }
                     if (!reinsertLine) {
                        let operationSuccess = this.runAssemblyPickingEngine(itemFound, inputQty, findAssemblyItem);
                        if (!operationSuccess) {
                           this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
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
               let operationSuccess = this.runAssemblyPickingEngine(itemFound, inputQty, findAssemblyItem);
               if (!operationSuccess) {
                  this.toastService.presentToast("Control Validation", "Item is not available in the selected Sales Order.", "top", "warning", 1000);
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
               let findOsLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemId == itemFound.itemId);
               if (findOsLines.length > 0) {
                  for (let uom of otherItemUom) {
                     let transformQty = inputQty * currentItemUom.ratio / uom.ratio;
                     if (Number.isInteger(transformQty)) {
                        //To futher enhance this part
                        //Checking on multiple lines and consolidate the qty
                        let findOsLinesWithQty = findOsLines.filter(x => ((x.qtyRequest??0) - (x.qtyPicked??0) - (x.qtyCurrent??0)) >= transformQty);
                        if (findOsLinesWithQty.length > 0) {
                           itemFound.itemBarcode = currentItemUom.itemSku;
                           itemFound.itemSku = uom.itemSku;
                           itemFound.itemUomId = uom.itemUomId;
                           this.runPickingEngine(itemFound, transformQty);
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
                        let findOsLinesWithQty = assemblyOutstandingLines.filter(x => ((x.qtyRequest??0) - (x.qtyPicked??0) - (x.qtyCurrent??0)) >= transformQty);
                        if (findOsLinesWithQty.length > 0) {
                           itemFound.itemBarcode = currentItemUom.itemSku;
                           itemFound.itemSku = uom.itemSku;
                           itemFound.itemUomId = uom.itemUomId;
                           this.runAssemblyPickingEngine(itemFound, transformQty, findAssemblyItem);
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

   runAssemblyPickingEngine(itemFound: TransactionDetail, inputQty: number, findAssemblyItem: SalesOrderLineForWD[]) {
      let findComponentItem: LineAssembly;
      if (findAssemblyItem) {
         let anyOperationSuccess: boolean = false;
         for (let item of findAssemblyItem) {
            let componentOperationSuccess: boolean = false;
            findComponentItem = item.assembly.find(x => x.itemComponentId === itemFound.itemId);
            if (findComponentItem) {
               let mainItemFound = this.objectService.multiPickingObject.outstandingPickList.find(x => x.itemId === findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
               let outstandingLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemId === findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);               
               let assemblyOutstandingLines = outstandingLines.flatMap(x => x.assembly).filter(y => y.itemComponentId == itemFound.itemId && y.itemUomId == itemFound.itemUomId);
               if (outstandingLines.length > 0) {
                  let osTotalQtyRequest = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyRequest ?? 0), 0);
                  let osTotalQtyPicked = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyPicked ?? 0), 0);
                  let osTotalQtyCurrent = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                  let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
                  switch (this.pickingQtyControl.toUpperCase()) {
                     //No control
                     case "N":
                        this.insertAssemblyPickingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                        componentOperationSuccess = true;
                        break;
                     //Not allow pick quantity more than SO quantity
                     case "Y":
                        if (osTotalAvailableQty >= inputQty) {
                           this.insertAssemblyPickingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                           componentOperationSuccess = true;
                           let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                           let totalQtyPicked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
                           let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
                           if (totalQtyCurrent + totalQtyPicked === totalQtyRequest) {
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
            }
         }
         if (anyOperationSuccess) {
            return true;
         } else {
            this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
            return false;
         }
      } else {
         return false;
      }
   }

   insertAssemblyPickingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], assemblyItemId: number) {
      //When scanning the same item, add the quantity to first line, instead of adding new row
      let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (pickingCartonTag && pickingCartonTag.pickList.length > 0 && itemFound.itemBarcode && itemFound.itemBarcode === pickingCartonTag?.pickList[0]?.itemBarcode && pickingCartonTag?.pickList[0]?.assemblyItemId === assemblyItemId) {
         let firstPickingLine = pickingCartonTag.pickList[0];
         firstPickingLine.qtyPicked = (firstPickingLine.qtyPicked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty, assemblyItemId);
         newLine.cartonNum = pickingCartonTag.cartonNum;
         pickingCartonTag.pickList.unshift(newLine);
      }

      //Filter out currentPickList with same item
      let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemId === itemFound.itemId && x.assemblyItemId);
      this.computeAssemblyPickingAssignment(inputQty, outstandingLines, pickListLines);
   }

   computeAssemblyPickingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPickListLines: CurrentPickList[]) {
      //Update left side qtyCurrent
      for (let os of outstandingLines) {
         for (let assembly of os.assembly) {
            if (assembly.itemComponentId === currentPickListLines[0].itemId) {
               let availableQty = (assembly.qtyRequest ?? 0) - (assembly.qtyPicked ?? 0) - (assembly.qtyCurrent ?? 0);
               if (availableQty >= inputQty) {
                  console.log("availableQty >= inputQty");
                  assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) + inputQty;
                  inputQty = 0;
               } else {
                  console.log("availableQty < inputQty");
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
         let findFirstAssembly = outstandingLines[0].assembly.find(x => x.itemComponentId === currentPickListLines[0].itemId);
         if (findFirstAssembly) {
            findFirstAssembly.qtyCurrent = (findFirstAssembly.qtyCurrent ?? 0) + inputQty;
            inputQty = 0;
         }
      }
      this.mapAssemblyPickingAssignment(outstandingLines, currentPickListLines);
   }

   mapAssemblyPickingAssignment(outstandingLines: SalesOrderLineForWD[], currentPickListLines: CurrentPickList[]) {
      currentPickListLines = currentPickListLines.filter(x => x.assemblyItemId === outstandingLines[0].itemId)
      currentPickListLines.forEach(x => {
         x.variations = [];
      })
      currentPickListLines.reverse();
      let duplicateOutstandingLines: SalesOrderLineForWD[] = JSON.parse(JSON.stringify(outstandingLines));
      currentPickListLines.forEach(current => {
         let balanceQty: number = current.qtyPicked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            for (let assembly of os.assembly) {
               if (assembly.itemComponentId === currentPickListLines[0].itemId && assembly.assemblyItemId === currentPickListLines[0].assemblyItemId) {
                  let currentPickAssignment: PickingLineVariation = {
                     qtyPicked: assembly.qtyCurrent,
                     salesOrderId: os.salesOrderId,
                     salesOrderLineId: os.salesOrderLineId,
                     salesOrderVariationId: os.salesOrderVariationId
                  }
                  if (balanceQty != 0) {
                     if (balanceQty === assembly.qtyCurrent) {
                        currentPickAssignment.qtyPicked = balanceQty;
                        current.variations.push(currentPickAssignment);
                        duplicateOutstandingLines.shift();
                        balanceQty = 0;
                        break;
                     }
                     else if (balanceQty > assembly.qtyCurrent) {
                        currentPickAssignment.qtyPicked = assembly.qtyCurrent;
                        current.variations.push(currentPickAssignment);
                        balanceQty = (balanceQty ?? 0) - (assembly.qtyCurrent ?? 0);
                        rightLoopCount++;
                     }
                     else if (balanceQty < assembly.qtyCurrent) {
                        currentPickAssignment.qtyPicked = balanceQty;
                        current.variations.push(currentPickAssignment);
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

   insertPickingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], pickingQtyControl: string) {
      // When scanning the same item, add the quantity to first line, instead of adding new row
      let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (pickingCartonTag && pickingCartonTag.pickList.length > 0 && itemFound.itemBarcode === pickingCartonTag?.pickList[0]?.itemBarcode && !pickingCartonTag.pickList[0].assemblyItemId) {
         let firstPickingLine = pickingCartonTag.pickList[0];
         firstPickingLine.qtyPicked = (firstPickingLine.qtyPicked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = pickingCartonTag.cartonNum;
         pickingCartonTag.pickList.unshift(newLine);
      }
      // Filter out currentPickList with same item
      let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemSku === itemFound.itemSku && !x.assemblyItemId);
      this.computePickingAssignment(inputQty, outstandingLines, pickListLines);
      // this.setDataEntryState();
      // this.objectForm.markAsDirty();
      // this.barcodeScan.setInputFocus();
   }

   assignItemFoundToNewLine(itemFound: any, inputQty: number, assemblyItemId?: number) {
      let newLine: CurrentPickList = {
         multiPickingLineId: 0,
         multiPickingId: this.objectService.header.multiPickingId,
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
         qtyPicked: inputQty,
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

   computePickingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPickListLines: CurrentPickList[]) {
      // Update left side qtyCurrent
      for (let os of outstandingLines) {
         let availableQty = os.qtyRequest - os.qtyPicked - os.qtyCurrent;
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
      this.mapPickingAssignment(outstandingLines, currentPickListLines);
   }

   mapPickingAssignment(outstandingLines: SalesOrderLineForWD[], currentPickListLines: CurrentPickList[]) {
      currentPickListLines.forEach(x => {
         x.variations = [];
      })
      currentPickListLines.reverse();
      let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
      currentPickListLines.forEach(current => {
         let balanceQty: number = current.qtyPicked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            let currentPickAssignment: PickingLineVariation = {
               qtyPicked: os.qtyCurrent,
               salesOrderId: os.salesOrderId,
               salesOrderLineId: os.salesOrderLineId,
               salesOrderVariationId: os.salesOrderVariationId
            }
            if (balanceQty != 0) {
               if (balanceQty === os.qtyCurrent) {
                  currentPickAssignment.qtyPicked = balanceQty;
                  current.variations.push(currentPickAssignment);
                  duplicateOutstandingLines.shift();
                  balanceQty = 0;
                  break;
               }
               else if (balanceQty > os.qtyCurrent) {
                  currentPickAssignment.qtyPicked = os.qtyCurrent;
                  current.variations.push(currentPickAssignment);
                  balanceQty = (balanceQty ?? 0) - (os.qtyCurrent ?? 0);
                  rightLoopCount++;
               }
               else if (balanceQty < os.qtyCurrent) {
                  currentPickAssignment.qtyPicked = balanceQty;
                  current.variations.push(currentPickAssignment);
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

   insertPickingLineWithoutSo(itemFound: TransactionDetail, inputQty: number) {
      let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (pickingCartonTag && pickingCartonTag.pickList.length > 0 && itemFound.itemBarcode === pickingCartonTag?.pickList[0]?.itemBarcode) {
         let firstPickingLine = pickingCartonTag.pickList[0];
         firstPickingLine.qtyPicked = (firstPickingLine.qtyPicked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = pickingCartonTag.cartonNum;
         pickingCartonTag.pickList.unshift(newLine);
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
   addCarton() {
      let nextCartonNum = this.objectService.multiPickingObject.pickingCarton.length > 0 ? this.objectService.multiPickingObject.pickingCarton[0].cartonNum + 1 : 1;
      let newPickList: CurrentPickList[] = [];
      let newCarton: MultiPickingCarton = {
         cartonNum: nextCartonNum,
         pickList: newPickList
      };
      this.objectService.multiPickingObject.pickingCarton.unshift(newCarton);
      this.selectedCartonNum = nextCartonNum;
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
                           await this.objectService.multiPickingObject.pickingCarton.find(r => Number(this.selectedCartonNum) === Number(r.cartonNum)).pickList.forEach(item => {
                              this.resetOutstandingListQuantityCurrent(item);
                           })
                           this.objectService.multiPickingObject.pickingCarton = this.objectService.multiPickingObject.pickingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        } else {
                           this.objectService.multiPickingObject.pickingCarton = this.objectService.multiPickingObject.pickingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        }
                        this.selectedCartonNum = this.objectService.multiPickingObject.pickingCarton.length > 0 ? this.objectService.multiPickingObject.pickingCarton[0].cartonNum : null;
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

   async deleteCartonLine(rowIndex: number, item: CurrentPickList) {
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
                        let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                        if (pickingCartonTag) {
                           let rowIndex = pickingCartonTag.pickList.findIndex(x => x === item);
                           pickingCartonTag.pickList.splice(rowIndex, 1);
                           pickingCartonTag.pickList = [...pickingCartonTag.pickList];
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

   resetOutstandingListQuantityCurrent(item: CurrentPickList) {
      if (item.assemblyItemId) {
         let findOs = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0 && x.itemId === item.assemblyItemId);
         if (findOs.length > 0) {
            let inputQty = item.qtyPicked;
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
               let findOs = this.objectService.multiPickingObject.outstandingPickList.find(x => x.salesOrderVariationId === inner.salesOrderVariationId);
               if (findOs) {
                  findOs.qtyCurrent -= inner.qtyPicked;
               }
            })
         }
      }
   }

   getCartonItems() {
      if (Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList;
      }
      return [];
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
                     itemUomDesc: found_barcode.itemUomDesc
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

   /* #region for web testing */

   itemSearchValue: string;
   handleKeyDown(event) {
      if (event.keyCode === 13) {
         if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
            this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
         } else {
            this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
               this.itemSearchValue = null;
               if (response) {
                  if (this.objectService.header.isWithSo) {
                     await this.runPickingEngine(response, Number(1));
                  } else {
                     await this.insertPickingLineWithoutSo(response, Number(1));
                  }
               }
            }, error => {
               console.error(error);
            })
         }
         event.preventDefault();
      }
   }

   /* #endregion */

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
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
                                 await this.runPickingEngine(r, Number(res));
                                 await this.barcodescaninput.setFocus();                                 
                              }, 0);
                           })
                        } else {
                           await this.runPickingEngine(r, Number(((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1)));
                        }
                     }
                  })
               } else {
                  // Not allow to add assembly item for scanning without document
                  if (event && event.length > 0 && event.filter(r => r.typeCode === "AS")?.length > 0) {
                     this.toastService.presentToast("Assembly Item Detected", `Item ${event.filter(r => r.typeCode === "AS").flatMap(r => r.itemCode).join(", ")} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
                     return;
                  }
                  event.forEach(async r => {
                     let isBlock: boolean = false;
                     isBlock = this.validateNewItemConversion(r);
                     if (!isBlock) {
                        if (this.mobilePickPackAutoFocusQtyUponScan) {
                           await this.cartonLineQtyInput().then(async res => {
                              await this.insertPickingLineWithoutSo(r, Number(res));
                           })
                        } else {
                           await this.insertPickingLineWithoutSo(r, Number(((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1)));
                        }
                     }
                  })
               }
            }
         }
      } catch (e) {
         console.error(e);
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

   async editCartonLine(item: CurrentPickList) {
      await this.clonePickingQty(item);
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         backdropDismiss: false,
         header: "Enter Quantity",
         inputs: [
            {
               name: "inputQty",
               type: "number",
               placeholder: "Enter Quantity",
               value: Number(item.qtyPicked),
               min: 1
            }
         ],
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "success",
               handler: async (data) => {
                  item.qtyPicked = Number(data.inputQty);
                  if (this.objectService.header.isWithSo) {
                     this.updatePickingQty(item);
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

   clonedQty: { [s: number]: CurrentPickList } = {};
   clonePickingQty(item: CurrentPickList) {
      let rowIndex = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList.findIndex(x => x === item);
      this.clonedQty[rowIndex] = { ...item };
   }

   updatePickingQty(item: CurrentPickList) {
      let rowIndex = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum))?.pickList.findIndex(x => x === item);
      let inputQty: number = item.qtyPicked - this.clonedQty[rowIndex].qtyPicked
      if (!item.assemblyItemId) {
         let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemSku === item.itemSku && !x.assemblyItemId);
         let outstandingLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemSku === item.itemSku);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
            switch (this.pickingQtyControl) {
               //No control
               case "N":
                  this.resetOutstandingListQuantityCurrent(item);
                  this.computePickingAssignment(item.qtyPicked, outstandingLines, pickListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "Y":
                  if (osTotalAvailableQty >= inputQty) {
                     this.resetOutstandingListQuantityCurrent(item);
                     this.computePickingAssignment(item.qtyPicked, outstandingLines, pickListLines);
                     let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     if (this.objectService.multiPickingObject.pickingCarton.findIndex(r => Number(r.cartonNum) === Number(this.selectedCartonNum)) > -1) {
                        this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList[rowIndex] = this.clonedQty[rowIndex];
                        this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList = [...this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList];
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
         }
      } else {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemId === item.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
         let outstandingLines = findAssemblyItem.flatMap(x => x.assembly).filter(y => y.itemComponentId === item.itemId);
         let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemId === item.itemId && x.assemblyItemId === outstandingLines[0].assemblyItemId);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
            switch (this.pickingQtyControl) {
               //No control
               case "N":
                  let clonedItem = JSON.parse(JSON.stringify(item));
                  let aggregatedQtyPicked = pickListLines.reduce((sum, current) => sum + current.qtyPicked, 0);
                  clonedItem.qtyPicked = aggregatedQtyPicked - item.qtyPicked + this.clonedQty[rowIndex].qtyPicked;
                  this.resetOutstandingListQuantityCurrent(clonedItem);
                  this.computeAssemblyPickingAssignment(aggregatedQtyPicked, findAssemblyItem, pickListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "Y":
                  if (osTotalAvailableQty >= inputQty) {
                     let clonedItem = JSON.parse(JSON.stringify(item));
                     let aggregatedQtyPicked = pickListLines.reduce((sum, current) => sum + current.qtyPicked, 0);
                     clonedItem.qtyPicked = aggregatedQtyPicked - item.qtyPicked + this.clonedQty[rowIndex].qtyPicked;
                     this.resetOutstandingListQuantityCurrent(clonedItem);
                     this.computeAssemblyPickingAssignment(aggregatedQtyPicked, findAssemblyItem, pickListLines);
                     let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked === totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     if (this.objectService.multiPickingObject.pickingCarton.findIndex(r => Number(r.cartonNum) === Number(this.selectedCartonNum)) > -1) {
                        this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList[rowIndex] = this.clonedQty[rowIndex];
                        this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList = [...this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList];
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
         }
      }
      delete this.clonedQty[rowIndex];
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
   selectedItemId: number = null;
   showImageModal(itemCode: string) {
      this.selectedItemId = this.objectService.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode).itemId;
      this.imageUrl = null;
      if (this.selectedItemId) {
         this.objectService.getItemImage(this.selectedItemId).subscribe(response => {
            if (response && response.length > 0) {
               this.imageUrl = "data:image/png;base64, " + response[0].imageSource;
               this.isImageModalOpen = true;
            }
         }, error => {
            console.error(error);
         })
      }
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

   async onDoneScanning(event) {
      try {
         if (event) {
            let itemFound = await this.validateBarcode(event);
            if (itemFound) {
               if (this.objectService.header.isWithSo) {
                  await this.runPickingEngine(itemFound, 1);
               } else {
                  await this.insertPickingLineWithoutSo(itemFound, 1);
               }
            } else {
               this.toastService.presentToast("Item Not Found", "", "top", "warning", 1000);
            }
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
                     if (this.objectService.header.multiPickingId === 0) {
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

   insertObject() {
      try {
         let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiPickingObject);
         if (!this.pickPackAllowAssemblyPartialSave) {
            let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPickingObject);
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
         this.objectService.insertObject(newObjectDto).subscribe(response => {
            if (response.status === 201) {
               let object = response.body as MultiPickingRoot;
               this.toastService.presentToast("Insert Complete", "New picking has been created.", "top", "success", 1000);
               this.objectService.resetVariables();
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPickingId
                  }
               }
               this.navController.navigateRoot("/transactions/picking/picking-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   updateObject() {
      try {
         let updateObjectDto = this.transformObjectToTrxDto(this.objectService.multiPickingObject);
         if (!this.pickPackAllowAssemblyPartialSave) {
            let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPickingObject);
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
         this.objectService.updateObject(updateObjectDto).subscribe(response => {
            if (response.status === 201) {
               let object = response.body as MultiPickingRoot;
               this.toastService.presentToast("Update Complete", "Picking has been updated.", "top", "success", 1000);
               this.objectService.resetVariables();
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPickingId
                  }
               }
               this.navController.navigateRoot("/transactions/picking/picking-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      // this.modalController.dismiss();
      try {
         this.navController.navigateBack("/transactions/picking/picking-header");
      } catch (e) {
         console.error(e);
      }
      // this.modalController.dismiss(this.filters);
   }

   transformObjectToTrxDto(multiPickingObject: MultiPickingObject): MultiPickingRoot {
      if (this.allowDocumentWithEmptyLine === "N") {
         multiPickingObject.pickingCarton.forEach(carton => {
            carton.pickList = carton.pickList.filter(x => x.qtyPicked > 0);
         })
      }
      this.objectService.header.totalCarton = multiPickingObject.pickingCarton.length;
      if (!this.objectService.header.businessModelType) {                              
         var lookupValue = this.objectService.customerMasterList?.find(e => e.id === this.objectService.header.customerId);
         if (lookupValue) {
            this.objectService.header.businessModelType = lookupValue.attribute5;
         }
      }
      let trxDto: MultiPickingRoot = {
         header: this.objectService.header,
         details: multiPickingObject.pickingCarton,
         otp: null,
         outstandingPickList: multiPickingObject.outstandingPickList
      };
      return trxDto;
   }

   checkAssemblyFullScan(multiPickingObject: MultiPickingObject) {
      let isFullScan: boolean = true;
      multiPickingObject.outstandingPickList.forEach(os => {
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
      let trxDto = this.transformObjectToTrxDto(this.objectService.multiPickingObject);
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
         itemQty = rowData.qtyRequest - (rowData.qtyCurrent ?? 0) - rowData.qtyPicked;
         await this.runPickingEngine(udItemList, itemQty);
      }
   }

}
