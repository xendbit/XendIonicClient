import { BuyBitPage } from './buy-bit';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { Dialogs } from '@ionic-native/dialogs';

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
      Dialogs
    ]
  })

  export class BuyBitPageModule {}