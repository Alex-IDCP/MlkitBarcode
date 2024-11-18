import { Component, OnInit } from '@angular/core';
import { LocationApplicationService } from '../../../services/location-application.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-location-application-edit',
  templateUrl: './location-application-edit.page.html',
  styleUrls: ['./location-application-edit.page.scss'],
})
export class LocationApplicationEditPage implements OnInit {

  objectId: number;
  objectForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    public objectService: LocationApplicationService,
    private commonService: CommonService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.newObjectForm();
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/location-application');
      }
    })
  }

  ngOnInit() {
    this.objectService.getObjectById(this.objectId).subscribe(response => {
      let object = response;
      let objectHeader = this.commonService.convertObjectAllDateType(object.header);
      this.objectForm.patchValue(objectHeader);
    }, error => {
      console.error(error);
    })
  }

  newObjectForm() {
    let loginUser = JSON.parse(localStorage.getItem('loginUser'));
    this.objectForm = this.formBuilder.group({
      locationPreId: [0, [Validators.required]],
      locationPreCode: [null, [Validators.required, Validators.maxLength(20)]],
      oldLocationCode: [null],
      description: [null, [Validators.maxLength(100)]],
      locationType: [null, [Validators.required]],
      phone: [null, [Validators.maxLength(100)]],
      fax: [null, [Validators.maxLength(100)]],
      email: [null, [Validators.email, Validators.maxLength(100)]],
      address: [null, [Validators.maxLength(500)]],
      postcode: [null, [Validators.maxLength(10)]],
      contact: [null, [Validators.maxLength(100)]],
      locationUDField1: [null, [Validators.maxLength(100)]],
      locationUDField2: [null, [Validators.maxLength(100)]],
      locationUDField3: [null, [Validators.maxLength(100)]],
      locationUDOption1: [null],
      locationUDOption2: [null],
      locationUDOption3: [null],
      locationUDOption4: [null],
      locationUDOption5: [null],
      locationUDOption6: [null],
      masterUDGroup1: [null],
      priceSegmentCode: [null, [Validators.required]],
      shipMethodId: [null],
      areaId: [null],
      stateId: [null],
      startDate: [null],
      endDate: [null],
      isEodEmail: [false],
      hasClosingStock: [true],
      isOrdering: [true],
      isPrimary: [null],
      customerCode: [null],
      eodEmail: [null],
      salesAgentId: [loginUser.salesAgentId],
      locationCategoryId: [null],
      locationGroupId: [null],
      locationSectionId: [null],
      locationExtraCategoryId: [null],
      locationExtraGroupId: [null],
      locationExtraSectionId: [null],
      attention: [null, [Validators.maxLength(100)]],
      deactivated: [null],
      isBearPromo: [null],
      isBearShortOver: [null],
      marginMode: [null],
      invoiceMode: [null],
      thumbprintPassword: [null, [Validators.maxLength(30)]],
      locationGradeId: [null],
      whLocationId: [null],
      bankInfo: [null, [Validators.maxLength(2000)]],
      salesCondition: [null, [Validators.maxLength(2000)]],
      locationId: [null],
      workFlowTransactionId: [null],
      remark: [null],
      isECommerce: [false],
      sourceType: ['M']
    });
  }

  onLocationTypeSelected(event) {
    this.objectForm.patchValue({ locationType: event.code });
    if (this.objectForm.controls.locationType.value === "O") {
      this.resetConsignmentConfig();
    }
    else if (this.objectForm.controls.locationType.value === "C") {
      this.objectForm.patchValue({
        isBearPromo: false,
        isBearShortOver: false,
        marginMode: 'N',
        invoiceMode: 'N'
      })
    }
    this.objectForm.updateValueAndValidity();
  }

  resetConsignmentConfig() {
    this.objectForm.patchValue({
      isBearPromo: null,
      isBearShortOver: null,
      marginMode: null,
      invoiceMode: null
    })
  }

  onPriceSegmentSelected(event) {
    if (event) {
      this.objectForm.patchValue({ priceSegmentCode: event.code });
    } else {
      this.objectForm.patchValue({ priceSegmentCode: null });
    }
    this.objectForm.updateValueAndValidity();
  }

  onWhLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ whLocationId: event.id });
    } else {
      this.objectForm.patchValue({ whLocationId: null });
    }
    this.objectForm.updateValueAndValidity();
  }

  onAreaSelected(event) {
    if (event) {
      this.objectForm.patchValue({ areaId: event.id });
    } else {
      this.objectForm.patchValue({ areaId: null });
    }
    this.objectForm.updateValueAndValidity();
  }

  onStateSelected(event) {
    if (event) {
      this.objectForm.patchValue({ stateId: event.id });
    } else {
      this.objectForm.patchValue({ stateId: null });
    }
    this.objectForm.updateValueAndValidity();
  }

  async cancelUpdate() {
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
        try {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot('/transactions/location-application/location-application-detail', navigationExtras);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    if (this.objectForm.valid) {
      try {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.updateObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } catch (e) {
        console.error(e);
      }
    }
  }

  updateObject() {
    this.objectService.updateObject(this.objectForm.getRawValue()).subscribe(response => {
      if (response.status === 201) {
        this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
        try {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot('/transactions/location-application/location-application-detail', navigationExtras);
        } catch (e) {
          console.error(e);
        }
      }
    }, error => {
      console.error(error);
    })
  }
  
}
