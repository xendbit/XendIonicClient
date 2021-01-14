import { BuyBitPage } from './buy-bit';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { Dialogs } from '@ionic-native/dialogs';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';

@NgModule({
    declarations: [
      BuyBitPage,
    ],
    imports: [
      IonicPageModule.forChild(BuyBitPage),
    ],
    exports: [
      BuyBitPage
    ],
    providers: [
      Dialogs,
      FingerprintAIO
    ]
  })

  export class BuyBitPageModule {}