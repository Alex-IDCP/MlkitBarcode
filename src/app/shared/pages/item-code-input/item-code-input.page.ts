import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MasterListDetails } from '../../models/master-list-details';
import { ModuleControl } from '../../models/module-control';
import { AlertController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../services/common.service';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail, VariationDetail } from '../../models/variation-detail';

@Component({
   selector: 'app-item-code-input',
   templateUrl: './item-code-input.page.html',
   styleUrls: ['./item-code-input.page.scss'],
})
export class ItemCodeInputPage implements OnInit, ViewDidEnter, ViewWillEnter {

   @Input() itemVariationXMasterList: MasterListDetails[] = [];
   @Input() itemVariationYMasterList: MasterListDetails[] = [];
   @Input() itemUomMasterList: MasterListDetails[] = [];

   moduleControl: ModuleControl[];
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   systemWideScanningMethod: string;
   systemWideBlockConvertedCode: boolean = false;

   @Output() onItemAdd = new EventEmitter<TransactionDetail>();

   constructor(
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private alertController: AlertController
   ) { }

   ionViewWillEnter(): void {
      this.setFocus();
   }

   ionViewDidEnter(): void {
      this.setFocus();
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   configSystemWideActivateMultiUOM: boolean = false;
   configItemVariationShowMatrix: boolean = false;
   configItemVariationMatrixShowCodeDesc: boolean = false;
   configSystemWideBarcodeScanBeep: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
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

         let itemVariationShowMatrix = this.moduleControl.find(x => x.ctrlName === "ItemVariationShowMatrix");
         if (itemVariationShowMatrix && itemVariationShowMatrix.ctrlValue.toUpperCase() === "Y") {
            this.configItemVariationShowMatrix = true;
         } else {
            this.configItemVariationShowMatrix = false;
         }

         let itemVariationMatrixShowCodeDesc = this.moduleControl.find(x => x.ctrlName === "ItemVariationMatrixShowCodeDesc");
         if (itemVariationMatrixShowCodeDesc && itemVariationMatrixShowCodeDesc.ctrlValue.toUpperCase() === "Y") {
            this.configItemVariationMatrixShowCodeDesc = true
         } else {
            this.configItemVariationMatrixShowCodeDesc = false;
         }

         let activateMultiUom = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateMultiUOM")?.ctrlValue;
         if (activateMultiUom && activateMultiUom.toUpperCase() === "Y") {
            this.configSystemWideActivateMultiUOM = true;
         } else {
            this.configSystemWideActivateMultiUOM = false;
         }

         let systemWideBarcodeScanBeep = this.moduleControl.find(x => x.ctrlName === "SystemWideBarcodeScanBeep")?.ctrlValue;
         if (systemWideBarcodeScanBeep && systemWideBarcodeScanBeep.toUpperCase() === "Y") {
            this.configSystemWideBarcodeScanBeep = true;
         } else {
            this.configSystemWideBarcodeScanBeep = false;
         }

      }, error => {
         console.log(error);
      })
   }

   /* #region handle barcode */

   barcodeSearchValue: string;
   handleBarcodeKeyDown(e: any, key: string) {
      if (e.keyCode === 13) {
         setTimeout(() => {
            let barcode = JSON.parse(JSON.stringify(this.manipulateBarcodeCheckDigit(key)));
            this.validateBarcode(barcode);
            this.setFocus();
            e.preventDefault();
         }, 0);
      }
   }

   manipulateBarcodeCheckDigit(itemBarcode: string) {
      if (itemBarcode) {
         if (this.systemWideEAN13IgnoreCheckDigit) {
            if (itemBarcode.length === 13) {
               itemBarcode = itemBarcode.substring(0, 12);
            }
         }
      }
      return itemBarcode;
   }

   async validateBarcode(barcode: string, emit: boolean = true) {
      setTimeout(async () => {
         if (barcode) {
            barcode = barcode.toUpperCase();
            this.barcodeSearchValue = "";
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode.toUpperCase() === barcode.toUpperCase());
               if (found_barcode) {
                  let found_item_master = this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
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
                     itemVariationXCd: found_barcode.xCd,
                     itemVariationXDesc: found_barcode.xDesc,
                     itemVariationYId: found_barcode.yId,
                     itemVariationYCd: found_barcode.yCd,
                     itemVariationYDesc: found_barcode.yDesc,
                     itemSku: found_barcode.sku,
                     itemBarcode: found_barcode.barcode,
                     itemBrandId: found_item_master.brandId,
                     itemGroupId: found_item_master.groupId,
                     itemUomId: found_barcode.itemUomId,
                     itemUomDesc: found_barcode.itemUomDesc,
                     itemCategoryId: found_item_master.catId,
                     itemDepartmentId: found_item_master.deptId,
                     itemBarcodeTagId: found_barcode.id,
                     newItemId: found_item_master.newId,
                     newItemEffectiveDate: found_item_master.newDate
                  }
                  if (this.configSystemWideBarcodeScanBeep) {
                     beep(150, 2500, 100);
                  }
                  if (emit) {
                     this.onItemAdd.emit(outputData);
                  } else {
                     return outputData;
                  }
               } else {
                  this.toastService.presentToast("", "Barcode not found", "top", "warning", 1000);
                  if (this.configSystemWideBarcodeScanBeep) {
                     beep(150, 80, 100);
                  }
               }
            } else {
               this.toastService.presentToast("System Error", "Local db not found", "top", "danger", 1000);
               if (this.configSystemWideBarcodeScanBeep) {
                  beep(150, 80, 100);
               }
            }
         }
      }, 0);
      return null;
   }

   /* #endregion */

   /* #region handle item code */

   itemSearchValue: string;
   async handleItemCodeKeyDown(e: any, key: string) {
      if (e.keyCode === 13) {
         await this.validateItem(key);
         e.preventDefault();
         this.setFocus();
      }
   }

   availableItem: TransactionDetail[] = [];
   async validateItem(searchValue: string) {
      if (searchValue) {
         this.itemSearchValue = null;
         this.availableItem = [];
         let found_item_master = this.configService.item_Masters.filter(r => searchValue.toUpperCase().includes(r.code.toUpperCase()));
         if (found_item_master) {
            if (found_item_master.length === 1) { // just one
               if (found_item_master[0].varCd === "0") {
                  let found_item_barcode = this.configService.item_Barcodes.find(r => r.itemId === found_item_master[0].id && r.isOther.toUpperCase() === "N" && r.itemUomId === found_item_master[0].uomId);
                  let outputData: TransactionDetail = {
                     itemId: found_item_master[0].id,
                     itemCode: found_item_master[0].code,
                     description: found_item_master[0].itemDesc,
                     typeCode: found_item_master[0].typeCode,
                     variationTypeCode: found_item_master[0].varCd,
                     itemSku: found_item_barcode?.sku,
                     qtyRequest: 1,
                     sequence: 0
                  }
                  this.onItemAdd.emit(outputData); // return if only have one
               }
            } else { // show select item modal
               for await (var item_master of found_item_master) {
                  let outputData: TransactionDetail = {
                     itemId: item_master.id,
                     itemCode: item_master.code,
                     description: item_master.itemDesc,
                     typeCode: item_master.typeCode,
                     variationTypeCode: item_master.varCd,
                     qtyRequest: 0,
                     sequence: 0
                  }
                  this.availableItem.push(outputData);
               }
               if (this.availableItem && this.availableItem.length > 0) {
                  this.showSelectItemModal();
               } else {
                  this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
               }
            }
         }
      } else {
         this.toastService.presentToast("", "Please enter item code", "top", "warning", 1000);
      }
   }

   selectedItem: TransactionDetail;
   async showVariation(rowData: TransactionDetail) {      
      if (rowData.variationTypeCode === "0") { // if selectedItem is singular
         this.hideSelectItemModal();
         this.onItemAdd.emit(rowData);
      } else { // else show matrix
         this.selectedItem = rowData;
         var found_item_barcode = this.configService.item_Barcodes.filter(r => r.itemId === rowData.itemId);
         if (found_item_barcode && found_item_barcode.length > 0) {
            found_item_barcode.sort((a, b) => {
               if (a.xSeq === b.xSeq) {
                  if (a.ySeq < b.ySeq) {
                     return -1;
                  } else if (a.ySeq > b.ySeq) {
                     return 1;
                  }
                  return 0;
               } else if (a.xSeq < b.xSeq) {
                  return -1;
               } else {
                  return 1;
               }
            });
            let vd: VariationDetail[] = [];
            var uniqueX = [...new Set(found_item_barcode.flatMap(r => r.xId))];
            var uniqueY = [...new Set(found_item_barcode.flatMap(r => r.yId))];
            uniqueX.forEach(x => {
               let d: InnerVariationDetail[] = [];
               if (uniqueY && uniqueY.length > 0) {
                  uniqueY.forEach(y => {
                     let found = found_item_barcode.find(rr => rr.xId === x && rr.yId === y);
                     let ivd: InnerVariationDetail = {
                        itemVariationYId: y,
                        itemSku: found.sku,
                        qtyRequest: null,
                        deactivated: found !== null ? false : true
                     }
                     d.push(ivd);
                  });
               } else {
                  let found = found_item_barcode.find(rr => rr.xId === x && rr.yId === null);
                  let ivd: InnerVariationDetail = {
                     itemVariationYId: null,
                     itemSku: found.sku,
                     qtyRequest: null,
                     deactivated: false
                  }
                  d.push(ivd);
               }
               vd.push({
                  itemVariationXId: x,
                  details: d
               })
            })
            this.selectedItem.variationDetails = vd;
            this.selectedItem.variationX = uniqueX;
            this.selectedItem.variationY = uniqueY;
            this.showSelectItemVariationModal();
         } else {
            this.toastService.presentToast("System Error", "Item barcode not found", "top", "danger", 1000);
         }
      }
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   addVariations() {
      if (this.selectedItem) {
         this.selectedItem.variationDetails.forEach(x => {
            x.details.forEach(y => {
               if (y.qtyRequest && y.qtyRequest > 0) {
                  this.selectedItem.qtyRequest = (this.selectedItem.qtyRequest??0) + y.qtyRequest;
               }
            })
         })
         this.onItemAdd.emit(this.selectedItem);
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator.", "top", "danger", 1000);
      }
      this.hideSelectItemVariationModal();
      this.hideSelectItemModal();
   }

   /* #endregion */

   itemModalOpen: boolean = false;
   showSelectItemModal() {
      this.itemModalOpen = true;
   }

   hideSelectItemModal() {
      this.itemModalOpen = false;
      this.selectedItem = null;
   }

   itemVariationModalOpen: boolean = false;
   showSelectItemVariationModal() {
      this.itemVariationModalOpen = true;
   }

   hideSelectItemVariationModal() {
      this.itemVariationModalOpen = false;      
   }

   setFocus() {
      setTimeout(() => {
         this.focusItemSearch();
      }, 0);
   }

   @ViewChild("itemInput", { static: false }) itemInput: ElementRef;
   focusItemSearch() {
      this.itemInput.nativeElement.focus();
   }

}

const myAudioContext = new AudioContext();
function beep(duration, frequency, volume) {
   return new Promise((resolve, reject) => {
      // Set default duration if not provided
      duration = duration || 200;
      frequency = frequency || 440;
      volume = volume || 100;

      try {
         let oscillatorNode = myAudioContext.createOscillator();
         let gainNode = myAudioContext.createGain();
         oscillatorNode.connect(gainNode);

         // Set the oscillator frequency in hertz
         oscillatorNode.frequency.value = frequency;

         // Set the type of oscillator
         oscillatorNode.type = "square";
         gainNode.connect(myAudioContext.destination);

         // Set the gain to the volume
         gainNode.gain.value = volume * 0.01;

         // Start audio with the desired duration
         oscillatorNode.start(myAudioContext.currentTime);
         oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001);

         // Resolve the promise when the sound is finished
         oscillatorNode.onended = () => {
            resolve(true);
         };
      } catch (error) {
         reject(error);
      }
   });
}