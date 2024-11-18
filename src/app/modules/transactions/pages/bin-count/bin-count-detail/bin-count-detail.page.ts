import { Component, OnInit } from '@angular/core';
import { BinCountService } from '../../../services/bin-count.service';
import { NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Capacitor } from '@capacitor/core';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
   selector: 'app-bin-count-detail',
   templateUrl: './bin-count-detail.page.html',
   styleUrls: ['./bin-count-detail.page.scss'],
})
export class BinCountDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectId: number;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      public objectService: BinCountService,
      private configService: ConfigService,
      private commonService: CommonService,
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
         this.objectService.getObject(this.objectId).subscribe(async response => {
            let object = response;
            object.header = this.commonService.convertObjectAllDateType(object.header);
            if (Capacitor.getPlatform() !== "web") {
               if (this.configService.item_Masters && this.configService.item_Masters.length > 0) {
                  object.details.forEach(r => {
                     let found = this.configService.item_Masters.find(rr => rr.id === r.itemId);
                     if (found) {
                        r.itemCode = found.code;
                        r.itemDescription = found.itemDesc;
                     }
                  })
               }               
            }
            await this.objectService.setHeader(object.header);
            await this.objectService.setLines(object.details);
            await this.transformFlatDetail();
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

   transformFlatDetail() {
      this.objectService.flatDetail = [];
      let uniqueSequence = [...new Set(this.objectService.objectDetail.filter(r => !(r.sequence === null || r.sequence === undefined)).flatMap(r => r.sequence))];
      uniqueSequence.forEach(r => {
         this.objectService.flatDetail.push({
            id: uuidv4(),
            sequence: r,
            binCode: this.objectService.objectDetail.find(rr => rr.sequence === r)?.binCode,
            detail: JSON.parse(JSON.stringify(this.objectService.objectDetail.filter(rr => rr.sequence === r)))
         })
      })
   }

   edit() {
      this.navController.navigateRoot("/transactions/bin-count/bin-count-header");
   }

}
