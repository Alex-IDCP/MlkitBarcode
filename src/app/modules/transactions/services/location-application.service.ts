import { Injectable } from "@angular/core";
import { LocationApplicationHeader, LocationApplicationList, LocationApplicationRoot } from "../models/location-application";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "src/app/services/config/config.service";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { WorkFlowState } from "src/app/shared/models/workflow";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
    observe: 'response' as 'response'
};

@Injectable({
    providedIn: 'root'
})

export class LocationApplicationService {
    filterStartDate: Date;
    filterEndDate: Date;
    
    constructor(
        private http: HttpClient,
        private configService: ConfigService
    ) { }


    hasSalesAgent(): boolean {
        let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
        if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
            return false;
        }
        return true
    }
    
    async loadRequiredMaster() {
        await this.loadMasterList();
        await this.loadStaticLov();
    }

    fullMasterList: MasterList[] = [];
    areaMasterList: MasterListDetails[] = [];
    locationMasterList: MasterListDetails[] = [];
    warehouseMasterList: MasterListDetails[] = [];
    priceSegmentMasterList: MasterListDetails[] = [];
    stateMasterList: MasterListDetails[] = [];
    locationTypeMasterList: MasterListDetails[] = [];
    async loadMasterList() {
        this.fullMasterList = await this.getMasterList();
        this.areaMasterList = this.fullMasterList.filter(x => x.objectName == 'Area').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.warehouseMasterList = this.locationMasterList.filter(x => x.attribute1 == 'W');
        this.priceSegmentMasterList = this.fullMasterList.filter(x => x.objectName == 'PriceSegment').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.stateMasterList = this.fullMasterList.filter(x => x.objectName == 'State').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }

    async loadStaticLov() {
        let response = await this.getStaticLovList();
        this.locationTypeMasterList = response.filter(x => x.objectName === "LocationType" && x.details != null).flatMap(src => src.details).filter(y => y.deactivated === 0);
    }

    getObjects(dateStart: string, dateEnd: string) {
        return this.http.get<LocationApplicationList[]>(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/listing/" + dateStart + "/" + dateEnd);
    }

    getObjectById(objectId: number) {
        return this.http.get<LocationApplicationRoot>(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/" + objectId);
    }

    insertObject(object: LocationApplicationHeader) {
        return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileLocationPre", object, httpObserveHeader);
    }

    updateObject(object: LocationApplicationHeader) {
        return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileLocationPre", object, httpObserveHeader);
    }

    toggleObject(objectId: number) {
        return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileLocationPre/deactivate/${objectId}`, null, httpObserveHeader);
    }

    getMasterList() {
        return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/masterlist").toPromise();
    }

    getStaticLovList() {
        return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/staticLov").toPromise();
    }

    getWorkflow(objectId: number) {
        return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/workflow/" + objectId);
    }

    uploadFile(keyId: number, fileId: number, file: any) {
        return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
    }

    downloadFile(keyId: number) {
        return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/downloadFile/" + keyId, { responseType: "blob" });
    }

    deleteFile(keyId: number) {
        return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/deleteFile/" + keyId, httpObserveHeader);
    }

    downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
        return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/exportPdf",
            {
                "appCode": appCode,
                "format": format,
                "documentIds": [documentId],
                "reportName": reportName ?? null
            },
            { responseType: "blob" });
    }

    sendDebug(debugObject: JsonDebug) {
        return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileLocationPre/jsonDebug", debugObject, httpObserveHeader);
    }

}