import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ForgotPasswordRequest } from 'src/app/services/auth/login-user';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {

  companyName: string;
  current_year: number = new Date().getFullYear();
  currentVersion: string;

  object_form: UntypedFormGroup;
  submit_attempt: boolean = false;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    public configService: ConfigService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder
  ) {
    this.currentVersion = environment.version;
    this.newObjectForm();
  }

  newObjectForm() {
    this.object_form = this.formBuilder.group({
      apiUrl: [this.configService.selected_sys_param ? this.configService.selected_sys_param.apiUrl : null, [Validators.required]],
      userEmail: ['', Validators.compose([Validators.email, Validators.required])]
    });
  }

  ngOnInit() {
    if (Capacitor.getPlatform() === 'web') {
      this.object_form.get('userEmail').setValue('aychia@idcp.my');
    }
    if (this.configService.sys_parameter && this.configService.sys_parameter.length > 0) {      
      this.configService.sys_parameter.forEach(async r => this.companyNames.set(r.apiUrl, await this.commonService.getCompanyProfileByUrl(r.apiUrl)));
    }
  }

  companyNames: Map<string,string> = new Map([]);
  mapCompanyName(apiUrl: string) {
    return this.companyNames.get(apiUrl);
  }

  backToLogin(event) {
    this.navController.navigateRoot('/signin');
  }
  
  passwordResetRequest: ForgotPasswordRequest;
  async emailResetLink() {
    // todo : check if delay
    this.configService.selected_sys_param = this.configService.sys_parameter.find(r => r.apiUrl === this.object_form.controls.apiUrl.value);

    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Are you sure to reset?',
      buttons: [{
        text: 'Proceed',
        cssClass: 'success',
        handler: () => {
          this.passwordResetRequest = {
            userEmail: this.object_form.get('userEmail').value,
            clientURI: this.configService.selected_sys_param.apiUrl.replace('api/','') + "reset-password"
          };
          this.authService.forgotPassword(this.passwordResetRequest).subscribe(response => {
            if (response.status == 200) {
              this.toastService.presentToast('', 'Password reset link has been sent to your registered email.', 'top', 'success', 1500);
              this.object_form.reset();
              this.navController.navigateRoot('/signin');
            }
          }, error => {
            console.error(error);
            this.toastService.presentToast('', error , 'top', 'danger', 1500);
          })
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'cancel'
      }]
    });
    await alert.present();
  }

}
