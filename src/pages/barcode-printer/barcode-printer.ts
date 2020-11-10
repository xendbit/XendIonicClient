import { NFCHelper } from './../utils/nfc';
import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform } from 'ionic-angular';

/**
 * Generated class for the BarcodePrinterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-barcode-printer',
  templateUrl: 'barcode-printer.html',
})
export class BarcodePrinterPage {

  qrCssClass = "show";
  isShowingQr = true;
  qrType = 'img';
  qrValue = "";

  constructor(public platform: Platform, public nfc: NFC, public ndef: Ndef, public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams) {
    this.qrValue = this.navParams.get('userPassphrase');
  }

  ionViewDidLoad() {
  }

  printUserCode() {
  }

  writeCard() {
    NFCHelper.writeNFC(this.qrValue, this.platform, this.nfc, this.ndef, this.toastCtrl).then(_res => {
      Constants.showLongToastMessage("Card Written Successfully", this.toastCtrl);
    });
  }

  finish() {
    this.navCtrl.push("RegisterPaginated");
  }
}
