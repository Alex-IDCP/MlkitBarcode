import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-loading',
  template: `
    <div class="custom-loading">
      <ion-spinner name="crescent"></ion-spinner>
      <div class="loading-text">
        <p>{{ message }}</p>
        <span>Please be patient.</span>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        text-align: center;
      }
      ion-spinner {
        margin-right: 15px;
      }
      .loading-text p {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }
      .loading-text span {
        font-size: 14px;
        color: gray;
      }
    `,
  ],
})
export class CustomLoadingComponent {
  @Input() message: string = 'Loading';
}
