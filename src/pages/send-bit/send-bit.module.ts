import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SendBitPage } from './send-bit';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';

@NgModule({
    declarations: [
      SendBitPage,
    ],
    imports: [
      IonicPageModule.forChild(SendBitPage),
    ],
    exports: [
        SendBitPage
    ],
    providers: [
        BarcodeScanner,
        NFC,
        Ndef
    ]
  })

  export class SendBitPageModule {}
