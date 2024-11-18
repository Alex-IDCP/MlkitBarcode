import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  NgZone,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from '../../models/master-list-details';
import { ModuleControl } from '../../models/module-control';
import { LocalItemBarcode, LocalItemMaster } from '../../models/pos-download';
import { TransactionDetail } from '../../models/transaction-detail';
import { CommonService } from '../../services/common.service';
import {
  AlertController,
  ViewDidEnter,
  ViewWillEnter,
  ModalController,
} from '@ionic/angular';
import { BarcodeScanningModalComponent } from './barcode-scan-input.component';

import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-barcode-scan-input',
  templateUrl: './barcode-scan-input.page.html',
  styleUrls: ['./barcode-scan-input.page.scss'],
})
export class BarcodeScanInputPage
  implements OnInit, ViewDidEnter, ViewWillEnter
{
  @Input() showVariationModalSelection: boolean = true; // wms no variation
  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];
  @Input() itemUomMasterList: MasterListDetails[] = [];

  moduleControl: ModuleControl[];
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  systemWideScanningMethod: string;
  systemWideBlockConvertedCode: boolean = false;
  detectionBox;

  selectedScanningMethod: string = 'B';

  // Barcode Here::
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  public isSupported = false;
  public isPermissionGranted = false;
  public barcodes: Barcode[] = [];
  public isScanning = false;

  @Output() onItemAdd = new EventEmitter<any>();
  @Output() onDoneScanning = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService,
    private alertController: AlertController,
    private modalController: ModalController,
    private ngZone: NgZone
  ) {}

  ionViewWillEnter(): void {
    this.setFocus();
  }

  ionViewDidEnter(): void {
    this.setFocus();
  }

  ngOnInit() {
    this.loadModuleControl();
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
  }

  showKeyboard(event) {
    event.preventDefault();
    this.setFocus();
    // setTimeout(async () => {
    Keyboard.show();
    // }, 100);
  }

  configSystemWideActivateMultiUOM: boolean = false;
  configItemVariationShowMatrix: boolean = false;
  configItemVariationMatrixShowCodeDesc: boolean = false;
  configSystemWideBarcodeScanBeep: boolean = false;
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(
      (obj) => {
        this.moduleControl = obj;

        let ignoreCheckdigit = this.moduleControl.find(
          (x) => x.ctrlName === 'SystemWideEAN13IgnoreCheckDigit'
        );
        if (ignoreCheckdigit != undefined) {
          this.systemWideEAN13IgnoreCheckDigit =
            ignoreCheckdigit.ctrlValue.toUpperCase() == 'Y' ? true : false;
        }

        let scanningMethod = this.moduleControl.find(
          (x) => x.ctrlName === 'SystemWideScanningMethod'
        );
        if (scanningMethod != undefined) {
          this.systemWideScanningMethod = scanningMethod.ctrlValue;
        }

        let blockConvertedCode = this.moduleControl.find(
          (x) => x.ctrlName === 'SystemWideBlockConvertedCode'
        );
        if (blockConvertedCode) {
          this.systemWideBlockConvertedCode =
            blockConvertedCode.ctrlValue.toUpperCase() === 'Y' ? true : false;
        } else {
          this.systemWideBlockConvertedCode = false;
        }

        let itemVariationShowMatrix = this.moduleControl.find(
          (x) => x.ctrlName === 'ItemVariationShowMatrix'
        );
        if (
          itemVariationShowMatrix &&
          itemVariationShowMatrix.ctrlValue.toUpperCase() === 'Y'
        ) {
          this.configItemVariationShowMatrix = true;
        } else {
          this.configItemVariationShowMatrix = false;
        }

        let itemVariationMatrixShowCodeDesc = this.moduleControl.find(
          (x) => x.ctrlName === 'ItemVariationMatrixShowCodeDesc'
        );
        if (
          itemVariationMatrixShowCodeDesc &&
          itemVariationMatrixShowCodeDesc.ctrlValue.toUpperCase() === 'Y'
        ) {
          this.configItemVariationMatrixShowCodeDesc = true;
        } else {
          this.configItemVariationMatrixShowCodeDesc = false;
        }

        let activateMultiUom = this.moduleControl.find(
          (x) => x.ctrlName === 'SystemWideActivateMultiUOM'
        )?.ctrlValue;
        if (activateMultiUom && activateMultiUom.toUpperCase() === 'Y') {
          this.configSystemWideActivateMultiUOM = true;
        } else {
          this.configSystemWideActivateMultiUOM = false;
        }

        let systemWideBarcodeScanBeep = this.moduleControl.find(
          (x) => x.ctrlName === 'SystemWideBarcodeScanBeep'
        )?.ctrlValue;
        if (
          systemWideBarcodeScanBeep &&
          systemWideBarcodeScanBeep.toUpperCase() === 'Y'
        ) {
          this.configSystemWideBarcodeScanBeep = true;
        } else {
          this.configSystemWideBarcodeScanBeep = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  handleBarcodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      // setTimeout(() => {
      this.setFocus();
      let barcode = JSON.parse(
        JSON.stringify(this.manipulateBarcodeCheckDigit(key))
      );
      this.validateBarcode(barcode);
      e.preventDefault();
      // }, 0);
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

  /* #region scan */

  // barcodeSearchValue: string;
  @ViewChild('barcodeInput', { static: false }) barcodeInput: ElementRef;
  async validateBarcode(barcode: string, emit: boolean = true) {
    setTimeout(async () => {
      if (barcode) {
        barcode = barcode.toUpperCase();
        this.barcodeInput.nativeElement.value = '';
        this.setFocus();
        if (
          this.configService.item_Barcodes &&
          this.configService.item_Barcodes.length > 0
        ) {
          let found_barcode = this.configService.item_Barcodes
            .filter((r) => r.barcode.length > 0)
            .find((r) => r.barcode.toUpperCase() === barcode.toUpperCase());
          if (found_barcode) {
            let found_item_master = this.configService.item_Masters.find(
              (r) => found_barcode.itemId === r.id
            );
            let outputData: TransactionDetail = {
              itemId: found_item_master.id,
              itemCode: found_item_master.code,
              description: found_item_master.itemDesc,
              typeCode: found_item_master.typeCode,
              variationTypeCode: found_item_master.varCd,
              discountGroupCode: found_item_master.discCd,
              discountExpression: (found_item_master.discPct ?? '0') + '%',
              taxId: found_item_master.taxId,
              taxCode: found_item_master.taxCd,
              taxPct: found_item_master.taxPct,
              qtyRequest: null,
              itemPricing: {
                itemId: found_item_master.id,
                unitPrice: found_item_master.price,
                discountGroupCode: found_item_master.discCd,
                discountExpression: (found_item_master.discPct ?? '0') + '%',
                discountPercent: found_item_master.discPct ?? 0,
                discountGroupId: null,
                unitPriceMin: null,
                currencyId: null,
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
              newItemEffectiveDate: found_item_master.newDate,
            };
            if (this.configSystemWideBarcodeScanBeep) {
              beep(150, 2500, 100);
            }
            if (emit) {
              this.onItemAdd.emit([outputData]);
            } else {
              return outputData;
            }
          } else {
            this.toastService.presentToast(
              '',
              'Barcode not found',
              'top',
              'warning',
              1000
            );
            if (this.configSystemWideBarcodeScanBeep) {
              beep(150, 80, 100);
            }
          }
        } else {
          this.toastService.presentToast(
            'System Error',
            'Local db not found',
            'top',
            'danger',
            1000
          );
          if (this.configSystemWideBarcodeScanBeep) {
            beep(150, 80, 100);
          }
        }
      }
    }, 0);
    return null;
  }

  async handleItemCodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      await this.validateItem(key);
      e.preventDefault();
      this.setFocus();
    }
  }

  itemSearchValue: string;
  availableItemmmm: TransactionDetail[] = [];
  availableVariations: TransactionDetail[] = [];
  variationStructure: TransactionDetail;
  @ViewChild('itemInput', { static: false }) itemInput: ElementRef;
  async validateItem(searchValue: string) {
    if (searchValue) {
      this.itemSearchValue = '';
      this.availableItemmmm = [];
      this.availableVariations = [];
      this.availableVariationsByItemId = [];
      this.variationStructure = null;
      let found_item_master: LocalItemMaster[] = [];
      let found_item_barcode: LocalItemBarcode[] = [];
      if (
        this.configService.item_Masters &&
        this.configService.item_Masters.length > 0
      ) {
        let found = this.configService.item_Masters
          .filter((r) => r.code.length > 0)
          .filter((r) =>
            r.code.toUpperCase().includes(searchValue.toUpperCase())
          ); // if found by itemCode
        if (found && found.length > 0) {
          found_item_master = this.configService.item_Masters.filter((r) =>
            found.flatMap((rr) => rr.id).includes(r.id)
          );
        } else {
          let found2 = this.configService.item_Barcodes
            .filter((r) => r.sku.length > 0)
            .filter((r) =>
              r.sku.toUpperCase().includes(searchValue.toUpperCase())
            ); // if found by itemSku
          if (found2) {
            found_item_master = this.configService.item_Masters.filter((r) =>
              found2.flatMap((rr) => rr.id).includes(r.id)
            );
          }
        }
        if (found_item_master && found_item_master.length > 0) {
          found_item_barcode = this.configService.item_Barcodes.filter(
            (r) =>
              r.isOther === 'N' &&
              found_item_master.flatMap((rr) => rr.id).includes(r.itemId)
          );
          for await (const r of found_item_master) {
            if (
              this.availableItemmmm.findIndex((rr) => rr.itemCode === r.code) <
              0
            ) {
              if (r.varCd === '0') {
                let barcodes = found_item_barcode.filter(
                  (rr) => rr.itemId === r.id
                );
                if (
                  !(
                    this.configSystemWideActivateMultiUOM &&
                    this.itemUomMasterList &&
                    this.itemUomMasterList.length > 0
                  )
                ) {
                  barcodes = barcodes.filter((rr) => rr.itemUomId === r.uomId);
                }
                if (barcodes && barcodes.length > 0) {
                  for await (const barcode of barcodes) {
                    if (
                      this.availableItemmmm.findIndex(
                        (rr) => rr.itemSku === barcode.sku
                      ) < 0
                    ) {
                      let outputData: TransactionDetail = {
                        itemId: r.id,
                        itemCode: r.code,
                        description: r.itemDesc,
                        typeCode: r.typeCode,
                        variationTypeCode: r.varCd,
                        discountGroupCode: r.discCd,
                        discountExpression: (r.discPct ?? '0') + '%',
                        taxId: r.taxId,
                        taxCode: r.taxCd,
                        taxPct: r.taxPct,
                        qtyRequest: null,
                        itemPricing: {
                          itemId: r.id,
                          unitPrice: r.price,
                          discountGroupCode: r.discCd,
                          discountExpression: (r.discPct ?? '0') + '%',
                          discountPercent: r.discPct ?? 0,
                          discountGroupId: null,
                          unitPriceMin: null,
                          currencyId: null,
                        },
                        itemSku: r.varCd === '0' ? barcode.sku : null,
                        itemBarcode: r.varCd === '0' ? barcode.barcode : null,
                        itemBrandId: r.brandId,
                        itemGroupId: r.groupId,
                        itemUomId: barcode.itemUomId,
                        itemUomDesc: barcode.itemUomDesc,
                        itemCategoryId: r.catId,
                        itemDepartmentId: r.deptId,
                        itemBarcodeTagId: r.varCd === '0' ? barcode.id : null,
                      };
                      this.availableItemmmm.push(outputData);
                    }
                  }
                }
              } else {
                let barcode = found_item_barcode.find(
                  (rr) => rr.itemId === r.id
                );
                if (barcode) {
                  let outputData: TransactionDetail = {
                    itemId: r.id,
                    itemCode: r.code,
                    description: r.itemDesc,
                    typeCode: r.typeCode,
                    variationTypeCode: r.varCd,
                    discountGroupCode: r.discCd,
                    discountExpression: (r.discPct ?? '0') + '%',
                    taxId: r.taxId,
                    taxCode: r.taxCd,
                    taxPct: r.taxPct,
                    qtyRequest: null,
                    itemPricing: {
                      itemId: r.id,
                      unitPrice: r.price,
                      discountGroupCode: r.discCd,
                      discountExpression: (r.discPct ?? '0') + '%',
                      discountPercent: r.discPct ?? 0,
                      discountGroupId: null,
                      unitPriceMin: null,
                      currencyId: null,
                    },
                    itemSku: r.varCd === '0' ? barcode.sku : null,
                    itemBarcode: r.varCd === '0' ? barcode.barcode : null,
                    itemBrandId: r.brandId,
                    itemGroupId: r.groupId,
                    itemUomId: barcode.itemUomId,
                    itemUomDesc: barcode.itemUomDesc,
                    itemCategoryId: r.catId,
                    itemDepartmentId: r.deptId,
                    itemBarcodeTagId: r.varCd === '0' ? barcode.id : null,
                  };
                  this.availableItemmmm.push(outputData);
                }
              }
            }
          }
        }
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
          found_item_barcode.forEach(async (r) => {
            if (
              this.availableVariations.findIndex((rr) => rr.itemSku === r.sku) <
              0
            ) {
              let outputData: TransactionDetail = {
                itemId: r.itemId,
                itemCode: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.code,
                description: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.itemDesc,
                typeCode: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.typeCode,
                variationTypeCode: found_item_master.find(
                  (rr) => rr.id === r.itemId
                )?.varCd,
                discountGroupCode: found_item_master.find(
                  (rr) => rr.id === r.itemId
                )?.discCd,
                discountExpression:
                  (found_item_master.find((rr) => rr.id === r.itemId)
                    ?.discPct ?? '0') + '%',
                taxId: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.taxId,
                taxCode: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.taxCd,
                taxPct: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.taxPct,
                qtyRequest: null,
                itemPricing: {
                  itemId: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.id,
                  unitPrice: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.price,
                  discountGroupCode: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.discCd,
                  discountExpression:
                    (found_item_master.find((rr) => rr.id === r.itemId)
                      ?.discPct ?? '0') + '%',
                  discountPercent:
                    found_item_master.find((rr) => rr.id === r.itemId)
                      ?.discPct ?? 0,
                  discountGroupId: null,
                  unitPriceMin: null,
                  currencyId: null,
                },
                itemVariationXId: r.xId,
                itemVariationXCd: r.xCd,
                itemVariationXDesc: r.xDesc,
                itemVariationYId: r.yId,
                itemVariationYCd: r.yCd,
                itemVariationYDesc: r.yDesc,
                itemSku: r.sku,
                itemBarcode: r.barcode,
                itemBrandId: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.brandId,
                itemGroupId: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.groupId,
                itemUomId: r.itemUomId,
                itemUomDesc: r.itemUomDesc,
                itemCategoryId: found_item_master.find(
                  (rr) => rr.id === r.itemId
                )?.catId,
                itemDepartmentId: found_item_master.find(
                  (rr) => rr.id === r.itemId
                )?.deptId,
                itemBarcodeTagId: r.id,
                newItemId: found_item_master.find((rr) => rr.id === r.itemId)
                  ?.newId,
                newItemEffectiveDate: found_item_master.find(
                  (rr) => rr.id === r.itemId
                )?.newDate,
              };
              this.availableVariations.push(outputData);
            }
          });
        } else {
          this.toastService.presentToast(
            '',
            'Item not found',
            'top',
            'warning',
            1000
          );
        }
        if (found_item_master && found_item_master.length === 1) {
          // only 1 item found
          if (found_item_master[0].varCd !== '0') {
            this.availableVariationsByItemId = this.availableVariations.filter(
              (r) => r.itemId === found_item_master[0].id
            ); // check if that one item has variation or not
            if (
              this.availableVariationsByItemId &&
              this.availableVariationsByItemId.length > 1
            ) {
              // if yes, then show variation modal
              if (this.showVariationModalSelection) {
                if (this.configItemVariationShowMatrix) {
                  var variationStructure =
                    await this.commonService.buildVariationStructure(
                      JSON.parse(
                        JSON.stringify(this.availableVariationsByItemId)
                      )
                    );
                  if (variationStructure === null) {
                    this.toastService.presentToast(
                      'System Error',
                      'Please contact administrator.',
                      'top',
                      'danger',
                      1000
                    );
                    return;
                  } else {
                    this.variationStructure = variationStructure;
                  }
                }
                this.showVariationModal();
              } else {
                this.onItemAdd.emit([this.availableVariationsByItemId[0]]);
              }
            } else {
              this.onItemAdd.emit([this.availableVariationsByItemId[0]]);
            }
          } else {
            if (
              (this.availableVariations &&
                this.availableVariations.length === 1) ||
              !(
                this.configSystemWideActivateMultiUOM &&
                this.itemUomMasterList &&
                this.itemUomMasterList.length > 0
              )
            ) {
              // variation 0 and no uom
              this.availableVariationsByItemId =
                this.availableVariations.filter(
                  (r) => r.itemId === found_item_master[0].id
                ); // check if that one item has variation or not
              this.onItemAdd.emit([this.availableVariationsByItemId[0]]);
            } else {
              // let user select item by uom
              this.showItemModal();
            }
          }
        } else if (
          found_item_master &&
          found_item_master.length > 0 &&
          this.availableVariations &&
          this.availableVariations.length > 0
        ) {
          // if item found, and has barcode tag
          this.showItemModal();
        }
      } else {
        this.toastService.presentToast(
          'System Error',
          'Local db not found.',
          'top',
          'danger',
          1000
        );
      }
    }
  }

  /* #endregion */

  /* #region modal for user to select item (if more than 1 item found when they search) */

  itemModalOpen: boolean = false;
  async showItemModal() {
    if (this.availableItemmmm && this.availableItemmmm.length > 0) {
      await this.availableItemmmm.sort((a, c) => {
        return a.itemCode > c.itemCode ? 1 : -1;
      });
    }
    this.itemModalOpen = true;
  }

  hideItemModel() {
    this.itemModalOpen = false;
    this.setFocus();
  }

  availableVariationsByItemId: TransactionDetail[] = [];
  async showVariations(item: TransactionDetail) {
    this.availableVariationsByItemId = [];
    if (item.variationTypeCode === '0') {
      if (item) {
        let found = this.configService.item_Masters.find(
          (r) => r.id === item.itemId
        );
        this.onItemAdd.emit([item]);
      } else {
        this.toastService.presentToast(
          '',
          'No item added',
          'top',
          'warning',
          1000
        );
      }
      this.hideItemModel();
    } else {
      if (this.showVariationModalSelection) {
        let found_item_master = this.configService.item_Masters.filter(
          (r) => r.id === item.itemId
        );
        let found_item_barcode = this.configService.item_Barcodes.filter(
          (r) => r.itemId === item.itemId
        );
        if (found_item_master) {
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
            found_item_barcode.forEach(async (r) => {
              if (
                this.availableVariations.findIndex(
                  (rr) => rr.itemSku === r.sku
                ) < 0
              ) {
                let outputData: TransactionDetail = {
                  itemId: r.itemId,
                  itemCode: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.code,
                  description: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.itemDesc,
                  typeCode: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.typeCode,
                  variationTypeCode: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.varCd,
                  discountGroupCode: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.discCd,
                  discountExpression:
                    (found_item_master.find((rr) => rr.id === r.itemId)
                      ?.discPct ?? '0') + '%',
                  taxId: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.taxId,
                  taxCode: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.taxCd,
                  taxPct: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.taxPct,
                  qtyRequest: null,
                  itemPricing: {
                    itemId: found_item_master.find((rr) => rr.id === r.itemId)
                      ?.id,
                    unitPrice: found_item_master.find(
                      (rr) => rr.id === r.itemId
                    )?.price,
                    discountGroupCode: found_item_master.find(
                      (rr) => rr.id === r.itemId
                    )?.discCd,
                    discountExpression:
                      (found_item_master.find((rr) => rr.id === r.itemId)
                        ?.discPct ?? '0') + '%',
                    discountPercent:
                      found_item_master.find((rr) => rr.id === r.itemId)
                        ?.discPct ?? 0,
                    discountGroupId: null,
                    unitPriceMin: null,
                    currencyId: null,
                  },
                  itemVariationXId: r.xId,
                  itemVariationXCd: r.xCd,
                  itemVariationXDesc: r.xDesc,
                  itemVariationYId: r.yId,
                  itemVariationYCd: r.yCd,
                  itemVariationYDesc: r.yDesc,
                  itemSku: r.sku,
                  itemBarcode: r.barcode,
                  itemBrandId: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.brandId,
                  itemGroupId: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.groupId,
                  itemUomId: r.itemUomId,
                  itemUomDesc: r.itemUomDesc,
                  itemCategoryId: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.catId,
                  itemDepartmentId: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.deptId,
                  itemBarcodeTagId: r.id,
                  newItemId: found_item_master.find((rr) => rr.id === r.itemId)
                    ?.newId,
                  newItemEffectiveDate: found_item_master.find(
                    (rr) => rr.id === r.itemId
                  )?.newDate,
                };
                this.availableVariations.push(outputData);
              }
            });
          }
          this.availableVariationsByItemId = this.availableVariations.filter(
            (r) => r.itemId === item.itemId
          );
          var variationStructure =
            await this.commonService.buildVariationStructure(
              JSON.parse(JSON.stringify(this.availableVariationsByItemId))
            );
          if (variationStructure === null) {
            this.toastService.presentToast(
              'System Error',
              'Please contact administrator.',
              'top',
              'danger',
              1000
            );
            return;
          } else {
            this.variationStructure = variationStructure;
          }
          this.showVariationModal();
        } else {
          this.toastService.presentToast(
            'Something went wrong',
            'Please contact adminstrator.',
            'top',
            'danger',
            1000
          );
        }
      } else {
        if (item) {
          let found = this.configService.item_Masters.find(
            (r) => r.id === item.itemId
          );
          this.onItemAdd.emit([item]);
        } else {
          this.toastService.presentToast(
            '',
            'No item added',
            'top',
            'warning',
            1000
          );
        }
        this.hideItemModel();
      }
    }
  }

  /* #endregion */

  /* #region modal for user to select item variation (final layer) */

  variationModalOpen: boolean = false;
  showVariationModal() {
    this.variationModalOpen = true;
  }

  hideVariationModel() {
    this.variationModalOpen = false;
    this.setFocus();
  }

  addVariations() {
    if (!this.configItemVariationShowMatrix) {
      let found = this.availableVariationsByItemId.filter((r) => r.isSelected);
      if (found.length > 0) {
        this.onItemAdd.emit(
          this.availableVariationsByItemId.filter((r) => r.isSelected)
        );
      } else {
        this.toastService.presentToast(
          '',
          'No item added',
          'top',
          'warning',
          1000
        );
      }
    } else {
      if (this.variationStructure) {
        this.variationStructure.variationDetails.forEach((x) => {
          x.details.forEach((y) => {
            if (y.qtyRequest && y.qtyRequest > 0) {
              let foundIndex = this.availableVariationsByItemId.findIndex(
                (r) =>
                  r.itemVariationXId === x.itemVariationXId &&
                  r.itemVariationYId === y.itemVariationYId
              );
              if (foundIndex > -1) {
                this.availableVariationsByItemId[foundIndex].qtyRequest =
                  y.qtyRequest;
                this.availableVariationsByItemId[foundIndex].isSelected = true;
              }
            }
          });
        });
        let found = this.availableVariationsByItemId.filter(
          (r) => r.isSelected
        );
        if (found.length > 0) {
          this.onItemAdd.emit(
            this.availableVariationsByItemId.filter((r) => r.isSelected)
          );
        } else {
          this.toastService.presentToast(
            '',
            'No item added',
            'top',
            'warning',
            1000
          );
        }
      } else {
        this.toastService.presentToast(
          'System Error',
          'Please contact adminstrator.',
          'top',
          'danger',
          1000
        );
      }
    }
    this.hideVariationModel();
    this.hideItemModel();
  }

  /* #endregion */

  /* #region focus */

  scanningMethodChanged() {
    this.setFocus();
  }

  setFocus() {
    setTimeout(() => {
      if (this.selectedScanningMethod === 'B') {
        this.focusBarcodeSearch();
      } else {
        this.focusItemSearch();
      }
    }, 0);
  }

  focusBarcodeSearch() {
    this.barcodeInput.nativeElement.focus();
  }

  focusItemSearch() {
    this.itemInput.nativeElement.focus();
  }

  highlight(event) {
    event.getInputElement().then((r) => {
      r.select();
    });
  }

  /* #endregion */

  /* #region camera scanner */

  public async startScanning(): Promise<void> {
    const formats = this.formGroup.get('formats')?.value || [];
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;

    try {
      // Set up the modal for barcode scanning
      if (this.isSupported) {
        const element = await this.modalController.create({
          component: BarcodeScanningModalComponent,
          // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
          cssClass: 'barcode-scanning-modal',
          showBackdrop: true,
          backdropDismiss: true,
          componentProps: {
            formats: BarcodeFormat.Code128,
            lensFacing: LensFacing.Back,
          },
        });
        element.onDidDismiss().then((result) => {
          const barcode: Barcode | undefined = result.data?.barcode;
          if (barcode) {
            // Store scanned barcode or trigger any further actions needed
            this.barcodes = [barcode];
            let checkData: string;
            for (const barcodeData of this.barcodes) {
              checkData = this.manipulateBarcodeCheckDigit(
                barcodeData.displayValue
              );
            }
            this.onDoneScanning.emit(checkData);
          }
        });

        await element.present();
      } else {
        console.log('Barcode scanning is not supported on this device.');
      }
    } catch (error) {
      console.error('Error showing modal:', error);
    }
  }

  /*async checkPermission(): Promise<boolean> {
    const status = await BarcodeScanner.checkPermissions();

    if (status.camera === 'granted') {
      return true;
    } else if (status.camera === 'denied') {
      const alert = await this.alertController.create({
        header: 'No permission',
        message: 'Please allow camera access in your settings',
        buttons: [
          {
            text: 'Open Settings',
            handler: () => {
              BarcodeScanner.openSettings();
            },
          },
          {
            text: 'No',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
      return false;
    }

    return false;
  }*/

  /*stopScanner() {
    BarcodeScanner.stopScan();
  }

  closeScanningModal(): void {
    this.isScanning = false; // Set to false to hide the scanning modal
    BarcodeScanner.stopScan();
  }*/

  /* #endregion */
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
      oscillatorNode.type = 'square';
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
