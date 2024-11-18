import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { dbConfig, inboundDb_Tables } from 'src/app/shared/database/config/db-config';
import { CommonQueryService } from 'src/app/shared/database/interface/common-query.service';
import { FireStoreReturn, Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { LocalItemBarcode, LocalItemMaster, LocalMarginConfig, LocalTransaction } from 'src/app/shared/models/pos-download';
import { DatabaseService } from '../sqlite/database.service';
import { ToastService } from '../toast/toast.service';
import { LoginUser } from '../auth/login-user';

@Injectable({
   providedIn: 'root'
})
export class ConfigService {

   sys_parameter: Sys_Parameter[] = [];
   selected_sys_param: Sys_Parameter;
   item_Masters: LocalItemMaster[] = [];
   item_Barcodes: LocalItemBarcode[] = [];
   margin_Configs: LocalMarginConfig[] = [];
   selected_location: number;
   loginUser: LoginUser;

   constructor(
      private http: HttpClient,
      private toastService: ToastService,
      private _databaseService: DatabaseService,
      private commonQueryService: CommonQueryService<Sys_Parameter>
   ) { }

   getApiUrl(activationCode: string) {
      try {
         return this.http.get<FireStoreReturn>("https://firestore.googleapis.com/v1/projects/idcp-34e86/databases/(default)/documents/urlList/" + activationCode, {
            headers:
            {
               skip: "true"
            }
         });
      } catch (e) {
         console.error(e);
      }
   }

   /* #region sys_parameter */

   async load() {
      try {
         // for web development
         if (Capacitor.getPlatform() === "web") {
            this.sys_parameter.push({
               Sys_ParameterId: 1,
               apiUrl: "https://localhost:44351/api/",
               // apiUrl: "https://idcp-demo.com/api/",
               // apiUrl: "https://demo.idcp-demo.com/api/",
               // apiUrl: "https://idcp-testing.motorparts.asia/api/",
               // apiUrl: "https://idcp-testing.umaracing.com/api/",
               // apiUrl: "https://test.roncato-erp.com/api/",
               // apiUrl: "https://idcp.motorparts.asia/api/",
               // apiUrl: "https://idcp.umaracing.com/api/",
               // apiUrl: "https://idcp-ararat.com:8081/api/",
               // apiUrl: "https://idcp.rcb.com/api/",
               // apiUrl: "https://tfsb-sys.com:1000/api/",
               // apiUrl: "https://adt-sys.com/api/",
               // apiUrl: "https://rcb-sys.com/api/",
               // apiUrl: "https://test.pmkt-erp.com/api/",
               // apiUrl: "https://pmkt-erp.com/api/",
               // apiUrl: "https://pp.rcb.com/api/",
               // apiUrl: "https://test.fiffy-erp.com/api/",
               // apiUrl: "https://fiffy-erp.com/api/",
               // apiUrl: "https://idcp-noseintl.com/api/",
               // apiUrl: "https://bmm-sys.com:1000/api/",
               // apiUrl: "https://idcp.mkagrp.co.th/api/",
               // apiUrl: "https://vn.mkagrp.com.vn/api/",
               // apiUrl: "https://mh.mkagrp.com.vn/api/",
               // apiUrl: "https://pos.mkagrp.com/api/",
               // apiUrl: "https://kbe-erp.com/api/",
               // apiUrl: "https://idcp.solfili.com/api/",
               // apiUrl: "https://tfa-sys.com/api/",
               imgUrl: null,
               lastDownloadAt: null,
               username: "aychia@idcp.my",
               password: "Dev8888",
               rememberMe: true
            })
            // this.sys_parameter.push({
            //    Sys_ParameterId: 2,
            //    // apiUrl: "https://localhost:44351/api/",
            //    // apiUrl: "https://idcp-demo.com/api/",
            //    //   apiUrl: "https://idcp-testing.motorparts.asia/api/",
            //    apiUrl: "https://idcp.motorparts.asia/api/",
            //    // apiUrl: "https://idcp-ararat.com:8081/api/",
            //    imgUrl: null,
            //    lastDownloadAt: null,
            //    username: "admin@idcp.my",
            //    password: "c0nnecT#7026",
            //    rememberMe: true
            // })
            if (this.sys_parameter && this.sys_parameter.length === 1) {
               this.selected_sys_param = this.sys_parameter[0];
            }
         }
         else { // live
            this.sys_parameter = await this.commonQueryService.load(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
            if (this.sys_parameter && this.sys_parameter.length === 1) {
               this.selected_sys_param = this.sys_parameter[0];
            } else {
               // let user select in login screen
            }
         }
      } catch (e) {
         console.log(`e: ${JSON.stringify(e)}`);
         console.error(e);
      }
   }

   async insert_Sys_Parameter(object: Sys_Parameter) {
      try {
         let sys_parameter: Sys_Parameter = {
            Sys_ParameterId: object.Sys_ParameterId,
            apiUrl: object?.apiUrl,
            imgUrl: object.imgUrl,
            lastDownloadAt: null,
         }
         await this.commonQueryService.insert(sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
         // reload.
         await this.load();
      } catch (e) {
         console.error(e);
      }
   }

   async update_Sys_Parameter(object: Sys_Parameter) {
      try {
         await this.commonQueryService.update(object, "Sys_Parameter", dbConfig.idcpcore);
      } catch (e) {
         console.error(e);
      }
   }

   async delete_Sys_Parameter() {
      try {
         await this.commonQueryService.delete(this.selected_sys_param, "Sys_Parameter", dbConfig.idcpcore);
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region inbound */

   async syncInboundData(itemMasters: LocalItemMaster[], itemBarcodes: LocalItemBarcode[]) {
      try {
         await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Master, itemMasters);
         this.item_Masters = itemMasters;
         console.log("done sync item master")
         await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Barcode, itemBarcodes);
         this.item_Barcodes = itemBarcodes;
         console.log("done sync item barcode")
      } catch (e) {
         console.error(e);
      }
      try {
         let obj = this.selected_sys_param;
         obj.lastDownloadAt = new Date;
         await this.update_Sys_Parameter(obj);
      } catch (e) {
         console.log(JSON.stringify(e));
      }
   }

   async syncMarginConfig(marginConfigs: LocalMarginConfig[]) {
      try {
         await this.commonQueryService.syncInboundData(inboundDb_Tables.margin_Config, marginConfigs);
         this.margin_Configs = marginConfigs;
         console.log("done sync margin config")
      } catch (e) {
         console.error(e);
      }
   }

   async loadItemMaster(): Promise<LocalItemMaster[]> {
      try {
         let ret = await this.commonQueryService.selectAll(inboundDb_Tables.item_Master, dbConfig.inbounddb) as LocalItemMaster[];
         this.item_Masters = ret;
         return this.item_Masters;
      } catch (e) {
         console.error(e);
      }
   }

   async loadItemBarcode(): Promise<LocalItemBarcode[]> {
      try {
         let ret = await this.commonQueryService.selectAll(inboundDb_Tables.item_Barcode, dbConfig.inbounddb) as LocalItemBarcode[];
         this.item_Barcodes = ret;
         return this.item_Barcodes;
      } catch (e) {
         console.error(e);
      }
   }

   async loadMarginConfig(): Promise<LocalMarginConfig[]> {
      try {
         let ret = await this.commonQueryService.selectAll(inboundDb_Tables.margin_Config, dbConfig.inbounddb) as LocalMarginConfig[];
         this.margin_Configs = ret;
         return this.margin_Configs;
      } catch (e) {
         console.error(e);
      }
   }

   async insertLocalTransaction(localTrx: LocalTransaction): Promise<LocalTransaction> {
      try {
         let ret = await this.commonQueryService.insert(localTrx, inboundDb_Tables.local_Transaction, dbConfig.inbounddb) as LocalTransaction;
         return ret;
      } catch (error) {
         console.error(error);
      }
   }

   async updateLocalTransaction(localTrx: LocalTransaction): Promise<LocalTransaction> {
      try {
         let ret = await this.commonQueryService.update(localTrx, inboundDb_Tables.local_Transaction, dbConfig.inbounddb) as LocalTransaction;
         return ret;
      } catch (error) {
         console.error(error);
      }
   }

   async getLocalTransaction(trxType: string): Promise<LocalTransaction[]> {
      try {
         let ret = await this.commonQueryService.selectAll(inboundDb_Tables.local_Transaction, dbConfig.inbounddb) as LocalTransaction[];
         if (ret && ret.length > 0) {
            return ret.filter(r => r.apiUrl === this.selected_sys_param.apiUrl && r.trxType === trxType);
         }
         return null;
      } catch (error) {
         console.error(error);
      }
   }

   async getLocalTransactionById(trxType: string, guid: string): Promise<LocalTransaction> {
      try {
         let ret = await this.commonQueryService.selectAll(inboundDb_Tables.local_Transaction, dbConfig.inbounddb) as LocalTransaction[];
         if (ret) {
            return ret.find(r => r.apiUrl === this.selected_sys_param.apiUrl && r.trxType === trxType && r.id === guid && r.apiUrl === this.selected_sys_param.apiUrl);
         }
         return null;
      } catch (error) {
         console.error(error);
      }
   }

   async deleteLocalTransaction(trxType: string, localTrx: LocalTransaction): Promise<number> {
      try {
         let ret = await this.commonQueryService.delete(localTrx, inboundDb_Tables.local_Transaction, dbConfig.inbounddb);
         return ret;
      } catch (error) {
         console.error(error);
      }
   }

   /* #endregion */

   signOut() {
      this.selected_location = null;
   }

   async saveToLocaLStorage(key: string, data: any) {
      await localStorage.setItem(key, JSON.stringify(data));
      localStorage.getItem(key);
   }

   async retrieveFromLocalStorage(key: string) {
      let data = await localStorage.getItem(key);
      if (data !== null) {
         return JSON.parse(data);
      }
      return null;
   }

   async removeFromLocalStorage(key: string) {
      await localStorage.removeItem(key);
   }

}
