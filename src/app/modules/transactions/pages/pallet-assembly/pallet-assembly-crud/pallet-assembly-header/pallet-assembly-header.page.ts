import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { BinList } from 'src/app/modules/transactions/models/transfer-bin';
import { PalletAssemblyService } from 'src/app/modules/transactions/services/pallet-assembly.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
	selector: 'app-pallet-assembly-header',
	templateUrl: './pallet-assembly-header.page.html',
	styleUrls: ['./pallet-assembly-header.page.scss'],
})
export class PalletAssemblyHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

	objectForm: FormGroup;

	constructor(
		public objectService: PalletAssemblyService,
		private toastService: ToastService,
		private loadingService: LoadingService,
		private actionSheetController: ActionSheetController,
		private alertController: AlertController,
		private navController: NavController,
		private formBuilder: FormBuilder,
	) {
		this.newObjectForm();
	}

	async ionViewWillEnter(): Promise<void> {
		await this.setFormattedDateString();
		// await this.bindLocationList();
		if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {

		} else {
			await this.objectForm.patchValue(this.objectService.objectHeader);
			this.dateValue = format(new Date(this.objectService.objectHeader.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
			await this.setFormattedDateString();
			await this.loadLocationBin(this.objectService.objectHeader.locationId);
			await this.loadReceiveMatching(this.objectService.objectHeader.locationId);
		}
	}

	ionViewDidEnter(): void {

	}

	ngOnInit() {
	}

	newObjectForm() {
		this.objectForm = this.formBuilder.group({
			palletAssemblyId: [0],
			palletAssemblyNum: [null],
			trxDate: [parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`)],
			locationId: [null],
			remark: [null],
			masterUDGroup1: [null],
			masterUDGroup2: [null],
			masterUDGroup3: [null],
			palletAssemblyUDField1: [null],
			palletAssemblyUDField2: [null],
			palletAssemblyUDField3: [null],
			palletAssemblyUDOption1: [null],
			palletAssemblyUDOption2: [null],
			palletAssemblyUDOption3: [null],
			workFlowTransactionId: [null],
			sourceType: ["M"],
			totalPallet: [null],
			binCode: [null],
			deactivated: [null],
			receiveMatchingId: [null],
			receiveMatchingNum: [null]
		});
	}

	async onLocationSelected(event: SearchDropdownList) {
		if (event) {
         if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to proceed?",
               subHeader: "Changing Location will reset lines' Location Bin",
               buttons: [
                  {
                     text: "Confirm",
                     cssClass: "success",
                     handler: async () => {
                        this.objectForm.patchValue({ locationId: event.id, binCode: null, receiveMatchingId: null, receiveMatchingNum: null });
                        // reload location bin
                        await this.loadLocationBin(event.id);
                        // reload receive matching
                        await this.loadReceiveMatching(event.id);
                        // reset lines' location bin
                        this.objectService.objectDetail.forEach(r => r.binCode = null);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {
   
                     }
                  }
               ]
            });
            await alert.present();
         } else {
            this.objectForm.patchValue({ locationId: event.id, binCode: null, receiveMatchingId: null, receiveMatchingNum: null });
            // reload location bin
            await this.loadLocationBin(event.id);
            // reload receive matching
            await this.loadReceiveMatching(event.id);
            // reset lines' location bin
            this.objectService.objectDetail.forEach(r => r.binCode = null);            
         }
		} else {
			this.objectForm.patchValue({ locationId: null, binCode: null });
			this.onPrimaryBinSelected(null);
			this.binSearchList = [];
			this.onReceiveMatchingSelected(null);
			this.rmSearchList = [];
		}
	}

	loadLocationBin(locationId: number){
		this.objectService.getLocationBin(locationId).subscribe(async response => {
			let object = response;
			await this.objectService.setLocationBin(object);
			await this.bindLocationBin(object);
		}, error => {
			console.error(error);
		})
	}

	binSearchList: SearchDropdownList[] = [];
	bindLocationBin(binList: BinList[]) {
		this.binSearchList = [];
		binList.forEach((r, rowIndex) => {
			this.binSearchList.push({
				id: rowIndex,
				code: r.binCode,
				description: r.binCode
			})
		})
	}

	onPrimaryBinSelected(event: SearchDropdownList) {
		if (event) {
			this.objectForm.patchValue({ binCode: event.code });
			this.objectService.objectDetail.forEach(r => {
				r.binCode = event.code;
			})
		} else {
			this.objectForm.patchValue({ binCode: null });
		}
	}

	loadReceiveMatching(locationId: number) {
		this.objectService.getReceiveMatching(locationId).subscribe(async response => {
			let object = response;
			await this.bindReceiveMatching(object);
		}, error => {
			console.error(error);
		})
	}

	rmSearchList: SearchDropdownList[] = [];
	bindReceiveMatching(rmList: any[]) {
		this.rmSearchList = [];
		rmList.forEach(r => {
			this.rmSearchList.push({
				id: r.receiveMatchingId,
				code: r.receiveMatchingNum,
				description: r.receiveMatchingNum
			})
		})
	}

	onReceiveMatchingSelected(event: SearchDropdownList) {
		if (event) {
			let found = this.rmSearchList.find(r => r.id === event.id);
			if (found) {
				this.objectForm.patchValue({ receiveMatchingId: found.id, receiveMatchingNum: found.code });
			} else {
				this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
			}
		} else {
			this.objectForm.patchValue({ receiveMatchingId: null, receiveMatchingNum: null });
		}
	}

	async cancelInsert() {
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
			if (this.objectService.objectHeader && this.objectService.objectHeader?.palletAssemblyId > 0) {
				let navigationExtras: NavigationExtras = {
					queryParams: {
						objectId: this.objectService.objectHeader.palletAssemblyId
					}
				}
				this.objectService.resetVariables();
				this.navController.navigateRoot("/transactions/pallet-assembly/pallet-assembly-detail", navigationExtras);
			}
			else {
				this.objectService.resetVariables();
				this.navController.navigateRoot("/transactions/pallet-assembly");
			}
		}
	}

	async nextStep() {
	  this.objectService.setHeader(this.objectForm.getRawValue());
	  this.navController.navigateForward("/transactions/pallet-assembly/pallet-assembly-item");
	}

	/* #region calendar handle here */

	formattedDateString: string = "";
	dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
	maxDate = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
	@ViewChild("datetime") datetime: IonDatetime
	setFormattedDateString() {
		this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
	}

	onTrxDateSelected(value: any) {
		this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
		this.setFormattedDateString();
		this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`) });
	}

	dateDismiss() {
		this.datetime.cancel(true);
	}

	dateSelect() {
		this.datetime.confirm(true);
	}

	/* #endregion */

}
