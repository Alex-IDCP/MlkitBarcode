import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DoAcknowledgementService } from '../../services/do-acknowledgement.service';
import { ActionSheetController, ModalController, NavController, Platform, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { DOAcknowledegementRequest, DoAcknowledgement } from '../../models/do-acknowledgement';
import { SignaturePad } from 'angular2-signaturepad';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { GeneralScanInputPage } from 'src/app/shared/pages/general-scan-input/general-scan-input.page';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, GalleryPhotos, Photo } from '@capacitor/camera';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
   name: string;
   path: string;
   data: string;
}

@Component({
   selector: 'app-do-acknowledgement',
   templateUrl: './do-acknowledgement.page.html',
   styleUrls: ['./do-acknowledgement.page.scss'],
})
export class DoAcknowledgementPage implements OnInit, ViewWillEnter, ViewDidEnter {

   cartonTruckLoadingNum: string
   deliveryOrderNum: string
   vehicleSearchDropdownList: SearchDropdownList[] = [];
   selectedVehicleId: any;
   remark: string;

   uniqueGrouping: Date[] = [];

   objects: DoAcknowledgement[] = [];
   submit_attempt: boolean = false;

   // @ViewChild("ctln", { static: false }) ctln: GeneralScanInputPage;
   @ViewChild("don", { static: false }) don: GeneralScanInputPage;

   constructor(
      public objectService: DoAcknowledgementService,
      private authService: AuthService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private plt: Platform
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.loadModuleControl();
      await this.objectService.loadRequiredMaster();
      await this.bindVehicleList();
   }

   ionViewDidEnter(): void {
      this.don.setFocus();
   }

   ngOnInit() {
      this.removeDir();
   }

