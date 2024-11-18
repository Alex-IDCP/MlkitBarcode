import { Component, OnInit } from '@angular/core';
import { InterTransferRoot } from '../../../models/inter-transfer';
import { InterTransferService } from '../../../services/inter-transfer.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
   selector: 'app-inter-transfer-detail',
   templateUrl: './inter-transfer-detail.page.html',
   styleUrls: ['./inter-transfer-detail.page.scss'],
})
export class InterTransferDetailPage implements OnInit {

   objectId: number;
   object: InterTransferRoot;

   constructor(
      public objectService: InterTransferService,
      private navController: NavController,
      private route: ActivatedRoute,
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params["objectId"];
         if (!this.objectId) {
            this.navController.navigateBack("/transactions/inter-transfer");
         }
      })
   }

   ngOnInit() {
      if (!this.objectId) {
         this.navController.navigateBack("/transactions/inter-transfer")
      } else {
         this.loadObject();
      }
   }

   loadObject() {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
         this.object = response;
      }, error => {
         console.error(error);
      })
   }

   filter(details: InnerVariationDetail[]) {
      try {
         return details.filter(r => r.qtyRequest > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region show variaton dialog */

   selectedItem: TransactionDetail;
   showDetails(item: TransactionDetail) {
      if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
         this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
         item.isSelected = !item.isSelected;
      }
   }

   getObjectDetailSO() {
      return this.object.details.flatMap(r => r.parentNum).join(", ");
   }

   /* #endregion */

}
