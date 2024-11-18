import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController } from '@ionic/angular';
import { InterTransferService } from 'src/app/modules/transactions/services/inter-transfer.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-inter-transfer-header',
   templateUrl: './inter-transfer-header.page.html',
   styleUrls: ['./inter-transfer-header.page.scss'],
})
export class InterTransferHeaderPage implements OnInit {

   objectForm: FormGroup;

   constructor(
      public objectService: InterTransferService,
      private configService: ConfigService,
      private commonService: CommonService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private formBuilder: FormBuilder
   ) {
      this.newObjectForm();
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         interTransferId: [0],
         interTransferNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
         locationId: [null, [Validators.required]],
         toLocationId: [null, [Validators.required]],
         shipMethodId: [null],
         typeCode: ["IL", [Validators.required]],
         sourceType: ['M'],
         totalCarton: [null],
         grnNum: [null]
      })
      this.objectForm.controls.typeCode.disable();
      this.objectForm.controls.typeCode.updateValueAndValidity();
   }

   ngOnInit() {
      this.setDefaultValue();
   }

   fLocationMasterList: MasterListDetails[] = [];
   setDefaultValue() {
      let defaultTransferType = this.objectService.interTransferTypeMasterList.find(item => item.isPrimary)?.code;
      if (defaultTransferType) {
         this.objectForm.patchValue({ typeCode: defaultTransferType });
      }
      let defaultLocation = this.fLocationMasterList.find(item => item.isPrimary)?.id;
      if (defaultLocation) {
         this.objectForm.patchValue({ locationId: defaultLocation });
      } else {
         let findWh = this.fLocationMasterList.find(x => x.attribute1 == 'W');
         if (findWh) {
            this.objectForm.patchValue({ locationId: findWh.id });
         }
      }
      if (this.configService.loginUser.defaultLocationId) {
         let findLocation = this.objectService.locationMasterList.find(x => x.id == this.configService.loginUser.defaultLocationId);
         if (findLocation) {
            this.objectForm.patchValue({ locationId: findLocation.id });
         }
      }
      let defaultShipMethod = this.objectService.shipMethodMasterList.find(r => r.isPrimary);
      if (defaultShipMethod) {
         this.objectForm.patchValue({ shipMethodId: defaultShipMethod.id });
      }
   }

   onLocationSelected(event) {
      if (event) {
         this.objectForm.patchValue({ locationId: event.id });
      }
   }

   onToLocationSelected(event) {
      if (event) {
         this.objectForm.patchValue({ toLocationId: event.id });
      }
   }

   onShipMethodSelected(event) {
      if (event) {
         this.objectForm.patchValue({ shipMethodId: event.id });
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
            this.navController.navigateBack('/transactions/inter-transfer');
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         await this.objectService.setHeader(this.objectForm.getRawValue());
         this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-item');
      } catch (e) {
         console.error(e);
      }
   }

}
