import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, IonPopover, NavController, ViewDidEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CurrentInboundAssignment, CurrentInboundList, InboundLineForWD, MultiInboundCarton, MultiInboundObject, MultiInboundRoot } from 'src/app/modules/transactions/models/inbound-scan';
import { InboundScanService } from 'src/app/modules/transactions/services/inbound-scan.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-inbound-scan-item',
   templateUrl: './inbound-scan-item.page.html',
   styleUrls: ['./inbound-scan-item.page.scss'],
})
export class InboundScanItemPage implements OnInit, ViewDidEnter {

   showItemList: boolean = false;

   constructor(
      public objectService: InboundScanService,
      private configService: ConfigService,
      private commonService: CommonService,
      private authService: AuthService,
      private toastService: ToastService,
      private alertController: AlertController,
      private navController: NavController
   ) { }

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   ionViewDidEnter(): void {
      try {
         this.barcodescaninput.setFocus();
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
      if (this.objectService.multiInboundObject.inboundCarton.length === 0) {
         this.addCarton();
      } else {
         this.selectedCartonNum = this.objectService.multiInboundObject.inboundCarton[0].cartonNum;
      }
   }

   selectedCartonNum: number = 0;
   addCarton(autoSelectCarton: boolean = true) {
      let nextCartonNum = this.objectService.multiInboundObject.inboundCarton.length > 0 ? this.objectService.multiInboundObject.inboundCarton[0].cartonNum + 1 : 1;
      let newPickList: CurrentInboundList[] = [];
      let newCarton: MultiInboundCarton = {
         cartonNum: nextCartonNum,
         inboundList: newPickList
      };
      this.objectService.multiInboundObject.inboundCarton.unshift(newCarton);
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
                        if (this.objectService.header.isWithDoc) {
                           await this.objectService.multiInboundObject.inboundCarton.find(r => Number(this.selectedCartonNum) === Number(r.cartonNum)).inboundList.forEach(item => {
                              this.resetOutstandingListQuantityCurrent(item);
                           })
                           this.objectService.multiInboundObject.inboundCarton = this.objectService.multiInboundObject.inboundCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        } else {
                           this.objectService.multiInboundObject.inboundCarton = this.objectService.multiInboundObject.inboundCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        }
                        this.selectedCartonNum = this.objectService.multiInboundObject.inboundCarton.length > 0 ? this.objectService.multiInboundObject.inboundCarton[0].cartonNum : null;
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

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (this.objectService.multiInboundObject.inboundCarton.length === 0) {
            this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
         } else {
            if (event) {
               if (this.objectService.header.isWithDoc) {
                  for await (const r of event) {
                     let isBlock: boolean = false;
                     isBlock = await this.validateNewItemConversion(r);
                     if (!isBlock) {
                        await this.runInboundEngine(r, ((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1));
                     }
                  }
               } else {
                  if (event && event.length > 0 && event.filter(r => r.typeCode === "AS")?.length > 0) {
                     this.toastService.presentToast("Assembly Item Detected", `Item ${event.filter(r => r.typeCode === "AS").flatMap(r => r.itemCode).join(", ")} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
                     return;
                  }
                  for await (const r of event) {
                     let isBlock: boolean = false;
                     isBlock = await this.validateNewItemConversion(r);
                     if (!isBlock) {
                        let inboundCartonTag = this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                        if (inboundCartonTag.inboundList.length > 0 && r.itemBarcode === inboundCartonTag?.inboundList[0]?.itemBarcode) {
                           let firstInboundLine = inboundCartonTag.inboundList[0];
                           firstInboundLine.qtyScanned += 1;
                        } else {
                           let newLine = this.assignItemFoundToNewLine(r, ((r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1));
                           newLine.cartonNum = inboundCartonTag.cartonNum;
                           inboundCartonTag.inboundList.unshift(newLine);
                        }
                     }
                  }
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   assignItemFoundToNewLine(itemFound: TransactionDetail, inputQty: number) {
      let newLine: CurrentInboundList = {
         multiInboundLineId: 0,
         multiInboundId: 0,
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
         qtyScanned: inputQty,
         sequence: 0,
         lineUDDate: null,
         masterUDGroup1: this.objectService.header.masterUDGroup1 ? this.objectService.header.masterUDGroup1 : null,
         masterUDGroup2: this.objectService.header.masterUDGroup2 ? this.objectService.header.masterUDGroup2 : null,
         masterUDGroup3: this.objectService.header.masterUDGroup3 ? this.objectService.header.masterUDGroup3 : null,
         locationId: this.objectService.header.locationId ? this.objectService.header.locationId : null,
         cartonNum: 0,
         deactivated: false,
         variations: []
      }
      return newLine;
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
               await this.onItemAdd([itemFound]);
               // if (this.objectService.header.isWithDoc) {
               //    await this.runInboundEngine(itemFound, 1);
               // } else {
               //    // await this.insertPackingLineWithoutSo(itemFound, 1);
               // }
               if (this.objectService.configMobileScanItemContinuous) {
                  await this.barcodescaninput.startScanning();
               }
            } else {
               this.toastService.presentToast("Item Not Found", "", "top", "warning", 1000);
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
                     itemBarcode: found_barcode.barcode
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

   runInboundEngine(itemFound: TransactionDetail, inputQty: number) {
      let outstandingLines = this.objectService.multiInboundObject.outstandingInboundList.filter(x => x.itemSku == itemFound.itemSku);
      let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
      let osTotalQtyScanned = outstandingLines.reduce((sum, current) => sum + current.qtyScanned, 0);
      let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
      let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyScanned - osTotalQtyCurrent;
      switch (this.objectService.inbountQtyControl.toUpperCase()) {
         //No control
         case "N":
            this.insertInboundLine(itemFound, inputQty, outstandingLines, "N");
            break;
         //Not allow pick quantity more than Document quantity
         case "Y":
            if (outstandingLines.length > 0) {
               if (osTotalAvailableQty >= inputQty) {
                  this.insertInboundLine(itemFound, inputQty, outstandingLines, "Y");
                  let totalQtyCurrent = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                  let totalQtyScanned = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyScanned, 0);
                  let totalQtyRequest = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyRequest, 0);
                  if (totalQtyCurrent + totalQtyScanned == totalQtyRequest) {
                     this.toastService.presentToast("Complete Notification", "Scanning for selected Document is completed.", "top", "success", 1000);
                  }
               } else {
                  this.toastService.presentToast("Control Validation", "Input quantity exceeded Document quantity.", "top", "warning", 1000);
               }
            } else {
               this.toastService.presentToast("Control Validation", "Item is not available in the selected Document.", "top", "warning", 1000);
            }
            break;
      }
   }

   insertInboundLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: InboundLineForWD[], inbountQtyControl: string) {
      //When scanning the same item, add the quantity to first line, instead of adding new row
      let inboundCartonTag = this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (inboundCartonTag.inboundList.length > 0 && itemFound.itemBarcode == inboundCartonTag?.inboundList[0]?.itemBarcode) {
         let firstInboundLine = inboundCartonTag.inboundList[0];
         firstInboundLine.qtyScanned += inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = inboundCartonTag.cartonNum;
         inboundCartonTag.inboundList.unshift(newLine);
      }
      //Filter out currentPickList with same item
      let inboundListLines = this.objectService.multiInboundObject.inboundCarton.flatMap(x => x.inboundList).filter(x => x.itemSku == itemFound.itemSku);
      this.computeInboundAssignment(inputQty, outstandingLines, inboundListLines);
   }

   computeInboundAssignment(inputQty: number, outstandingLines: InboundLineForWD[], currentPickListLines: CurrentInboundList[]) {
      //Update left side qtyCurrent
      for (let os of outstandingLines) {
         let availableQty = os.qtyRequest - os.qtyScanned - os.qtyCurrent;
         if (availableQty >= inputQty) {
            os.qtyCurrent += inputQty;
            inputQty = 0;
         } else {
            os.qtyCurrent += availableQty;
            inputQty -= availableQty
         }
      }
      //This condition only applies to picking without control. User will be able to overscan  
      if (inputQty != 0) {
         outstandingLines[0].qtyCurrent += inputQty;
         inputQty = 0;
      }
      this.mapInboundAssignment(outstandingLines, currentPickListLines);
   }

   mapInboundAssignment(outstandingLines: InboundLineForWD[], currentPickListLines: CurrentInboundList[]) {
      currentPickListLines.forEach(x => {
         x.variations = [];
      })
      currentPickListLines.reverse();
      let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
      currentPickListLines.forEach(current => {
         let balanceQty: number = current.qtyScanned;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            let currentInboundAssignment: CurrentInboundAssignment = {
               qtyScanned: os.qtyCurrent,
               inboundDocId: os.inboundDocId,
               inboundDocLineId: os.inboundDocLineId,
               inboundDocVariationId: os.inboundDocVariationId
            }
            if (balanceQty != 0) {
               if (balanceQty == os.qtyCurrent) {
                  currentInboundAssignment.qtyScanned = balanceQty;
                  current.variations.push(currentInboundAssignment);
                  duplicateOutstandingLines.shift();
                  balanceQty = 0;
                  break;
               }
               else if (balanceQty > os.qtyCurrent) {
                  currentInboundAssignment.qtyScanned = os.qtyCurrent;
                  current.variations.push(currentInboundAssignment);
                  balanceQty -= os.qtyCurrent;
                  rightLoopCount++;
               }
               else if (balanceQty < os.qtyCurrent) {
                  currentInboundAssignment.qtyScanned = balanceQty;
                  current.variations.push(currentInboundAssignment);
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

   onCartonNumClicked(cartonNum: number) {
      if (cartonNum.toString() === this.selectedCartonNum.toString()) {

      }
   }

   getCartonItems() {
      if (this.objectService.multiInboundObject && this.objectService.multiInboundObject.inboundCarton && this.objectService.multiInboundObject.inboundCarton.length > 0 && Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList;
      }
      return [];
   }

   /* #region update carton line qty */

   async editCartonLine(item: CurrentInboundList) {
      await this.cloneInboundQty(item);
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         backdropDismiss: false,
         header: "Enter Quantity",
         inputs: [
            {
               name: "inputQty",
               type: "number",
               placeholder: "Enter Quantity",
               value: Number(item.qtyScanned),
               min: 1
            }
         ],
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "success",
               handler: async (data) => {
                  item.qtyScanned = Number(data.inputQty);
                  if (this.objectService.header.isWithDoc) {
                     this.updateInboundQty(item);
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

   clonedQty: { [s: number]: CurrentInboundList } = {};
   cloneInboundQty(item: CurrentInboundList) {
      let rowIndex = this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList.findIndex(x => x === item);
      this.clonedQty[rowIndex] = { ...item };
   }

   updateInboundQty(item: CurrentInboundList) {
      let outstandingLines = this.objectService.multiInboundObject.outstandingInboundList.filter(x => x.itemSku == item.itemSku);
      let inboundListLines = this.objectService.multiInboundObject.inboundCarton.flatMap(x => x.inboundList).filter(x => x.itemSku == item.itemSku);
      let rowIndex = this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList.findIndex(x => x === item);
      let inputQty: number = item.qtyScanned - this.clonedQty[rowIndex].qtyScanned
      if (outstandingLines.length > 0) {
         let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
         let osTotalQtyScanned = outstandingLines.reduce((sum, current) => sum + current.qtyScanned, 0);
         let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
         let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyScanned - osTotalQtyCurrent;
         switch (this.objectService.inbountQtyControl) {
            //No control
            case "N":
               this.resetOutstandingListQuantityCurrent(item);
               this.computeInboundAssignment(item.qtyScanned, outstandingLines, inboundListLines);
               break;
            //Not allow pack quantity more than Document quantity
            case "Y":
               if (osTotalAvailableQty >= inputQty) {
                  this.resetOutstandingListQuantityCurrent(item);
                  this.computeInboundAssignment(item.qtyScanned, outstandingLines, inboundListLines);
                  let totalQtyCurrent = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                  let totalQtyPacked = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyScanned, 0);
                  let totalQtyRequest = this.objectService.multiInboundObject.outstandingInboundList.reduce((sum, current) => sum + current.qtyRequest, 0);
                  if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
                     this.toastService.presentToast("Complete Notification", "Scanning for selected Document is completed.", "top", "success", 1000);
                  }
               } else {
                  this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList[rowIndex] = this.clonedQty[rowIndex];
                  this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList = [...this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).inboundList];
                  this.toastService.presentToast("Control Validation", "Input quantity exceeded Document quantity.", "top", "warning", 1000);
               }
               break;
         }
      } else {
         this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
      }
      delete this.clonedQty[rowIndex];
   }

   /* #endregion */

   async deleteCartonLine(rowIndex: number, item: CurrentInboundList) {
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
                        let packingCartonTag = this.objectService.multiInboundObject.inboundCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                        if (packingCartonTag) {
                           let rowIndex = packingCartonTag.inboundList.findIndex(x => x === item);
                           packingCartonTag.inboundList.splice(rowIndex, 1);
                           packingCartonTag.inboundList = [...packingCartonTag.inboundList];
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

   resetOutstandingListQuantityCurrent(item: CurrentInboundList) {
      if (item.variations) {
         item.variations.forEach(inner => {
            let findOs = this.objectService.multiInboundObject.outstandingInboundList.find(x => x.inboundDocVariationId == inner.inboundDocVariationId);
            if (findOs) {
               findOs.qtyCurrent -= inner.qtyScanned;
            }
         })
      }
   }

   async saveButtonClicked() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     if (this.objectService.header.multiInboundId === 0) {
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

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/inbound-scan/inbound-scan-header");
      } catch (e) {
         console.error(e);
      }
   }

   insertObject() {
      let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiInboundObject);
      if (this.objectService.allowDocumentWithEmptyLine === "N") {
         if (newObjectDto.details.length < 1) {
            this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "warning", 1000);
            return;
         }
      }
      this.objectService.insertObject(newObjectDto).subscribe(response => {
         if (response.status == 201) {
            let object = response.body as MultiInboundRoot;
            this.toastService.presentToast("Insert Complete", "New inbound has been created.", "top", "success", 1000);
            this.objectService.resetVariables();
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: object.header.multiInboundId
               }
            }
            this.navController.navigateRoot("/transactions/inbound-scan/inbound-scan-detail", navigationExtras);
         }
      }, error => {
         console.error(error);
      });
   }

   updateObject() {
      let editObjectDto = this.transformObjectToTrxDto(this.objectService.multiInboundObject);
      if (this.objectService.allowDocumentWithEmptyLine === "N") {
         if (editObjectDto.details.length < 1) {
            this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "warning", 1000);
            return;
         }
      }
      this.objectService.updateObject(editObjectDto).subscribe(response => {
         if (response.status == 201) {
            let object = response.body as MultiInboundRoot;
            this.toastService.presentToast("Update Complete", "Inbound has been updated.", "top", "success", 1000);
            this.objectService.resetVariables();
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: object.header.multiInboundId
               }
            }
            this.navController.navigateRoot("/transactions/inbound-scan/inbound-scan-detail", navigationExtras);
         }
      }, error => {
         console.error(error);
      });
   }

   sendForDebug() {
      let trxDto = this.transformObjectToTrxDto(this.objectService.multiInboundObject);
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

   transformObjectToTrxDto(multiInboundObject: MultiInboundObject): MultiInboundRoot {
      if (this.objectService.allowDocumentWithEmptyLine === "N") {
         let findEmptyLine: any[] = []
         multiInboundObject.inboundCarton.forEach(carton => {
            findEmptyLine = [...findEmptyLine, ...carton.inboundList.filter(x => x.qtyScanned === null || x.qtyScanned === undefined)];
         })
         if (findEmptyLine.length > 0) {
            this.toastService.presentToast("Control Validation", "Please input quantity for all lines.", "top", "warning", 1000);
            return;
         }
      }
      this.objectService.header.totalCarton = multiInboundObject.inboundCarton.length;
      let trxDto: MultiInboundRoot = {
         header: this.objectService.header,
         details: multiInboundObject.inboundCarton,
         otp: null,
         outstandingInboundList: multiInboundObject.outstandingInboundList
      };
      return trxDto;
   }

   validateNewItemConversion(itemList: TransactionDetail) {
      if (itemList.newItemId && itemList.newItemEffectiveDate && this.commonService.convertUtcDate(itemList.newItemEffectiveDate) <= this.objectService.header.trxDate) {
         let newItemCode = this.configService.item_Masters.find(r => r.id === itemList.newItemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${itemList.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(itemList.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.objectService.systemWideBlockConvertedCode) {
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

}
