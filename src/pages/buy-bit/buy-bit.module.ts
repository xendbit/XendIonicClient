import { BuyBitPage } from './buy-bit';
import { IonicPageModule } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NgModule } from '@angular/core';

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
      InAppBrowser
    ]
  })

  export class BuyBitPageModule {}