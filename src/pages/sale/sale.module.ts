import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SalePage } from './sale';
import { Dialogs } from '@ionic-native/dialogs';
import { NFC, Ndef } from '@ionic-native/nfc';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


@NgModule({
  declarations: [
    SalePage,
  ],
  imports: [
    IonicPageModule.forChild(SalePage),
  ],
  providers: [
    Dialogs,
    NFC,
    Ndef,
    BarcodeScanner,
  ],
})
export class SalePageModule {}
