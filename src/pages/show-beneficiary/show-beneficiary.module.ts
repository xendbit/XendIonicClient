import { ShowBeneficiaryPage } from './show-beneficiary';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';

@NgModule({
    declarations: [
      ShowBeneficiaryPage,
    ],
    imports: [
      IonicPageModule.forChild(ShowBeneficiaryPage),
    ],
    exports: [
      ShowBeneficiaryPage
    ],
    providers: [
      NFC,
      Ndef
    ]
  })

  export class ShowBeneficiaryPageModule {}
