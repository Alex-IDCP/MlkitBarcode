import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, GalleryPhotos, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInfo } from '@capacitor/filesystem/dist/esm/definitions';
import { ActionSheetController, AlertController, IonPopover, NavController, Platform } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { CashDepositService } from '../../../services/cash-deposit.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { CashDepositHeader } from '../../../models/cash-deposit';
import { v4 as uuidv4 } from 'uuid';

const IMAGE_DIR = 'stored-images';
interface LocalFile {
   name: string;
   path: string;
   data: string;
}
@Component({
   selector: 'app-cash-deposit-add',
   templateUrl: './cash-deposit-add.page.html',
   styleUrls: ['./cash-deposit-add.page.scss'],
})
export class CashDepositAddPage implements OnInit {

   objectForm: FormGroup;

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService,
      public objectService: CashDepositService,
      private commonService: CommonService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private navController: NavController,
      private formBuilder: FormBuilder,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private plt: Platform
   ) {
      this.sales_date_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
      this.salesDate = format(this.commonService.getTodayDate(), "MMM d, yyyy");
      this.date_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
      this.date = format(this.commonService.getTodayDate(), "MMM d, yyyy");
      this.time_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
      this.time = format(this.commonService.getTodayDate(), "hh:mm a");
      this.newObjectForm();
   }

   ngOnInit() {
      this.removeDir();
      this.loadModuleControl();
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         posCashDepositId: 0,
         posCashDepositNum: [null],
         depositBy: [JSON.parse(localStorage.getItem("loginUser"))?.userName],
         depositAmount: [0, [Validators.required]],
         depositDateTime: [new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.time_value.getHours(), this.time_value.getMinutes(), this.time_value.getSeconds()), [Validators.required]],
         depositFileId: [null],
         depositSlipNum: [null],
         paymentMethodId: [null, [Validators.required]],
         locationId: [null],
         customerId: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
         uuid: [uuidv4()],
         sequence: [0]
      })
   }

   onPaymentMethodSelected(event) {
      if (event) {
         this.objectForm.patchValue({ paymentMethodId: event.id });
      } else {
         this.objectForm.patchValue({ paymentMethodId: null });
      }
   }

   onLocationSelected(event) {
      if (event) {
         this.objectForm.patchValue({ locationId: event.id });
      } else {
         this.objectForm.patchValue({ locationId: null });
      }
   }

   onCustomerSelected(event) {
      if (event) {
         this.objectForm.patchValue({ customerId: event.id });
      } else {
         this.objectForm.patchValue({ customerId: null });
      }
   }

   moduleControl: ModuleControl[] = [];
   fileSizeLimit: number = 1 * 1024 * 1024;
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

   /* #region  date part */

   sales_date_active: boolean = false;
   date_active: boolean = false;
   time_active: boolean = false;

   salesDate: any;
   date: any;
   time: any;
   sales_date_value: Date;
   date_value: Date;
   time_value: Date;

   // Toggle date
   toggleDate() {
      this.sales_date_active = false;
      this.date_active = this.date_active ? false : true;
      this.time_active = false;
   }

   // On date select
   onDateSelect(event: any) {
      let date = new Date(event.detail.value);
      this.date_value = this.commonService.convertUtcDate(date);
      this.date = format(date, "MMM d, yyyy");
      this.date_active = false;
      this.bindDateTimeToForm();
   }

   // Toggle time
   toggleTime() {
      this.sales_date_active = false;
      this.time_active = this.time_active ? false : true;
      this.date_active = false;
   }

   // On time select
   onTimeSelect(event: any) {
      let time = new Date(event.detail.value);
      this.time_value = this.commonService.convertUtcDate(time);
      this.time = format(time, "hh:mm a");
      this.time_active = false;
      this.bindDateTimeToForm();
   }

   toggleSalesDate() {
      this.sales_date_active = this.sales_date_active ? false : true;
      this.time_active = false;
      this.date_active = false;
   }

   // On date select
   onSalesDateSelect(event: any) {
      let date = new Date(event.detail.value);
      this.sales_date_value = this.commonService.convertUtcDate(date);
      this.salesDate = format(date, "MMM d, yyyy");
      this.sales_date_active = false;
      this.bindDateTimeToForm();
   }

   bindDateTimeToForm() {
      this.objectForm.patchValue({
         depositDateTime: new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.time_value.getHours(), this.time_value.getMinutes(), this.time_value.getSeconds()),
         trxDate: format(new Date(this.sales_date_value), "yyyy-MM-dd") + "T00:00:00.000Z"
      })
   }

   /* #endregion */

   /* #region  attachment */

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
      if(type == 1) {
         try {
            const images: GalleryPhotos = await Camera.pickImages({
               quality: 50,
            });

            if (images && images.photos.length> 0) {
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
      if(type == 2){
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
            if (f.size > this.fileSizeLimit) {
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

   /* #endregion */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
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
            this.removeDir();
            this.navController.navigateBack("/transactions/cash-deposit");
         }
      } catch (e) {
         console.error(e);
      }
   }

   submitAttempt: boolean = false;
   async nextStep() {
      try {
         if (this.objectForm.valid) {
            this.submitAttempt = true;
            const alert = await this.alertController.create({
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        await this.insertObject();
                     },
                  },
                  {
                     text: "Cancel",
                     cssClass: "cancel",
                     role: "cancel",
                     handler: () => {
                        this.submitAttempt = false;
                     }
                  },
               ],
            });
            await alert.present();
         } else {
            this.submitAttempt = false;
            this.toastService.presentToast("Error", "Please fill required fields.", "top", "danger", 2000);
         }
      } catch (e) {
         this.submitAttempt = false;
         console.error(e);
      } finally {
         this.submitAttempt = false;
      }
   }

   isCountingTimer: boolean = true;
   async insertObject() {
      try {
         if (this.isCountingTimer) {
            this.isCountingTimer = false;
            await this.loadingService.showLoading();
            let response = await this.objectService.insertObject(this.objectForm.value);
            if (response.status === 201) {
               let ret = response.body as CashDepositHeader;
               for await (const image of this.images) {
                  await this.startUpload(image, ret.posCashDepositId, 0);
               }
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               await this.removeDir();
               this.navController.navigateRoot("transactions/cash-deposit");
            }
         }
         setTimeout(() => {
            this.isCountingTimer = true;
         }, 1000);
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      }
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

	sendForDebug() {
		let jsonObjectString = JSON.stringify(this.objectForm.getRawValue());
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

}
