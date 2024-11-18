import { Component, OnInit } from '@angular/core';
import { MultiCoTransactionProcessingService } from 'src/app/shared/services/multi-co-transaction-processing.service';

@Component({
  selector: 'app-multi-co-pa-reviews',
  templateUrl: './multi-co-pa-reviews.page.html',
  styleUrls: ['./multi-co-pa-reviews.page.scss'],
  providers: [MultiCoTransactionProcessingService, { provide: 'apiObject', useValue: 'mobileMultiCoPaReview' }]
})
export class MultiCoPaReviewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
