import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { NavController, ActionSheetController, Platform, AlertController, IonPopover } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { CashDepositService } from '../../../services/cash-deposit.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { CashDepositFile, CashDepositFileSimpleList, CashDepositRoot } from '../../../models/cash-deposit';
import { v4 as uuidv4 } from 'uuid';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
   name: string;
   path: string;
   data: string;
}

@Component({
   selector: 'app-cash-deposit-edit',
   templateUrl: './cash-deposit-edit.page.html',
   styleUrls: ['./cash-deposit-edit.page.scss'],
})
export class CashDepositEditPage implements OnInit {

   objectId: number;
   objectForm: FormGroup;
   object: CashDepositRoot;

   constructor(
      private route: ActivatedRoute,
      private authService: AuthService,
      private navController: NavController,
      private toastService: ToastService,
      private commonService: CommonService,
      private formBuilder: FormBuilder,
      public objectService: CashDepositService,
      private loadingService: LoadingService,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private sanitizer: DomSanitizer,
      private plt: Platform
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params["objectId"];
      })
      this.newObjectForm();
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         posCashDepositId: 0,
         posCashDepositNum: [null],
         depositBy: [null],
         depositAmount: [0, [Validators.required]],
         depositDateTime: [new Date, [Validators.required]],
         depositFileId: [null],
         depositSlipNum: [null],
         paymentMethodId: [null, [Validators.required]],
         locationId: [null],
         customerId: [null],
         trxDate: [null],
         sequence: [0],
         uuid: [uuidv4()]
      })
   }

   ngOnInit() {
      this.loadModuleControl();
      this.bindCustomerList();
      if (this.objectId) {
         this.loadObject();
      }
   }

   customerSearchDropdownList: SearchDropdownList[] = [];
   bindCustomerList() {
      this.objectService.customers.forEach(r => {
         this.customerSearchDropdownList.push({
            id: r.customerId,
            code: r.customerCode,
            oldCode: r.oldCustomerCode,
            description: r.name
         })
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

   loadObject() {
      try {
         this.objectService.getObject(this.objectId).subscribe(async response => {
            this.object = response;
            this.objectForm.patchValue(this.object.header);
            this.sales_date_value = this.commonService.convertUtcDate(this.object.header.trxDate);
            this.salesDate = format(this.sales_date_value, "MMM d, yyyy");
            this.date_value = this.commonService.convertDateFormat(this.object.header.depositDateTime);
            this.date = format(this.date_value, "MMM d, yyyy");
            this.time_value = this.commonService.convertUtcDate(this.object.header.depositDateTime);
            this.time = format(this.commonService.convertDateFormat(this.object.header.depositDateTime), "hh:mm a");
            if (this.object && this.object.depositFile && this.object.depositFile.length > 0) {
               await this.loadAttachment(this.object.depositFile);
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   onlineFiles: CashDepositFileSimpleList[] = [];
   async loadAttachment(fileList: CashDepositFile[]) {
      try {
         this.onlineFiles = [];
         for await (const file of fileList) {
            this.objectService.downloadFile(file.filesId).subscribe(blob => {
               let objectURL = URL.createObjectURL(blob);
               this.onlineFiles.push({
                  filesId: file.filesId,
                  filesName: file.filesName,
                  imageUrl: this.sanitizer.bypassSecurityTrustUrl(objectURL)
               })
            }, error => {
               console.error(error);
            })
         }
      } catch (e) {
         console.error(e);
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
   async onDateSelect(event: any) {
      let date = new Date(event.detail.value);
      this.date_value = await this.commonService.convertUtcDate(date);
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
         depositDateTime: format(new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate()), "yyyy-MM-dd") + `T${("0" + this.time_value.getUTCHours()).slice(-2)}:${("0" + this.time_value.getMinutes()).slice(-2)}:00`,
         trxDate: format(new Date(this.sales_date_value), "yyyy-MM-dd") + "T00:00:00"
      })
   }

   /* #endregion */

   /* #region local attachment */

   async presentAlert() {
      try {
         this.selectImage();
      } catch (e) {
         console.error(e);
      }
   }

   images: LocalFile[] = [];
   async selectImage() {
      try {
         const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Prompt // Camera, Photos or Prompt!
         });

         if (image) {
            this.saveImage(image);
         }
      } catch (e) {
         console.error(e);
      }
   }

   // Create a new file from a capture image
   async saveImage(photo: Photo) {
      try {
         const base64Data = await this.readAsBase64(photo);

         const fileName = new Date().getTime() + ".jpeg";
         const savedFile = await Filesystem.writeFile({
            path: `${IMAGE_DIR}/${fileName}`,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
         });

         // Reload the file list
         // Improve by only loading for the new image and unshifting array!
         this.loadFiles();
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
   private async readAsBase64(photo: Photo) {
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

   /* #region online file */

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
                     this.onlineFiles = this.onlineFiles.filter(r => r.filesId !== file.filesId);
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

   async cancelEdit() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
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
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectId
               }
            }
            this.navController.navigateRoot("/transactions/cash-deposit/cash-deposit-detail", navigationExtras);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         if (this.objectForm.valid) {
            const alert = await this.alertController.create({
               header: "Are you sure to proceed?",
               buttons: [
                  {
                     text: "OK",
                     cssClass: "success",
                     role: "confirm",
                     handler: async () => {
                        await this.updateObject();
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
         } else {
            this.toastService.presentToast("Error", "Please fill required fields.", "top", "danger", 2000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async updateObject() {
      try {
         let response = await this.objectService.updateObject(this.objectForm.value);
         if (response.status === 204) {
            for await (const file of this.images) {
               await this.startUpload(file, this.object.header.posCashDepositId, 0);
            }
            this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
            await this.removeDir();
            this.navController.navigateRoot("transactions/cash-deposit");
         }
      } catch (e) {
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
      let jsonObjectString = JSON.stringify(this.objectForm.value);
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
