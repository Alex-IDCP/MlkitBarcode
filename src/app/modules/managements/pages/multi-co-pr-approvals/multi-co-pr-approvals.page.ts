import { Component, OnInit } from '@angular/core';
import { MultiCoTransactionProcessingService } from 'src/app/shared/services/multi-co-transaction-processing.service';

@Component({
   selector: 'app-multi-co-pr-approvals',
   templateUrl: './multi-co-pr-approvals.page.html',
   styleUrls: ['./multi-co-pr-approvals.page.scss'],
   providers: [MultiCoTransactionProcessingService, { provide: 'apiObject', useValue: 'mobileMultiCoPrApproval' }]
})
export class MultiCoPrApprovalsPage implements OnInit {

   constructor() { }

   ngOnInit() {
   }

}
