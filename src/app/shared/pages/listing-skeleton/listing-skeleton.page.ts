import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-listing-skeleton',
  templateUrl: './listing-skeleton.page.html',
  styleUrls: ['./listing-skeleton.page.scss'],
})
export class ListingSkeletonPage implements OnInit {

  @Input() size: number = 3;

  constructor() { }

  ngOnInit() {
  }

}
