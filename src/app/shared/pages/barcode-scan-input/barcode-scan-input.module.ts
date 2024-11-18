import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule, ModalController } from "@ionic/angular";

import { SharedTestingModule } from '../../../../tests/modules/shared-testing.module';
import { BarcodeScanInputPageRoutingModule } from './barcode-scan-input-routing.module';
import { BarcodeScanningModalComponent } from './barcode-scan-input.component';

import { BarcodeScanInputPage } from './barcode-scan-input.page';
import { IdMappingModule } from "../../pipes/id-mapping/id-mapping.module";
import HideKeyboardModule from '../../utilities/hide-keyboard.module';
import { IdToCodeMappingModule } from "../../pipes/id-to-code-mapping/id-to-code-mapping.module";

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        IonicModule,
        IdMappingModule,
        IdToCodeMappingModule,
        BarcodeScanInputPageRoutingModule,
        HideKeyboardModule,
    ],
    declarations:[BarcodeScanInputPage, BarcodeScanningModalComponent],
    exports: [BarcodeScanInputPage]
})

export class BarcodeScanInputPageModule{

}