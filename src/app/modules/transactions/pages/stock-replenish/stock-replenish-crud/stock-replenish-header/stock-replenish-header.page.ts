import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { StockReplenishService } from 'src/app/modules/transactions/services/stock-replenish.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CreditInfo, CreditInfoDetails } from 'src/app/shared/models/credit-info';
import { MasterListDetails, ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-stock-replenish-header',
  templateUrl: './stock-replenish-header.page.html',
  styleUrls: ['./stock-replenish-header.page.scss'],
})
export class StockReplenishHeaderPage implements OnInit {

  objectForm: FormGroup;

  customPopoverOptions: any = {
    message: 'Select one',
    cssClass: 'popover-in-modal'
  };

  constructor(
    private authService: AuthService,
    public objectService: StockReplenishService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private modalController: ModalController
  ) {
    this.newObjectForm();
  }

  newObjectForm() {
    try {
      this.objectForm = this.formBuilder.group({
        salesOrderId: [0],
        salesOrderNum: [null],
        salesAgentId: [null],
        trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
        typeCode: [null],
        customerId: [null, [Validators.required]],
        shipAddress: [null, [Validators.maxLength(500)]],
        shipPostCode: [null],
        shipPhone: [null],
        shipEmail: [null, [Validators.email]],
        shipFax: [null],
        shipAreaId: [null],
        shipMethodId: [null],
        attention: [null],
        termPeriodId: [null],
        locationId: [null],
        toLocationId: [null],
        countryId: [null],
        currencyId: [null],
        currencyRate: [null],
        salesOrderUDField1: [null],
        salesOrderUDField2: [null],
        salesOrderUDField3: [null],
        salesOrderUDOption1: [null],
        salesOrderUDOption2: [null],
        salesOrderUDOption3: [null],
        deactivated: [null],
        workFlowTransactionId: [null],
        masterUDGroup1: [null],
        masterUDGroup2: [null],
        masterUDGroup3: [null],
        isItemPriceTaxInclusive: [null],
        isDisplayTaxInclusive: [null],
        sourceType: ['M'],
        businessModelType: [null],
        remark: [null],
        isHomeCurrency: [null],
        maxPrecision: [null],
        maxPrecisionTax: [null],
        isOpeningBalance: [false],
        isPricingApproval: [false]
      });
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[];
  allowDocumentWithEmptyLine: string = "N";
  configSalesActivatePromotionEngine: boolean;
  workflowEnablePrintAfterApproved: boolean;
  disableTradeTransactionGenerateGL: boolean;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
        if (config != undefined) {
          this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
        }
        let config2 = this.moduleControl.find(x => x.ctrlName === "WorkflowEnablePrintAfterApproved")?.ctrlValue;
        if (config2 && config2.toUpperCase() == "Y") {
          this.workflowEnablePrintAfterApproved = true;
        } else {
          this.workflowEnablePrintAfterApproved = false;
        }
        let config3 = this.moduleControl.find(x => x.ctrlName === "DisableTradeTransactionGenerateGL")?.ctrlValue;
        if (config3 && config3.toUpperCase() == "Y") {
          this.disableTradeTransactionGenerateGL = true;
        } else {
          this.disableTradeTransactionGenerateGL = false;
        }
        let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine")?.ctrlValue;
        if (salesActivatePromotionEngine && salesActivatePromotionEngine.toUpperCase() == "Y") {
          this.configSalesActivatePromotionEngine = true;
        } else {
          this.configSalesActivatePromotionEngine = false;
        }
      })
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
    }
  }

  onLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ toLocationId: event.id });
      // find customer from locationId from customerMasterList
      if (this.objectService.customerMasterList && this.objectService.customerMasterList.length > 0) {
        let found = this.objectService.customerMasterList.filter(r => r.attributeArray1.includes(event.id));
        if (found && found.length > 0) {
          this.onCustomerSelected({ id: found[0].id });
        }
      }
    } else {
      this.newObjectForm();
    }
  }
  
  selectedCustomerLocationList: MasterListDetails[] = [];
  creditInfo: CreditInfo = { creditLimit: null, creditTerms: null, isCheckCreditLimit: null, isCheckCreditTerm: null, utilizedLimit: null, pendingOrderAmount: null, outstandingAmount: null, availableLimit: null, overdueAmount: null, pending: [], outstanding: [], overdue: [] };
  availableAddress: ShippingInfo[] = [];
  onCustomerSelected(event) {
    try {
      if (event && event !== undefined) {
        var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
        if (lookupValue != undefined) {
          this.objectService.removeItems();
          this.objectForm.patchValue({ customerId: lookupValue.id });
          this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
          if (lookupValue.attributeArray1.length > 0) {
            this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
          } else {
            this.selectedCustomerLocationList = [];
          }
          this.objectForm.patchValue({
            salesAgentId: parseFloat(lookupValue.attribute1),
            termPeriodId: parseFloat(lookupValue.attribute2),
            countryId: parseFloat(lookupValue.attribute3),
            currencyId: parseFloat(lookupValue.attribute4),
            locationId: parseFloat(lookupValue.attribute6),
            // toLocationId: null,
            isItemPriceTaxInclusive: lookupValue.attribute8 == '1' ? true : false,
            isDisplayTaxInclusive: lookupValue.attribute9 == '1' ? true : false
          });

          this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList)

          this.onCurrencySelected(lookupValue.attribute4);
          if (lookupValue.attribute5 == "T") {
            this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectForm.controls['customerId'].value).flatMap(r => r.shippingInfo);
            // this.objectForm.controls.toLocationId.clearValidators();
            // this.objectForm.controls.toLocationId.updateValueAndValidity();
          } else {
            this.availableAddress = [];
          }
          // if (lookupValue.attributeArray1.length == 1) {
          //   this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
          // }
          //Auto map object type code
          if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
            this.objectForm.patchValue({ typeCode: 'S' });
          } else {
            this.objectForm.patchValue({ typeCode: 'T' });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onCurrencySelected(event: any) {
    try {
      if (event) {
        var lookupValue = this.objectService.currencyMasterList?.find(e => e.id == event);
        if (lookupValue != undefined) {
          this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
          if (lookupValue.attribute2 == "Y") {
            this.objectForm.patchValue({ isHomeCurrency: true });
            this.objectForm.patchValue({ maxPrecision: this.precisionSales.localMax });
            this.objectForm.patchValue({ maxPrecisionTax: this.precisionTax.localMax });
          } else {
            this.objectForm.patchValue({ isHomeCurrency: false });
            this.objectForm.patchValue({ maxPrecision: this.precisionSales.foreignMax });
            this.objectForm.patchValue({ maxPrecisionTax: this.precisionTax.foreignMax });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async cancelInsert() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you sure to cancel?',
        subHeader: 'Changes made will be discard.',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Yes',
            role: 'confirm',
          },
          {
            text: 'No',
            role: 'cancel',
          }]
      });
      await actionSheet.present();
      const { role } = await actionSheet.onWillDismiss();
      if (role === 'confirm') {
        this.objectService.resetVariables();
        this.navController.navigateBack('/transactions/stock-replenish');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      await this.objectService.setHeader(this.objectForm.value);
      this.navController.navigateForward('/transactions/stock-replenish/stock-replenish-item');
    } catch (e) {
      console.error(e);
    }
  }

}
