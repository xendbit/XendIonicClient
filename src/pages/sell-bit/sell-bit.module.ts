import { SellBitPage } from './sell-bit';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { Dialogs } from '@ionic-native/dialogs';

@NgModule({
    declarations: [
      SellBitPage,
    ],
    imports: [
      IonicPageModule.forChild(SellBitPage),
    ],
    exports: [
        SellBitPage
    ],
    providers: [
        FingerprintAIO,
        Dialogs
    ]
  })

  export class SellBitPageModule {}