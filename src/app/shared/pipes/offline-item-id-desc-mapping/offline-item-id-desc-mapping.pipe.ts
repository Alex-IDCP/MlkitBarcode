import { Pipe, PipeTransform } from '@angular/core';
import { LocalItemMaster } from '../../models/pos-download';

@Pipe({
   name: 'offlineItemIdDescMapping'
})
export class OfflineItemIdDescMappingPipe implements PipeTransform {

   transform(inputId, lookUpArray: LocalItemMaster[]): string {
      var lookupValue = lookUpArray?.find(e => e.id == inputId);
      return lookupValue != undefined ? lookupValue.itemDesc : inputId;
   }

}