   moduleControl: ModuleControl[] = [];
   fileSizeLimit: number = 1 * 1024 * 1024;
   // configDOAckFocus: string;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let uploadFileSizeLimit = this.moduleControl.find(x => x.ctrlName === "UploadFileSizeLimit")?.ctrlValue;
            this.fileSizeLimit = Number(uploadFileSizeLimit) * 1024 * 1024;
         })
      } catch (e) {
         console.error(e);
      }
   }

   vehicleIds: number[] = [];
   onVechicleSelected(event: any[]) {
      if (event && event !== undefined) {
         this.vehicleIds = event.flatMap(r => r.id);
      }
   }

   bindVehicleList() {
      this.objectService.vehicleMasterList.forEach(r => {
         this.vehicleSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      })
   }

   // Select action
   async selectAction() {
      try {
         Filesystem.readdir({
            path: IMAGE_DIR,
            directory: Directory.Data
         }).then(
            async (result) => {
               result.files.forEach(async f => {
                  await Filesystem.deleteFile({
                     directory: Directory.Data,
                     path: `${IMAGE_DIR}/${f.name}`
                  })
               })
            },
            async (err) => {
               // Folder does not yet exists!
               await Filesystem.mkdir({
                  path: IMAGE_DIR,
                  directory: Directory.Data
               });
            }
         ).then(async (_) => {
            await this.loadingService.dismissLoading()
         });
      } catch (error) {
         console.error(error);
      }
      let object: DOAcknowledegementRequest = {
         truckArrangementNum: this.cartonTruckLoadingNum,
         vehicleId: this.vehicleIds,
         deliveryOrderNum: this.deliveryOrderNum
      }
      await this.getObject(object);
   }

   async getObject(request: DOAcknowledegementRequest) {
      try {
         await this.loadingService.showLoading();
         this.objectService.loadObjects(request).subscribe({
            next: async (response) => {
               this.objects = response.body
            },
            error: async (error) => {
               console.error(error);
            }
         })
      } catch (error) {
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   signatureModal: boolean = false;
   selectedDo: DoAcknowledgement;
   acknowledge(object: DoAcknowledgement) {
      this.selectedDo = object;
      this.submit_attempt = false;
      this.openSignatureModal();
   }

   openSignatureModal() {
      this.signatureModal = true;
   }

   hideSignatureModal() {
      this.signaturePad.clear();
      this.images = [];
      this.signatureModal = false;
   }

   signModalDidDismiss() {
      this.signatureModal = false;
      this.don.setFocus();
   }

   @ViewChild("signaturePad") signaturePad: SignaturePad;
   signaturePadOptions: Object = {
      "minWidth": 5,
      "canvasWidth": 600,
      "canvasHeight": 400
   };

   cancel() {
      this.signaturePad.clear();
      this.signatureModal = false;
   }

   clear() {
      this.signaturePad.clear();
   }

   onVehicleChanged(event: SearchDropdownList) {
      if (event) {
         this.selectedVehicleId = event.id;
      } else {
         this.selectedVehicleId = null;
      }
   }

   images: LocalFile[] = [];
   async save() {
      if (!this.signaturePad.isEmpty()) {
         this.don.manualClearSearchValue();
         const fileName = this.selectedDo.deliveryOrderNum.replace(" ", "").replace("/", "") + "_Acknowledgement_" + "signature.png";
         const base64Data = this.signaturePad.toDataURL();
         try {
            await this.loadingService.showLoading();
            const splitDataURI = base64Data.split(',')
            const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
            const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
            const ia = new Uint8Array(byteString.length)
            for (let i = 0; i < byteString.length; i++) {
               ia[i] = byteString.charCodeAt(i)
            }
            var blob = new Blob([ia], { type: mimeString })
            await this.loadFileData(blob, fileName);
         } catch (e) {
            console.error(e);
            await this.loadingService.dismissLoading();
            this.submit_attempt = false;
         }
         finally {
            await this.loadingService.dismissLoading();
            this.submit_attempt = false;
         }
      }else{
         this.toastService.presentToast("", "Please sign", "top", "danger", 1000);
         this.submit_attempt = false;
      }
   }

   async saveAttachments(file: LocalFile, objectId: number, fileId: number) {
      try {
         const response = await fetch(file.data);
         const blob = await response.blob();
         const formData = new FormData();
         formData.append("file", blob, file.name);
         this.objectService.uploadFile(objectId, fileId, formData).subscribe(response => {
         
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   async onDONChanged(event) {
      if (event) {
         this.deliveryOrderNum = event;
      } else {
         this.deliveryOrderNum = null;
      }
   }

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDONDoneScanning(event: string) {
      if (event) {
         await this.onDONChanged(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region local attachment */

   async presentAlert() {
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

   async selectImage(type:number) {
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
         await this.loadingService.dismissLoading();
      }
   }

   async loadFileData(blob: Blob, fileNme?: string) {
      try {
         if (blob && fileNme) {
            const formData = new FormData();
            formData.append("file", blob, fileNme);
            this.objectService.postFile(formData, this.selectedDo.deliveryOrderId, 0).subscribe({
               next: async (response) => {
                  for await (const image of this.images) {
                     await this.saveAttachments(image, this.selectedDo.deliveryOrderId, 0);
                  }
                  this.selectedDo = null;
                  this.toastService.presentToast("", "DO Acknowledged", "top", "success", 1000);
                  this.selectedVehicleId = null;
                  this.remark = null;      
                  this.hideSignatureModal();
                  await this.selectAction();
                  await this.removeDir();
                  this.submit_attempt = false;
               },
               error: (error) => {
                  console.error(error);
                  this.submit_attempt = false;
               }
            })
         }
      } catch (error) {
         console.error(error);
         this.submit_attempt = false;
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
                  this.loadImages(result.files);
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
   
   imageToDelete: LocalFile[] = [];
   async loadImages(fileNames: FileInfo[]) {
      try {
         this.imageToDelete = [];
         for (let f of fileNames) {
            const filePath = `${IMAGE_DIR}/${f.name}`;
            const readFile = await Filesystem.readFile({
               path: filePath,
               directory: Directory.Data
            });
            if (f.size > this.fileSizeLimit) {
               this.imageToDelete.push({
                  name: f.name,
                  path: filePath,
                  data: `data:image/jpeg;base64,${readFile.data}`
               });
               this.toastService.presentToast("", "File size too large", "top", "danger", 1500);
            } else {
               this.images.push({
                  name: f.name,
                  path: filePath,
                  data: `data:image/jpeg;base64,${readFile.data}`
               });
            }
         }
         this.imageToDelete.forEach(e => {
            this.deleteImage(e);
         });
      } catch (error) {
         console.error(error);
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

   /* #endregion */

}
