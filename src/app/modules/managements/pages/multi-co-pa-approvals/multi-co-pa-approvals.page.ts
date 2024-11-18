import { Component, OnInit } from '@angular/core';
import { MultiCoTransactionProcessingService } from 'src/app/shared/services/multi-co-transaction-processing.service';

@Component({
  selector: 'app-multi-co-pa-approvals',
  templateUrl: './multi-co-pa-approvals.page.html',
  styleUrls: ['./multi-co-pa-approvals.page.scss'],
  providers: [MultiCoTransactionProcessingService, { provide: 'apiObject', useValue: 'mobileMultiCoPaApprove' }]
})
export class MultiCoPaApprovalsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
