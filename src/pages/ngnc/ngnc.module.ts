import { NgncPage } from './ngnc';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      NgncPage,
    ],
    imports: [
      IonicPageModule.forChild(NgncPage),
    ],
    exports: [
      NgncPage
    ],
    providers: [
        FingerprintAIO
    ]
  })

  export class SellBitPageModule {}
