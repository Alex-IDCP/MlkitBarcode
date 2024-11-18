import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { User } from 'src/app/shared/models/user';
import { CommonService } from 'src/app/shared/services/common.service';
import { Otp, OtpLine, OtpDTO } from '../../../models/otp';
import { OtpService } from '../../../../../core/services/otp.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { App } from 'src/app/shared/models/app';

@Component({
  selector: 'app-otp-config-list',
  templateUrl: './otp-config-list.page.html',
  styleUrls: ['./otp-config-list.page.scss'],
})
export class OtpConfigListPage implements OnInit {

  otpId: OtpConfigListPage
  otpLines: OtpLine[] = [];
  otpsToShow: Otp[] = [];
  otps: Otp[] = [];

  selectedUser: any;
  selectedValidity: any;
  selectedApp: any;
  selectedStatus: any = "Active";
  selectedOtp: Otp;


  users: User[] = [];

  lovStatics: MasterListDetails[] = [];
  allApps: App[] = [];
  status: any[] = [{ 'code': 'Active', 'description': 'Active' }, { 'code': 'Expired', 'description': 'Expired' }];

  constructor(
    private commonService: CommonService,
    private otpConfigService: OtpService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadCommondata();
    this.loadOtps();
  }

  loadCommondata() {
    this.otpConfigService.getDescendantUser().subscribe((response: User[]) => {
      this.users = response;
    }, error => {
      console.log(error);
    })
    
    this.otpConfigService.getStaticLov().subscribe(response => {
      this.lovStatics = response.filter(x => x.objectName == 'OtpValidity' && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })

    this.otpConfigService.getAllApps().subscribe(response => {
      this.allApps = response;
    }, error => {
      console.log(error);
    })
  }

  loadOtps() {
    this.otpConfigService.getOtps().subscribe(response => {
      this.otps = response;
      if (this.selectedValidity) {
        this.otps = this.otps.filter(r => r.validity == this.selectedValidity);
      }
      if (this.selectedStatus) {
        this.otps = this.otps.filter(r => r.status == this.selectedStatus);
      }
    }, error => {
      console.log(error);
    })
  }

  reset() {
    this.selectedStatus = 'Active'; // default;
    this.selectedValidity = null;// default;
    this.loadOtps()
  }

  mapUserIdToName(userId: number){
    let lookUpValue = this.users.find(user => user.userId == userId);
    if(lookUpValue){
      return lookUpValue.userName;
    }else{
      return null;
    }
  }

  showLines(otpId: number) {
    this.selectedOtp = this.otps.find(r => r.otpId === otpId);
    this.otpConfigService.getOtpLines(otpId).subscribe((response: OtpLine[]) => {
      this.otpLines = response;
    }, error => {
      console.log(error);
    })
  }

}
