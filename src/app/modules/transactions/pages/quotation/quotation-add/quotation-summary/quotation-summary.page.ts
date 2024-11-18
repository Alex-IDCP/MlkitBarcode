import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
   selector: 'app-quotation-summary',
   templateUrl: './quotation-summary.page.html',
   styleUrls: ['./quotation-summary.page.scss'],
})
export class QuotationSummaryPage implements OnInit {

   Math: any;

   constructor(
      public objectService: QuotationService,
      private authService: AuthService,
      public configService: ConfigService,
      private navController: NavController,
      private toastService: ToastService
   ) { 
      this.Math = Math;
   }
   
   ngOnInit() {

   }

   /* #region show variaton dialog */

   // selectedItem: TransactionDetail;
   showDetails(item: TransactionDetail) {
      this.objectService.objectSummary.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
   }

   filter(details: InnerVariationDetail[]) {
      try {
         return details.filter(r => r.qtyRequest > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   addMore() {
      this.objectService.resetVariables();
      this.navController.navigateRoot("/transactions/quotation/quotation-header");
   }

   done() {
      this.objectService.resetVariables();
      this.navController.navigateRoot("/transactions/quotation");
   }

}
