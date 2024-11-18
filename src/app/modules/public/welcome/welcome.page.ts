import { AfterContentChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);

import { ConfigService } from 'src/app/services/config/config.service';
import { AlertController, IonInput, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Keyboard } from '@capacitor/keyboard';
import { NonTradePurchaseReqReviewsPageModule } from '../../managements/pages/non-trade-purchase-req-reviews/non-trade-purchase-req-reviews.module';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomePage implements OnInit, ViewDidEnter, AfterContentChecked {

  language: string = "";
  last_slide: boolean = false;
  showImage: boolean = true;

  @ViewChild("input1") input1: IonInput;
  @ViewChild("input2") input2: IonInput;
  @ViewChild("input3") input3: IonInput;
  @ViewChild("input4") input4: IonInput;
  @ViewChild("input5") input5: IonInput;
  @ViewChild("input6") input6: IonInput;

  @ViewChild("swiper") swiper: SwiperComponent;

  // Swiper config
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: false,
    allowTouchMove: false // set true to allow swiping
  }

  constructor(
    public configService: ConfigService,
    private toastService: ToastService,
    private navController: NavController,
    private alertController: AlertController
  ) { }

  ionViewDidEnter(): void {

  }

  ngOnInit() {
    Keyboard.addListener("keyboardWillShow", () => {
      this.showImage = false;
    })

    Keyboard.addListener("keyboardWillHide", () => {
      this.showImage = true;
    })
  }

  ngAfterContentChecked(): void {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
  }

  // Trigger swiper slide change
  swiperSlideChanged(e) {
    // console.log(e);
  }

  // Go to next slide
  nextSlide() {
    this.swiper.swiperRef.slideNext(500);
    // this.input1.nativeElement.focus();
  }

  // Last slide trigger
  onLastSlide() {
    this.last_slide = true;
    this.input1.setFocus();
  }

  uppercase(event) {
    this.activationCode = this.activationCode.flatMap(r => r.toUpperCase());
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  setFocus(nowElement, nextElement) {
    if (nowElement.value) {
      nextElement.setFocus(); //For Ionic 4
    } else {
      nowElement.setFocus();
    }
  }

  handleKeydown(event, prevElement, nowElement) {
    if (event.key === "Backspace" && prevElement && !nowElement.value) {
      prevElement.setFocus();
    }    
  }

  activationCode: string[] = [];
  async getStarted() {
    if (this.activationCode.length > 0 && this.activationCode.filter(r => r !== null && r !== " ").length === 6) {
      try {
        this.configService.getApiUrl(this.activationCode.join("")).subscribe(async response => {
          if (response) {
            this.toastService.presentToast("", "Activated Successfully", "top", "success", 1000);
            if (this.configService.sys_parameter && this.configService.sys_parameter.length > 0 && this.configService.sys_parameter.findIndex(r => r.apiUrl.toLowerCase() === response.fields.url.stringValue.toLowerCase()) > -1) {
              this.configService.selected_sys_param = this.configService.sys_parameter.find(r => r.apiUrl.toLowerCase() === response.fields.url.stringValue.toLowerCase());
              this.navController.navigateRoot("/signin");
            }
            else {
              let config: Sys_Parameter = {
                apiUrl: response.fields.url.stringValue,
                rememberMe: false,
                username: "",
                password: ""
              }
              await this.configService.insert_Sys_Parameter(config).then(async response => {
                this.navController.navigateRoot("/signin");
              }).catch(async error => {
                this.toastService.presentToast("", error.message, "top", "warning", 1000);
              });
            }
          }
        }, async error => {
          this.toastService.presentToast("", "Invalid activation code", "top", "warning", 1000);
        })
      } catch (error) {
      }
    } else {
      this.toastService.presentToast("", "Please enter valid activation code", "top", "warning", 1000);
    }
  }

  async backToLogin() {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "Cancel Activation?",
      buttons: [
        {
          text: "Ok",
          cssClass: "success",
          handler: async () => {
            this.navController.navigateRoot("/signin");
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel"
        }
      ]
    });
    await alert.present();
  }

}
