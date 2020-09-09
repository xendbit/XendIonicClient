import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NFC, Ndef } from '@ionic-native/nfc';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectPaymentPage } from './collect-payment';

@NgModule({
  declarations: [
    CollectPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(CollectPaymentPage),
  ],
  providers: [
    NFC,
    Ndef,
    BarcodeScanner,
  ]
})
export class CollectPaymentPageModule {}
