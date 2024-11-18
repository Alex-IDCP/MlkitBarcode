import { Pipe, PipeTransform } from '@angular/core';
import { MasterList } from '../../models/master-list';

@Pipe({
   name: 'userDefinedCaption',
   pure: false
})
export class UserDefinedCaptionPipe implements PipeTransform {

   transform(controlName: string, lookUpList: MasterList[]): string {
      if (lookUpList) {
         var lookupValue = lookUpList.find(e => e.objectName.toUpperCase() == controlName.toUpperCase());
         return lookupValue != undefined ? lookupValue.labelName : controlName;
      }
   }

}
