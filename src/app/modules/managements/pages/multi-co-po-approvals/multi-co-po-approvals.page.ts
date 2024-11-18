import { Component, OnInit } from '@angular/core';
import { MultiCoTransactionProcessingService } from 'src/app/shared/services/multi-co-transaction-processing.service';

@Component({
   selector: 'app-multi-co-po-approvals',
   templateUrl: './multi-co-po-approvals.page.html',
   styleUrls: ['./multi-co-po-approvals.page.scss'],
   providers: [MultiCoTransactionProcessingService, { provide: 'apiObject', useValue: 'mobileMultiCoPoApproval' }]
})
export class MultiCoPoApprovalsPage implements OnInit {

   constructor() { }

   ngOnInit() {
   }

}
