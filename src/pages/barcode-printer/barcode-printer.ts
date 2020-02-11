import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.qrValue = this.navParams.get('userPassphrase');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BarcodePrinterPage');
  }

  printUserCode() {

  }

  finish() {

  }

  copyBitcoinAddress() {
    // if (this.isShowingQr) {
    //   this.qrCssClass = "hide";
    //   this.isShowingQr = false;
    // } else {
    //   this.qrCssClass = "show";
    //   this.isShowingQr = true;
    // }
  }
}
