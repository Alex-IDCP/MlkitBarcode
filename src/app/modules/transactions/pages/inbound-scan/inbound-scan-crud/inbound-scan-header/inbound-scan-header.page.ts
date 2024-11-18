import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, IonSegment, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { InboundHeaderForWD, MultiInboundRoot } from 'src/app/modules/transactions/models/inbound-scan';
import { InboundScanService } from 'src/app/modules/transactions/services/inbound-scan.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-inbound-scan-header',
   templateUrl: './inbound-scan-header.page.html',
   styleUrls: ['./inbound-scan-header.page.scss'],
})
export class InboundScanHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   _configService: any;
   objectForm: FormGroup;
   isButtonVisible: boolean = true;
   isByLocation: boolean = false;
   customerDisabled: boolean = false;

   constructor(
      public objectService: InboundScanService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder
   ) {
      this._configService = configService;
      this.newObjectForm();
   }

   ionViewWillEnter(): void {

   }

   async ionViewDidEnter(): Promise<void> {
      if (this.objectService.object && this.objectService.object.header && this.objectService.object.header && this.objectService.object.header.multiInboundId > 0) {
         this.isWithDoc = this.objectService.object.header.isWithDoc ? "true" : "false";
         this.objectForm.patchValue(this.objectService.object.header);
         if (this.objectService.object.header.isWithDoc) {
            await this.loadExistingDoc(this.objectService.object.outstandingInboundList.flatMap(r => r.inboundDocNum));           
         }
      }
   }

   ngOnInit() {

   }

   /* #endregion */

   showKeyboard(event) {
      event.preventDefault();
      this.barcodeInput.nativeElement.focus();
      setTimeout(async () => {
         await Keyboard.show();
      }, 100);
   }

   @ViewChild("segment", { static: false }) segment: IonSegment;
   isWithDoc: string = "true";
   async isWithDocChanged(event) {
      try {
         if (event.detail.value === "true") {
            this.objectForm.patchValue({ isWithDoc: true });
         } else {
            this.objectForm.patchValue({ isWithDoc: false });
            this.objectService.removeMultiInboundObject();
            this.setDefaultValue();
         }
      } catch (e) {
         console.error(e);
      }
   }

   setDefaultValue() {
      let defaultLocation = this.objectService.fLocationMasterList.find(item => item.isPrimary)?.id;
      if (defaultLocation) {
         this.objectForm.patchValue({ locationId: defaultLocation });
         this.onDestinationLocationSelected({ id: defaultLocation });
      } else {
         let findWh = this.objectService.fLocationMasterList.find(x => x.attribute1 == 'W');
         if (findWh) {
            this.objectForm.patchValue({ locationId: findWh.id });
            this.onDestinationLocationSelected({ id: findWh.id });
         }
      }
      if (this.configService.loginUser.defaultLocationId) {
         let findLocation = this.objectService.locationMasterList.find(x => x.id == this.configService.loginUser.defaultLocationId);
         if (findLocation) {
            this.objectForm.patchValue({ locationId: findLocation.id });
            this.onDestinationLocationSelected({ id: findLocation.id });
         }
      }
      let defaultAgent = this.objectService.warehouseAgentMasterList.find(item => item.isPrimary)?.id;
      if (defaultAgent) {
         this.objectForm.patchValue({ warehouseAgentId: defaultAgent });
      }
      let defaultCustomer = this.objectService.customerMasterList.find(r => r.isPrimary);
      if (defaultCustomer) {
         this.objectForm.patchValue({ customerId: defaultCustomer.id });
         this.onCustomerSelected({ id: defaultCustomer.id });
      }
   }

   /* #region scanner input */

   docSearchValue: string;
   handleDocSearchKeyDown(e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         this.barcodeInput.nativeElement.focus();
         this.validateDoc(this.docSearchValue);
      }
   }

   /* #endregion */

   /* #region validate doc */

   selectedDocs: InboundHeaderForWD[] = [];
   docType: string = "I"
   validateDoc(input: string) {
      if (input && input.length > 0) {
         this.docSearchValue = null;
         if (this.selectedDocs.findIndex(r => r.inboundDocNum.toUpperCase() === input.toUpperCase()) > -1) {
            this.toastService.presentToast("", "Doc already selected.", "top", "warning", 1000);
            return;
         } else {
            if (input && input.length > 0) {
               this.objectService.getDoc([input], this.docType).subscribe({
                  next: (response) => {
                     if (response.status === 200) {
                        let apiResponse: InboundHeaderForWD = response.body[0];
                        if (apiResponse) {
                           if (this.objectService.configMultiInboundToWHOnly) {
                              if (this.objectService.locationMasterList && this.objectService.locationMasterList.length > 0) {
                                 let locationFound = this.objectService.locationMasterList.find(r => r.id === apiResponse.toLocationId);
                                 if (locationFound) {
                                    if (locationFound.attribute1 !== "W") {
                                       this.toastService.presentToast("Action Rejected", "Not allow to scan transaction that is not returning to warehouse", "top", "warning", 1000);
                                       return;
                                    }
                                 } else {
                                    this.toastService.presentToast("Failed to lookup location for inbound location type checking.", "", "top", "warning", 1000);
                                    return;
                                 }
                              } else {
                                 this.toastService.presentToast("Failed to get location list for inbound location type checking.", "", "top", "warning", 1000);
                                 return;
                              }
                           }

                           if (this.selectedDocs && this.selectedDocs.length > 0 && this.selectedDocs[0].locationId != apiResponse.locationId) {
                              this.toastService.presentToast("Not allow to combine document with different origin location.", "", "top", "warning", 1000);
                              return;
                           }

                           if (this.selectedDocs && this.selectedDocs.length > 0 && this.selectedDocs[0].toLocationId != apiResponse.toLocationId) {
                              this.toastService.presentToast("Not allow to combine document with different destination location.", "", "top", "warning", 1000);
                              return;
                           }

                           // add into objectservice.outstanding if all checking passed.
                           this.selectedDocs.unshift(apiResponse);

                           let newOutstanding: InboundHeaderForWD = {
                              inboundDocId: apiResponse.inboundDocId,
                              inboundDocNum: apiResponse.inboundDocNum,
                              trxDate: apiResponse.trxDate,
                              locationId: apiResponse.locationId,
                              locationDesc: apiResponse.locationDesc,
                              customerId: apiResponse.customerId,
                              customerDesc: apiResponse.customerDesc,
                              toLocationId: apiResponse.toLocationId,
                              toLocationDesc: apiResponse.toLocationDesc,
                              currencyId: apiResponse.currencyId,
                              currencyDesc: apiResponse.currencyDesc,
                              businessModelType: apiResponse.businessModelType,
                              line: apiResponse.line
                           };
                           newOutstanding.line.forEach(r => {
                              r.inboundDocId = apiResponse.inboundDocId;
                              r.inboundDocNum = apiResponse.inboundDocNum;
                           })
                           this.objectService.multiInboundObject.outstandingInboundList = [...this.objectService.multiInboundObject.outstandingInboundList, ...newOutstanding.line];
                           this.uniqueOutstandingDocNum = [...new Set(this.selectedDocs.flatMap(r => r.inboundDocNum))];

                           // patch header value only for the first scanned doc
                           if (this.selectedDocs && this.selectedDocs.length === 1) {
                              this.patchHeader();
                           }
                        } else {
                           this.toastService.presentToast(`Invalid ${this.docType === "I" ? "Inter Transfer" : "Sales Return"} number`, "", "top", "warning", 1000);
                           return;
                        }
                     }
                  },
                  error: (error) => {
                     console.error(error);
                  }
               })
            }
         }
      } else {
         this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
      }
   }

   loadExistingDoc(docNum: string[]) {
      this.objectService.getDoc(docNum, this.docType).subscribe({
         next: (response) => {
            if (response.status === 200) {
               let apiResponse: InboundHeaderForWD = response.body[0];
               this.selectedDocs.unshift(apiResponse);
               this.uniqueOutstandingDocNum = [...new Set(this.selectedDocs.flatMap(r => r.inboundDocNum))];
            }
         },
         error: (error) => {
            console.error(error);
         }
      });
   }

   patchHeader() {
      if (this.selectedDocs && this.selectedDocs.length > 0) {
         this.onCustomerSelected({ id: this.selectedDocs[0].customerId });
         this.objectForm.patchValue({
            locationId: this.selectedDocs[0].toLocationId,
            customerId: this.selectedDocs[0].customerId,
            toLocationId: this.selectedDocs[0].locationId,
            typeCode: "T",
            copyFrom: this.docType
         });
         if (this.objectService.object && this.objectService.object.header && this.objectService.object.header.multiInboundId > 0) {
            this.objectService.multiInboundObject.outstandingInboundList.forEach(r => {
               if (r.multiInboundOutstandingId === null) r.multiInboundOutstandingId = 0;
               r.multiInboundId = this.objectForm.controls.multiInboundId.value;
            })
         }
      }
   }

   onCustomerSelected(event: SearchDropdownList, ignoreLocationUpdate: boolean = false) {
      if (event) {
         this.objectForm.patchValue({ customerId: event.id });
         var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
         if (lookupValue != undefined) {
            this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
            if (lookupValue.attributeArray1.length > 0) {
               this.objectService.customerLocationMasterList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
            } else {
               this.objectService.customerLocationMasterList = [];
            }
         }
         if (!ignoreLocationUpdate) {
            if (lookupValue.attribute5 === "T") {
               this.objectForm.controls.toLocationId.clearValidators();
               this.objectForm.controls.toLocationId.updateValueAndValidity();
               this.objectForm.patchValue({ locationId: parseInt(lookupValue.attribute6), toLocationId: null });
               this.onDestinationLocationSelected({ id: parseInt(lookupValue.attribute6) });
               this.onCustomerLocationSelected({ id: null });
            } else {
               this.objectForm.patchValue({ toLocationId: null });
               this.onCustomerLocationSelected({ id: null });
            }
            if (lookupValue.attributeArray1.length === 1) {
               this.objectForm.patchValue({ toLocationId: this.objectService.customerLocationMasterList[0].id });
               this.onCustomerLocationSelected({ id: this.objectService.customerLocationMasterList[0].id });
            }
         }

         //Auto map object type code
         if (lookupValue.attribute5 === "T" || lookupValue.attribute5 === "F" || lookupValue.attribute5 === "B") {
            this.objectForm.patchValue({ typeCode: "S" });
            this.objectForm.controls["typeCode"].disable();
         } else {
            this.objectForm.patchValue({ typeCode: "T" });
            this.objectForm.controls["typeCode"].disable();
         }

         if (lookupValue.attribute5 === "T") {
            // handle location
            this.objectService.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 === "W");
            if (this.objectService.allowedLocation.length > 0) {
               this.objectService.fLocationMasterList = this.objectService.fLocationMasterList.filter(x => this.objectService.allowedLocation.includes(x.id));
            }
            if (lookupValue !== undefined) {
               this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6) });
               this.onDestinationLocationSelected({ id: parseInt(lookupValue.attribute6) });
            }
         } else {
            this.objectService.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 !== "B");
            if (this.objectService.allowedLocation.length > 0) {
               this.objectService.fLocationMasterList = this.objectService.fLocationMasterList.filter(x => this.objectService.allowedLocation.includes(x.id));
            }
         }
         if (lookupValue.attribute5 === "T") {
            if (lookupValue.attribute10) {
               this.objectForm.patchValue({ masterUDGroup1: parseInt(lookupValue.attribute10) });
            } else {
               this.objectForm.patchValue({ masterUDGroup1: null });
            }
            if (lookupValue.attribute12) {
               this.objectForm.patchValue({ masterUDGroup2: parseInt(lookupValue.attribute12) });
            } else {
               this.objectForm.patchValue({ masterUDGroup2: null });

            }
            if (lookupValue.attribute13) {
               this.objectForm.patchValue({ masterUDGroup3: parseInt(lookupValue.attribute13) });
            } else {
               this.objectForm.patchValue({ masterUDGroup3: null });
            }
         }
      } else {
         this.objectForm.patchValue({ customerId: null });
      }
   }
   
   uniqueOutstandingDocNum: any[] = [];
   getDocRowData(rowData: any, groupType: string) {
      if (this.objectService.multiInboundObject && this.objectService.multiInboundObject.outstandingInboundList && this.objectService.multiInboundObject.outstandingInboundList.length > 0) {
         if (groupType === "D") {
            return this.objectService.multiInboundObject.outstandingInboundList.filter(r => r.inboundDocNum === rowData);
         }
         if (groupType === "I") {
            return this.objectService.multiInboundObject.outstandingInboundList.filter(r => r.itemId === rowData);
         }
      }
      return null;
   }

   getInboundDocNum(rowData: number) {
      if (this.objectService.multiInboundObject && this.objectService.multiInboundObject.outstandingInboundList && this.objectService.multiInboundObject.outstandingInboundList.length > 0) {
         return [...new Set(this.objectService.multiInboundObject.outstandingInboundList.filter(r => r.itemId === rowData).flatMap(r => r.inboundDocNum))].join(", ");
      }
      return null;
   }

   /* #endregion */

   /* #region dropdown event */

   onDestinationLocationSelected(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ locationId: event.id });
         if (event && this.objectService.multiInboundObject.inboundCarton.length > 0) {
            this.objectService.multiInboundObject.inboundCarton.forEach(element => {
               element.inboundList.forEach(x => {
                  x.locationId = event.id;
               })
            })
         }
      } else {
         this.objectForm.patchValue({ locationId: null });
      }
   }

   onCustomerLocationSelected(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ toLocationId: event.id });
         let lookupValue = this.objectService.locationMasterList.find(r => r.id === this.objectForm.controls["toLocationId"].value);
         //To patch location id if selected location is mapped to location warehouse
         if (lookupValue && lookupValue.attribute15) {
            this.objectForm.patchValue({ locationId: lookupValue.attribute15 });
            this.onDestinationLocationSelected({ id: parseInt(lookupValue.attribute15) });
         }
      } else {
         this.objectForm.patchValue({ toLocationId: null });
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

   swapCustomerLocation() {
      this.isByLocation = !this.isByLocation;
      if (this.isByLocation) {
         this.objectForm.patchValue({ customerId: null, toLocationId: null, businessModelType: null });
      } else {
         this.objectForm.patchValue({ customerId: null, toLocationId: null, businessModelType: null });
      }
      // this.objectForm.controls["customerId"].enable();
      this.customerDisabled = false;
   }

   onWarehouseAgentSelected(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ warehouseAgentId: event.id });
      } else {
         this.objectForm.patchValue({ warehouseAgentId: null });
      }
   }

   /* #endregion */

   /* #region form */

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         multiInboundId: [0],
         multiInboundNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         locationId: [null],
         toLocationId: [null],
         customerId: [null],
         typeCode: [null],
         warehouseAgentId: [JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId],
         warehouseAgent02Id: [null],
         multiInboundUDField1: [null],
         multiInboundUDField2: [null],
         multiInboundUDField3: [null],
         multiInboundUDOption1: [null],
         multiInboundUDOption2: [null],
         multiInboundUDOption3: [null],
         deactivated: [null],
         workFlowTransactionId: [null],
         masterUDGroup1: [null],
         masterUDGroup2: [null],
         masterUDGroup3: [null],
         businessModelType: [null],
         isWithDoc: [true],
         groupType: ["D"],
         sourceType: ["M"],
         remark: [null],
         totalCarton: [null],
         copyFrom: [null],
         referenceNum: [null],
         externalDocNum: [null],
         trxDateTime: [null],
         returnDate: [null],
         printCount: [null],
         childId: [null],
         childNum: [null],
         childDocType: [null],
         reasonId: [null],
         isGoodsReturn: [null],
         createdBy: [null],
         modifiedBy: [null]
      });
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

   @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
   onDoneScanning(event) {
      try {
         if (event) {
            this.barcodeInput.nativeElement.focus();
            this.validateDoc(event);
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

   /* #endregion */

   /* #region detail modal */

   async showDetail() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-item");
   }

   /* #endregion */

   /* #region steps */

   nextStep() {
      try {
         this.objectService.setHeader(this.objectForm.getRawValue());
         this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-item");
      } catch (e) {
         console.error(e);
      }
   }

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
            this.navController.navigateBack("/transactions/inbound-scan");
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
