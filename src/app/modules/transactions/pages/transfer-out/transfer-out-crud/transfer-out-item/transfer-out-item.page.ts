import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { ActionSheetController, AlertController, IonPopover, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { TransferOutLine, TransferOutRoot } from 'src/app/modules/transactions/models/transfer-out';
import { TransferOutService } from 'src/app/modules/transactions/services/transfer-out.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInfo } from '@capacitor/filesystem/dist/esm/definitions';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, GalleryPhotos, Photo } from '@capacitor/camera';
import { CashDepositFileSimpleList } from 'src/app/modules/transactions/models/cash-deposit';

const IMAGE_DIR = 'stored-images';
interface LocalFile {
   name: string;
   path: string;
   data: string;
}

@Component({
   selector: 'app-transfer-out-item',
   templateUrl: './transfer-out-item.page.html',
   styleUrls: ['./transfer-out-item.page.scss'],
})
export class TransferOutItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage

   constructor(
      public objectService: TransferOutService,
      public authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController,
      private plt: Platform
   ) { }

   ionViewWillEnter(): void {

   }

   ionViewDidEnter(): void {

   }

   ngOnInit() {

   }

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
            await this.barcodescaninput.validateBarcode(event);
            if (this.objectService.configMobileScanItemContinuous) {
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

   /* #region barcode & check so */

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (event) {
            event.forEach(async r => {
               let outputData: TransferOutLine = {
                  id: 0,
                  uuid: uuidv4(),
                  transferOutId: this.objectService.objectHeader.transferOutId,
                  sequence: 0,
                  itemId: r.itemId,
                  itemCode: r.itemCode,
                  itemSku: r.itemSku,
                  itemDesc: r.description,
                  xId: r.itemVariationXId,
                  xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.code,
                  xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
                  yId: r.itemVariationYId,
                  yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.code,
                  yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
                  barcode: r.itemBarcode,
                  lineQty: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  qtyRequest: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  isDeleted: false,
                  unitPrice: r.itemPricing?.unitPrice,
                  unitPriceExTax: r.itemPricing?.unitPrice,
                  discountGroupCode: r.itemPricing?.discountGroupCode,
                  discountExpression: r.itemPricing?.discountExpression,
                  containerNum: null,
               }
               if (this.objectService.configTransferOutActivateContainerNum) {
                  outputData.containerNum = this.objectService.pageNum;
               }
               await this.commonService.computeDiscTaxAmount(outputData, false, false, false, 2); // todo : use tax??
               this.insertIntoLine(outputData);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async qtyInputBlur(event, rowIndex) {
      if (rowIndex === null || rowIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      } else {
         this.objectService.objectDetail[rowIndex].qtyRequest = this.objectService.objectDetail[rowIndex].lineQty;
         await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[rowIndex], false, false, false, 2);
      }
   }

   async insertIntoLine(event: TransferOutLine) {
      if (event) {
         if (this.objectService.objectDetail !== null && this.objectService.objectDetail.length > 0) {
            if (this.objectService.objectDetail[0].itemSku === event.itemSku && this.objectService.objectDetail[0].containerNum === event.containerNum) {
               this.objectService.objectDetail[0].lineQty += event.lineQty;
               this.objectService.objectDetail[0].qtyRequest = this.objectService.objectDetail[0].lineQty;
               await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[0], false, false, false, 2);
            } else {
               this.objectService.objectDetail.forEach(r => r.sequence += 1);
               this.objectService.objectDetail.unshift(event);
            }
         } else {
            this.objectService.objectDetail.forEach(r => r.sequence += 1);
            this.objectService.objectDetail.unshift(event);
         }
      }
   }

   async deleteLine(rowIndex: number, event: TransferOutLine) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Are you sure to delete?",
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "danger",
               handler: async () => {
                  this.objectService.objectDetail.splice(rowIndex, 1);
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
   }

   /* #region  misc */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #endregion */

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/transfer-out/transfer-out-header");
      } catch (e) {
         console.error(e);
      }
   }

   isCountingTimer: boolean = true;
   async nextStep() {
      if (this.isCountingTimer) {
         this.isCountingTimer = false;
         const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
                  cssClass: "success",
                  handler: async () => {
                     await this.saveObject();
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
      }
      setTimeout(() => {
         this.isCountingTimer = true;
      }, 1000);
   }

   async saveObject() {
      let object: TransferOutRoot;
      object = this.objectService.objectHeader;
      object.line = this.objectService.objectDetail;
      if (object.line.filter(r => r.qtyRequest === null || r.qtyRequest === undefined || r.qtyRequest <= 0).length > 0) {
         await this.removeInvalidLine(object);
         return;
      }
      if (object.line !== null && object.line.length > 0) {
         if (this.objectService.objectHeader.transferOutId > 0) {
            await this.loadingService.showLoading();
            this.objectService.updateObject(object).subscribe(async response => {
               if (response.status === 204) {
                  this.toastService.presentToast("", "Transfer Out updated", "top", "success", 1000);
                  for await (const image of this.images) {
                     await this.startUpload(image, this.objectService.objectHeader.transferOutId, 0);
                  }
                  await this.removeDir();
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: this.objectService.objectHeader.transferOutId
                     }
                  }
                  await this.loadingService.dismissLoading();
                  this.objectService.resetVariables();
                  this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
               }
            }, error => {
               console.error(error);
            })
         } else {
            this.objectService.insertObject(object).subscribe(async response => {
               if (response.status === 201) {
                  this.toastService.presentToast("", "Transfer Out created", "top", "success", 1000);
                  let objectId = (response.body as TransferOutRoot).transferOutId;
                  for await (const image of this.images) {
                     await this.startUpload(image, objectId, 0);
                  }
                  await this.removeDir();
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: objectId
                     }
                  }
                  await this.loadingService.dismissLoading();
                  this.objectService.resetVariables();
                  this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
               }
            }, error => {
               console.error(error);
            })
         }
      } else {
         this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
      }
   }

   async removeInvalidLine(object: TransferOutRoot) {
      let itemCodeString = "";
      if (this.objectService.configTransferOutActivateContainerNum) {
         itemCodeString = object.line.filter(r => r.qtyRequest === null || r.qtyRequest === undefined || r.qtyRequest <= 0).flatMap(r => r.itemCode + ` [Ctr. ${r.containerNum}]`).join(", ");
      } else {
         itemCodeString = object.line.filter(r => r.qtyRequest === null || r.qtyRequest === undefined || r.qtyRequest <= 0).flatMap(r => r.itemCode).join(", ");
      }
      const alert = await this.alertController.create({
         header: "Do you want to remove invalid lines and save?",
         subHeader: itemCodeString,
         cssClass: "custom-action-sheet",
         buttons: [
            {
               text: "Yes",
               role: "confirm",
               cssClass: "success",
               handler: async () => {
                  this.objectService.objectDetail = this.objectService.objectDetail.filter(r => r.qtyRequest > 0);
                  await this.saveObject();
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

   modifyPageNum(typeCode: string) {
      if (typeCode == 'A') {
         this.objectService.pageNum++;
         this.objectService.objectHeader.totalCarton = this.objectService.pageNum;
      } else {
         if (this.objectService.pageNum != 1) {
            this.objectService.pageNum--;
         }
      }
   }

   sendForDebug() {
      let object: TransferOutRoot;
      object = this.objectService.objectHeader;
      object.line = this.objectService.objectDetail;
      let jsonObjectString = JSON.stringify(object);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

   /* #region attachment */

   attachmentModel: boolean = false;
   viewAttachment() {
      this.showAttachmentModal();
   }

   showAttachmentModal() {
      this.attachmentModel = true;
   }

   hideAttachmentModal() {
      this.attachmentModel = false;
   }

   images: LocalFile[] = [];

   // Select Image action
   async imageAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Select Multiple Images",
                  icon: "image-outline",
                  handler: async () => {
                     await this.selectImage(1);
                  }
               },
               {
                  text: "Snap Picture",
                  icon: "camera-outline",
                  handler: async () => {
                     await this.selectImage(2);
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   async selectImage(type: number) {
      if (type == 1) {
         try {
            const images: GalleryPhotos = await Camera.pickImages({
               quality: 50,
            });

            if (images && images.photos.length > 0) {
               for await (let image of images.photos) {
                  await this.saveImage(image);
               }

               // Reload the file list
               // Improve by only loading for the new image and unshifting array!
               await this.loadFiles();
            }
         } catch (e) {
            console.error(e);
         }
      }
      if (type == 2) {
         const image = await Camera.getPhoto({
            quality: 50,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera, // Camera, Photos or Prompt!
         });

         if (image) {
            await this.saveImage(image);

            // Reload the file list
            // Improve by only loading for the new image and unshifting array!
            await this.loadFiles();
         }
      }
   }

   // Create a new file from a capture image
   async saveImage(photo: Photo | GalleryPhoto) {
      try {
         const base64Data = await this.readAsBase64(photo);

         const fileName = new Date().getTime() + ".jpeg";
         const savedFile = await Filesystem.writeFile({
            path: `${IMAGE_DIR}/${fileName}`,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
         });
      } catch (e) {
         console.error(e);
      }
   }

   async loadFiles() {
      try {
         this.images = [];

         await this.loadingService.showLoading();

         Filesystem.readdir({
            path: IMAGE_DIR,
            directory: Directory.Data
         })
            .then(
               (result) => {
                  this.loadFileData(result.files);
               },
               async (err) => {
                  // Folder does not yet exists!
                  await Filesystem.mkdir({
                     path: IMAGE_DIR,
                     directory: Directory.Data
                  });
               }
            )
            .then(async (_) => {
               await this.loadingService.dismissLoading();
            });
      } catch (e) {
         console.error(e);
      }
   }

   // Get the actual base64 data of an image
   // base on the name of the file
   fileToDelete: LocalFile[] = [];
   async loadFileData(fileNames: FileInfo[]) {
      try {
         this.fileToDelete = [];
         for (let f of fileNames) {
            const filePath = `${IMAGE_DIR}/${f.name}`;

            const readFile = await Filesystem.readFile({
               path: filePath,
               directory: Directory.Data
            });
            if (f.size > this.objectService.fileSizeLimit) {
               this.fileToDelete.push({
                  name: f.name,
                  path: filePath,
                  data: `data:image/jpeg;base64,${readFile.data}`
               });
               this.toastService.presentToast("File size too large", "", "top", "danger", 1500);
            } else {
               this.images.push({
                  name: f.name,
                  path: filePath,
                  data: `data:image/jpeg;base64,${readFile.data}`
               });
            }
         }
         this.fileToDelete.forEach(e => {
            this.deleteImage(e);
         });
      } catch (e) {
         console.error(e);
      }
   }

   // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
   private async readAsBase64(photo: Photo | GalleryPhoto) {
      try {
         if (this.plt.is("hybrid")) {
            const file = await Filesystem.readFile({
               path: photo.path
            });

            return file.data;
         }
         else {
            // Fetch the photo, read as a blob, then convert to base64 format
            const response = await fetch(photo.webPath);
            const blob = await response.blob();

            return await this.convertBlobToBase64(blob) as string;
         }
      } catch (e) {
         console.error(e);
      }
   }

   // Helper function
   convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
         resolve(reader.result);
      };
      reader.readAsDataURL(blob);
   });

   async startUpload(file: LocalFile, objectId: number, fileId: number) {
      try {
         const response = await fetch(file.data);
         const blob = await response.blob();
         const formData = new FormData();
         formData.append("file", blob, file.name);
         this.objectService.uploadFile(objectId, fileId, formData).subscribe(response => {

         }, error => {
            console.log(error);
         })
         // this.uploadData(formData, objectId, fileId);
      } catch (e) {
         console.error(e);
      }
   }

   async deleteAction(file: LocalFile) {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Confirm",
                  icon: "checkmark",
                  handler: async () => {
                     await this.deleteImage(file);
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   async deleteImage(file: LocalFile) {
      try {
         await Filesystem.deleteFile({
            directory: Directory.Data,
            path: file.path
         });
         this.loadFiles();
      } catch (e) {
         console.error(e);
      }
   }

   async presentDeleteOnlineImageAlert(file: CashDepositFileSimpleList) {
      try {
         const alert = await this.alertController.create({
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.deleteOnlineImage(file.filesId);
                     this.objectService.objectAttachment = this.objectService.objectAttachment.filter(r => r.filesId !== file.filesId);
                     this.objectService.attachment = this.objectService.attachment.filter(r => r.filesId !== file.filesId);
                  },
               },
               {
                  text: "Cancel",
                  cssClass: "cancel",
                  role: "cancel"
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   deleteOnlineImage(fileId: number) {
      this.objectService.deleteFile(fileId).subscribe({
         next: (response) => {

         },
         error: (error) => {
            console.error(error);
         }
      })
   }

   async removeDir() {
      try {
         await Filesystem.rmdir({
            path: IMAGE_DIR,
            directory: Directory.Data,
            recursive: true
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   showTotalByCarton: boolean = false;
   getTotalByCarton() {
      let result: Map<number, number> = new Map([]);
      this.objectService.objectDetail.flatMap(r => r.containerNum).forEach(r => {
         result.set(r, this.objectService.objectDetail.filter(rr => rr.containerNum === r).map(rr => rr.lineQty).reduce((a, b) => a + b, 0));
      })
      return result;
   }

}