import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { NavController, ActionSheetController, ViewWillEnter, ViewDidEnter, AlertController } from '@ionic/angular';
import { CartonInfo, CartonTruckLoadingDetail, CartonTruckLoadingRoot, TruckArrangementListForCTL, TruckArrangementRootForCTL } from 'src/app/modules/transactions/models/carton-truck-loading';
import { CartonTruckLoadingService } from 'src/app/modules/transactions/services/carton-truck-loading.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { GeneralScanInputPage } from 'src/app/shared/pages/general-scan-input/general-scan-input.page';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-carton-truck-loading-header',
   templateUrl: './carton-truck-loading-header.page.html',
   styleUrls: ['./carton-truck-loading-header.page.scss'],
})
export class CartonTruckLoadingHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;
   pendingList: TruckArrangementListForCTL[] = [];
   pendingListSearch: SearchDropdownList[] = [];

   submit_attempt: boolean = false;

   constructor(
      public objectService: CartonTruckLoadingService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private formBuilder: FormBuilder,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController
   ) {
      this.newObjectForm();
   }

   async ionViewWillEnter(): Promise<void> {
      await this.loadPendingList();
      if (this.objectService.objectHeader && this.objectService.objectHeader.cartonTruckLoadingId > 0) {
         this.objectForm.patchValue(this.objectService.objectHeader);
         await this.onTruckArrangmentSelected({ id: this.objectService.objectHeader.truckArrangementId });
      }
   }

   @ViewChild("tasdd", { static: false }) tasdd: SearchDropdownPage;
   ionViewDidEnter(): void {      
      this.tasdd.setScanInputFocus();
   }

   ngOnInit() {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         cartonTruckLoadingId: [0],
         cartonTruckLoadingNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
         vehicleId: [null],
         driverId: [null],
         transportAgentId1: [null],
         transportAgentId2: [null],
         truckArrangementId: [null, [Validators.required]],
         truckArrangementNum: [null, [Validators.required]],
         remark: [null, [Validators.maxLength(1000)]],
         cartonTruckLoadingUDField1: [null],
         cartonTruckLoadingUDField2: [null],
         cartonTruckLoadingUDField3: [null],
         cartonTruckLoadingUDOption1: [null],
         cartonTruckLoadingUDOption2: [null],
         cartonTruckLoadingUDOption3: [null],
         masterUDGroup1: [null],
         masterUDGroup2: [null],
         masterUDGroup3: [null],
         deactivated: [null],
      });
   }

   loadPendingList() {
      try {
         this.pendingList = [];
         this.pendingListSearch = [];
         this.objectService.getPendingList().subscribe({
            next: async (response) => {
               this.pendingList = response;
               for await (const r of this.pendingList) {
                  this.pendingListSearch.push({
                     id: r.truckArrangementId,
                     code: r.truckArrangementNum,
                     description: r.truckArrangementNum
                  })
               }
            },
            error: (error) => {
               console.error(error);
            }
         })
      } catch (error) {
         console.error(error);
      }
   }

   onTruckArrangmentSelected(event) {
      try {
         if (event) {
            this.objectService.getPendingObjectById(event.id).subscribe({
               next: async (response) => {
                  let selectedPendingObject = response;
                  this.objectService.setTA(selectedPendingObject);
                  let objectDetail: CartonTruckLoadingDetail[] = [];
                  for await (const r of this.objectService.objectTA.details) {
                     let data: CartonTruckLoadingDetail = {
                        cartonInfo: r.cartonInfo,
                        cartonBarcode: [],
                        typeCode: r.typeCode,
                        trxId: r.trxId,
                        trxNum: r.trxNum,
                        trxType: r.trxType,
                        customerName: r.customerName,
                        totalCarton: r.totalCarton,
                        qty: r.qty,
                        remark: r.remark,
                        transportId: r.transportId,
                        cartonTruckLoadingLineId: 0,
                        cartonTruckLoadingId: this.objectForm.controls.cartonTruckLoadingId.value,
                        truckArrangementLineId: r.truckArrangementLineId,
                        sequence: objectDetail.length
                     };
                     objectDetail.push(data);
                  }
                  if (this.objectForm.controls.cartonTruckLoadingId.value === 0) {
                     await this.objectService.setLine(objectDetail);
                     this.objectForm.patchValue({
                        truckArrangementId: response.header.truckArrangementId,
                        truckArrangementNum: response.header.truckArrangementNum,
                        vehicleId: response.header.vehicleId,
                        driverId: response.header.driverId,
                        transportAgentId1: response.header.transportAgentId1,
                        transportAgentId2: response.header.transportAgentId2
                     });
                     this.objectService.setHeader(this.objectForm.value);
                     setTimeout(() => {
                        this.generalscan.setFocus();
                     }, 10);
                  }
               },
               error: (error) => {
                  console.error(error);
               }
            })
         } else {
            this.objectService.removeTA();
            this.objectForm.patchValue({
               truckArrangementId: null,
               truckArrangementNum: null,
               vehicleId: null,
               driverId: null,
               transportAgentId1: null,
               transportAgentId2: null
            });
         }
      } catch (error) {
         console.error(error);
      }
   }

   editModal: boolean = false;
   selectedIndex: number;
   selectedLine: CartonTruckLoadingDetail;
   editLine(rowData, rowIndex) {
      this.selectedLine = JSON.parse(JSON.stringify(rowData)) as CartonTruckLoadingDetail;
      this.selectedIndex = rowIndex;
      this.editModal = true;
   }

   async onEdiModalHide() {
      this.selectedIndex = null;
      this.selectedLine = null;
   }

   async cancelEdit() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.editModal = false;
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

   deleteLineLine(rowData, rowIndex) {
      this.selectedLine.cartonBarcode.splice(rowIndex, 1);
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         return;
      } else {
         this.objectService.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedLine));
         this.editModal = false;
      }
   }

   async deleteLine(rowData, rowIndex) {
      try {
         const alert = await this.alertController.create({
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     this.objectService.objectDetail.splice(rowIndex, 1);
                  },
               },
               {
                  text: "Cancel",
                  cssClass: "cancel",
                  role: "cancel",
                  handler: async () => {
                     this.submit_attempt = false;
                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   transformCartonInfo(cartonInfo: CartonInfo[]) {
      if (cartonInfo && cartonInfo.length > 0) {
         let uniquePackaging = cartonInfo.map(x => x.packagingCode);
         let endResult = [];
         uniquePackaging = [...new Set(uniquePackaging)];
         uniquePackaging.forEach(packaging => {
            let transformedCartonInfo = cartonInfo.map(x => {
               let newLine = { cartonNum: x.cartonNum, packagingCode: x.packagingCode }
               return newLine;
            })
            let uniqueCartonInfo = transformedCartonInfo.reduce((accumulator, current) => {
               if (!accumulator.find((item) => item.cartonNum === current.cartonNum && item.packagingCode === current.packagingCode)) {
                  accumulator.push(current);
               }
               return accumulator;
            }, []);
            let packageArray = uniqueCartonInfo.filter(x => x.packagingCode === packaging)
            let newLine = { packagingCode: packaging, qty: packageArray.length }
            endResult.push(newLine);
         })
         return endResult;
      } else {
         return [];
      }
   }

   onScanCompleted(event) {
      if (event) {
         let cartonBarcode = event.toUpperCase();
         this.scanCartonBarcode(cartonBarcode)
      }
   }

   @ViewChild("generalscan", { static: false }) generalscan: GeneralScanInputPage;
   async scanCartonBarcode(barcode: string) {
      let barcodeList = [...this.objectService.objectTA?.cartonBarcode];
      let foundBarcodes = barcodeList.filter(r => r.cartonBarcode === barcode);
      let barcodeExist = false;
      let cartonNotMatch = false;
      let invalidBarcode = false;
      if (foundBarcodes && foundBarcodes.length > 0) {
         for await (const foundBarcode of foundBarcodes) {
            let findTrx = this.objectService.objectDetail.find(r => r.trxNum === foundBarcode.trxNum);
            if (findTrx) {
               let rowIndex = this.objectService.objectDetail.findIndex(rr => rr.truckArrangementLineId === findTrx.truckArrangementLineId)
               if (findTrx.cartonBarcode.length < findTrx.totalCarton) {
                  let cartonExist = this.objectService.objectDetail[rowIndex].cartonBarcode.find(r => r === foundBarcode.cartonBarcode)
                  if (!cartonExist) {
                     this.objectService.objectDetail[rowIndex].cartonBarcode.push(foundBarcode.cartonBarcode);
                     barcodeExist = false;
                  } else {
                     barcodeExist = true;
                     continue;
                  }
                  cartonNotMatch = false;
               } else {
                  cartonNotMatch = true;
                  continue;
               }
               invalidBarcode = false;
            } else {
               invalidBarcode = true;
               continue;
            }
         }
         if (barcodeExist) {
            this.toastService.presentToast("", "Carton Barcode already exist", "top", "warning", 1000);
         }
         if (cartonNotMatch) {
            this.toastService.presentToast("", "Number of Carton doesn't match to Total Carton", "top", "warning", 1000);
         }
         if (invalidBarcode) {
            this.toastService.presentToast("", "Invalid Carton Barcode", "top", "warning", 1000);
         }
      } else {
         this.toastService.presentToast("", "Invalid Carton Barcode", "top", "warning", 1000);
      }
   }

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(event: string) {
      if (event) {
         await this.onScanCompleted(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
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
            this.navController.navigateBack("/transactions/carton-truck-loading");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     if (this.objectService.objectHeader.cartonTruckLoadingId > 0) {
                        await this.updateObject();
                     } else {
                        await this.insertObject();
                     }
                  },
               },
               {
                  text: "Cancel",
                  cssClass: "cancel",
                  role: "cancel",
                  handler: async () => {
                     this.submit_attempt = false;
                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         let trxDto: CartonTruckLoadingRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         if (trxDto.details.length !== this.objectService.objectTA?.details.length) {
            this.toastService.presentToast("Insert Failed", "Carton Truck Loading Line doesn't not match with Truck Arrangement Line", "top", "warning", 1000);
            return;
         }
         if (!this.validateCTLLine(trxDto)) {
            return;
         }
         this.objectService.insertObject(trxDto).subscribe(async response => {
            // this.objectService.setSummary(response.body);
            await this.loadingService.dismissLoading();
            this.objectService.resetVariables();
            this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: (response.body as CartonTruckLoadingRoot).header.cartonTruckLoadingId
               }
            }
            this.navController.navigateRoot("/transactions/carton-truck-loading/carton-truck-loading-detail", navigationExtras);
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         let trxDto: CartonTruckLoadingRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail,
         }
         if (trxDto.details.length !== this.objectService.objectTA?.details.length) {
            this.toastService.presentToast("Insert Failed", "Carton Truck Loading Line doesn't not match with Truck Arrangement Line", "top", "warning", 1000);
            return;
         }
         if (!this.validateCTLLine(trxDto)) {
            return;
         }
         this.objectService.updateObject(trxDto).subscribe(async response => {
            // this.objectService.setSummary(response.body);
            await this.loadingService.dismissLoading();
            this.objectService.resetVariables();
            this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: trxDto.header.cartonTruckLoadingId
               }
            }
            this.navController.navigateRoot("/transactions/carton-truck-loading/carton-truck-loading-detail", navigationExtras);
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         });
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   validateCTLLine(object: CartonTruckLoadingRoot) {
      let valid: boolean = true;
      let invalidTrxList = object.details.filter(r => r.totalCarton && r.cartonBarcode.length != r.totalCarton && r.typeCode === "O" && r.trxType != "Other Delivery")
      if (invalidTrxList) {
         for (let [index, trx] of invalidTrxList.entries()) {
            let trxTotalNonNullCartonAmount = this.objectService.objectTA?.cartonBarcode.filter(r => r.trxNum === trx.trxNum && r.cartonBarcode !== null)?.length ?? 0;
            if (trxTotalNonNullCartonAmount === trx.totalCarton) {
               valid = false;
            }
            if (!valid) {
               this.toastService.presentToast("Failed", "Scanned Cartons doesn't match Total Carton: " + invalidTrxList[index].trxNum, "top", "warning", 1000);
               break;
            }
         }
      }
      return valid;
   }

   validateCTL(rowData: CartonTruckLoadingDetail) {
      let valid: boolean = true;
      let invalidTrxList = (rowData.totalCarton && rowData.cartonBarcode.length != rowData.totalCarton && rowData.typeCode === "O" && rowData.trxType !== "Other Delivery");
      if (invalidTrxList) {
         // let trxTotalCartonAmount = this.selectedTruckArrangement.cartonBarcode.filter(r => r.trxNum == trx.trxNum)?.length ?? 0;
         let trxTotalNonNullCartonAmount = this.objectService.objectTA?.cartonBarcode.filter(r => r.trxNum == rowData.trxNum && r.cartonBarcode != null)?.length ?? 0;
         if (trxTotalNonNullCartonAmount == rowData.totalCarton) {
            valid = false;
         }
      }
      return valid;
   }

   onTAScanCompleted(event: string) { // truck arrangement
      try {
         if (event) {
            let found = this.pendingListSearch.find(r => r.code.toUpperCase() === event.toUpperCase());
            if (found) {
               this.onTruckArrangmentSelected({ id: found.id });
            } else {
               this.toastService.presentToast("", "Invalid Truck Arrangment", "top", "warning", 1000);
            }            
         }
      } catch (e) {
         console.error(e);
      }
   }

   onTADoneScanning(event) { // truck arrangement
      try {
         if (event) {
            let found = this.pendingListSearch.find(r => r.code.toUpperCase() === event.toUpperCase());
            if (found) {
               this.onTruckArrangmentSelected({ id: found.id });
            } else {
               this.toastService.presentToast("", "Invalid Truck Arrangment", "top", "warning", 1000);
            }            
         }
      } catch (e) {
         console.error(e);
      }
   }

   refreshTruckArrangment() {
      if (this.objectForm.controls.truckArrangementId.value) {
         this.onTruckArrangementRefreshed(this.objectForm.controls.truckArrangementId.value);
      } else {
         this.toastService.presentToast("", "Please select Truck Arrangement", "top", "warning", 1000);
      }
   }

   onTruckArrangementRefreshed(traId: number) {
      this.objectService.getPendingObjectById(traId).subscribe({
         next: (response) => {
            let refreshed = response
            if (refreshed) {
               let selectedPendingObject = refreshed;
               this.objectService.setTA(selectedPendingObject);
               this.objectForm.patchValue({
                  vehicleId: refreshed?.header?.vehicleId,
                  driverId: refreshed?.header?.driverId,
                  transportAgentId1: refreshed?.header?.transportAgentId1,
                  transportAgentId2: refreshed?.header?.transportAgentId2,
                  truckArrangementId: refreshed?.header?.truckArrangementId,
                  truckArrangementNum: refreshed?.header?.truckArrangementNum
               })
               this.checkAndRefreshTALine(refreshed);
               this.toastService.presentToast("", "Track Arrangment refrehsed", "top", "success", 1000);
            }
         }
      })
   }

   async checkAndRefreshTALine(refreshed: TruckArrangementRootForCTL) {
      this.objectService.objectTA.cartonBarcode = JSON.parse(JSON.stringify(refreshed.cartonBarcode)); // replace carton barcode
      this.objectService.objectDetail = this.objectService.objectDetail.filter(r => refreshed.details.flatMap(rr => rr.trxNum).includes(r.trxNum));
      let newlyAddedLine = refreshed.details.filter(r => !this.objectService.objectDetail.flatMap(rr => rr.trxNum).includes(r.trxNum));      
      let objectDetail = [];
      for await (const r of newlyAddedLine) {
         let data: CartonTruckLoadingDetail = {
            cartonInfo: r.cartonInfo,
            cartonBarcode: [],
            typeCode: r.typeCode,
            trxId: r.trxId,
            trxNum: r.trxNum,
            trxType: r.trxType,
            customerName: r.customerName,
            totalCarton: r.totalCarton,
            qty: r.qty,
            remark: r.remark,
            transportId: r.transportId,
            cartonTruckLoadingLineId: 0,
            cartonTruckLoadingId: this.objectForm.controls.cartonTruckLoadingId.value,
            truckArrangementLineId: r.truckArrangementLineId,
            sequence: (this.objectService.objectDetail.length??0) + (objectDetail.length ?? 0)
         };
         objectDetail.push(data);
      }
      this.objectService.objectDetail = [...this.objectService.objectDetail, ...objectDetail]
      
      // this.selectedTruckArrangement = this.selectedTruckArrangement.details.filter(r => refreshed.details.flatMap(rr => rr.trxId).includes(r.trxId) && refreshed.details.flatMap(rr => rr.trxType))
   }

}
