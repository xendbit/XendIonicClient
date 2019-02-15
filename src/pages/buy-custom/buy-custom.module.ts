import { BuyCustomPage } from './buy-custom';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      BuyCustomPage,
    ],
    imports: [
      IonicPageModule.forChild(BuyCustomPage),
    ],
    exports: [
      BuyCustomPage
    ],
    providers: [
        FingerprintAIO
    ]
  })

  export class BuyCustomPageModule {}