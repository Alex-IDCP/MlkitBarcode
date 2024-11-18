import { MasterListDetails } from "./master-list-details";

export interface MasterList {
    objectName: string;
    type: string;
    labelName: string; 
    details: MasterListDetails[];
    disabled: boolean;
}
