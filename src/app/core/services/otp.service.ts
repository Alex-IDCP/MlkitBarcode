import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { User } from 'src/app/shared/models/user';
import { OtpDTO } from '../../modules/managements/models/otp';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    
  }

  getOtps() {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "Otp").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  insertOtp(otp: OtpDTO) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "Otp", otp, httpObserveHeader);
  }

  getOtpLines(otpId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "Otp/otpLine/" + otpId);
  }

  getOtpHistory(otpLineId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "Otp/History/" + otpLineId);
  }

  getDescendantUser() {
    return this.http.get<User[]>(this.configService.selected_sys_param.apiUrl + "Otp/descendantUser");
  }

  getUserApps(userId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "Otp/userApps/" + userId);
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + 'Otp/staticLov').pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getAllApps() {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "App").pipe(
      map((response: any) =>
        response.data.map((item: any) => item)
      )
    );
  }
}
