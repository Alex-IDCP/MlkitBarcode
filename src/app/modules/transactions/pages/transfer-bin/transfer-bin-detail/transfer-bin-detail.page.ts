import { Component, OnInit, ViewChild } from '@angular/core';
import { TransferBinService } from '../../../services/transfer-bin.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ViewWillEnter, ViewDidEnter, IonPopover } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Network } from '@capacitor/network';

@Component({
   selector: 'app-transfer-bin-detail',
   templateUrl: './transfer-bin-detail.page.html',
   styleUrls: ['./transfer-bin-detail.page.scss'],
})
export class TransferBinDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

	objectId: number;

   constructor(
      public objectService: TransferBinService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private route: ActivatedRoute,
      private navController: NavController,
      private alertController: AlertController
   ) { }

   async ionViewWillEnter(): Promise<void> {
		if ((await Network.getStatus()).connected) {
         await this.objectService.loadRequiredMaster();
      }
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
            await this.objectService.onLocationChanged(this.objectService.objectHeader.locationId);
				await this.loadingService.dismissLoading();
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

	edit() {
		this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-header");
	}

	previousStep() {
		this.objectService.resetVariables();
		this.navController.navigateBack("/transactions/transfer-bin");
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
