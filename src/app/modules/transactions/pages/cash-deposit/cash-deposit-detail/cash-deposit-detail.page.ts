import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CashDepositRoot } from '../../../models/cash-deposit';
import { CashDepositService } from '../../../services/cash-deposit.service';

@Component({
   selector: 'app-cash-deposit-detail',
   templateUrl: './cash-deposit-detail.page.html',
   styleUrls: ['./cash-deposit-detail.page.scss'],
})
export class CashDepositDetailPage implements OnInit {

   objectId: number;
   object: CashDepositRoot;

   constructor(
      private route: ActivatedRoute,
      private navController: NavController,
      private modalController: ModalController,
      private toastService: ToastService,
      public objectService: CashDepositService,
      private sanitizer: DomSanitizer
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params['objectId'];
         if (!this.objectId) {
            this.navController.navigateBack('/transactions/cash-deposit');
         }
      })
   }

   ngOnInit() {
      if (!this.objectId) {
         this.navController.navigateBack('/transactions/cash-deposit')
      } else {
         this.loadDetail();
      }
   }

   loadDetail() {
      try {
         this.objectService.getObject(this.objectId).subscribe(async response => {
            this.object = response;
            if (this.object && this.object.depositFile && this.object.depositFile.length > 0) {
               await this.loadAttachment(this.object.depositFile.flatMap(r => r.filesId));
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   imageUrls: SafeUrl[] = [];
   async loadAttachment(fileIds: number[]) {
      try {
         this.imageUrls = []; 
         for await (const fileId of fileIds) {
            this.objectService.downloadFile(fileId).subscribe(blob => {
               let objectURL = URL.createObjectURL(blob);
               this.imageUrls.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
            }, error => {
               console.error(error);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   edit() {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: this.objectId
         }
      }
      this.navController.navigateForward('/transactions/cash-deposit/cash-deposit-edit', navigationExtras);
   }

   scale = 1;

   zoomIn() {
      this.scale += 0.1;
      this.setTransform();
   }

   zoomOut() {
      if (this.scale > 1) {
         this.scale -= 0.1;
         this.setTransform();
      }
   }

   @ViewChild('imageEle', { static: false }) imageEle: ElementRef;
   setTransform() {
      // const image = document.querySelector('.image-container img');
      // image.style.transform = `scale(${this.scale})`;
      const image = this.imageEle.nativeElement;
      image.style.transform = `scale(${this.scale})`;
   }

   onDoubleClick() {
      const image = this.imageEle.nativeElement;
      if (this.scale === 1) {
         this.scale = 1.5;
         image.style.transform = `scale(${this.scale})`;
      } else {
         this.scale = 1;
         image.style.transform = `scale(${this.scale})`;
      }
   }

   initialTouchDistance = null;
   initialScale = 1;
   currentScale = 1;
   onTouchStart(event) {
      if (event.touches.length > 1) {
         const touch1 = event.touches[0];
         const touch2 = event.touches[1];
         this.initialTouchDistance = this.getDistance(touch1, touch2);
      }
   }

   onTouchMove(event) {
      if (event.touches.length > 1) {
         const touch1 = event.touches[0];
         const touch2 = event.touches[1];
         const distance = this.getDistance(touch1, touch2);
         if (this.initialTouchDistance) {
            this.initialScale = this.currentScale;
            const initialDistance = this.initialTouchDistance;
            this.currentScale = this.initialScale * (distance / initialDistance);
            this.imageEle.nativeElement.style.transform = `scale(${this.currentScale})`;
         }
      }
   }

   onTouchEnd(event) {
      this.initialTouchDistance = null;
   }

   getDistance(point1, point2) {
      const dx = point1.clientX - point2.clientX;
      const dy = point1.clientY - point2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
   }

}
