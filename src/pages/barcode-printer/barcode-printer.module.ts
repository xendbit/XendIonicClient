import { NFC, Ndef } from '@ionic-native/nfc';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BarcodePrinterPage } from './barcode-printer';

@NgModule({
  declarations: [
    BarcodePrinterPage,
  ],
  imports: [
    IonicPageModule.forChild(BarcodePrinterPage),
    NgxQRCodeModule
  ],
  providers: [
    NFC,
    Ndef
  ]
})
export class BarcodePrinterPageModule {}
