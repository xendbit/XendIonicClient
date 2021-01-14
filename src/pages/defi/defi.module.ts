import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { DefiPage } from './defi';
import { Clipboard } from '@ionic-native/clipboard';

@NgModule({
    declarations: [
      DefiPage
    ],
    imports: [
      IonicPageModule.forChild(DefiPage),
    ],
    exports: [
      DefiPage
    ],
    providers: [
        FingerprintAIO,
        Clipboard,
    ]
  })

  export class DefiPageModule {}