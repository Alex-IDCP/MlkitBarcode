import { Component, OnInit, ViewChild } from '@angular/core';
import { PalletAssemblyService } from '../../../services/pallet-assembly.service';
import { IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PalletAssemblyDetail, PalletItemList } from '../../../models/pallet-assembly';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
	selector: 'app-pallet-assembly-detail',
	templateUrl: './pallet-assembly-detail.page.html',
	styleUrls: ['./pallet-assembly-detail.page.scss'],
})
export class PalletAssemblyDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

	objectId: number;
	selectedPalletNum: number;

	constructor(
		public objectService: PalletAssemblyService,
		private commonService: CommonService,
		private toastService: ToastService,
		private loadingService: LoadingService,
		private navController: NavController,
		private route: ActivatedRoute,
	) { }

	ionViewWillEnter(): void {
		this.route.queryParams.subscribe(params => {
			this.objectId = params["objectId"];
			if (this.objectId) {
				this.loadObject();
			}
		})
	}
	
	ionViewDidEnter(): void {

	}

	ngOnInit() {
	}

	async loadObject() {
		try {
			await this.loadingService.showLoading();
			this.objectService.getObjectById(this.objectId).subscribe(async response => {
				let object = response;
				object.header = this.commonService.convertObjectAllDateType(object.header);
				await this.objectService.setHeader(JSON.parse(JSON.stringify(object.header)));
				await this.objectService.setLines(JSON.parse(JSON.stringify(object.details)));
				await this.loadingService.dismissLoading();
				if (object.details && object.details.length > 0) {
					this.selectedPalletNum = object.details[0].palletNum;
					this.onPalletNumChanged({ detail: { value: this.selectedPalletNum.toString() } });
				}
			}, async error => {
				await this.loadingService.dismissLoading();
				console.error(error);
			})
		} catch (e) {
			await this.loadingService.dismissLoading();
			console.error(e);
		} finally {
			await this.loadingService.dismissLoading();
		}
	}
	
	palletToShow: PalletAssemblyDetail;
	onPalletNumChanged(event) {
		if (event) {
			let found = this.objectService.objectDetail.find(r => r.palletNum.toString() === event.detail.value);
			if (found) {
				this.palletToShow = found;
			} else {
				this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
			}
		}
	}

	edit() {
		this.navController.navigateRoot("/transactions/pallet-assembly/pallet-assembly-header");
	}

	previousStep() {
		this.objectService.resetVariables();
		this.navController.navigateBack("/transactions/pallet-assembly");
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

}
