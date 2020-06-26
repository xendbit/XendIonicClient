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

  initializeNFC() {
    // if(this.platform.is('core') || this.platform.is('mobileweb')) {
    //   return;
    // }
    
    this.nfc.addNdefListener(() => {
      Console.log('successfully attached ndef listener');
    }, (err) => {
      Console.log('error attaching ndef listener: ');
      Console.log(err);
    }).subscribe((event) => {
      Console.log('received ndef message. the tag contains: ');
      Console.log(event.tag);
      Console.log('decoded tag id: ');
      Console.log(this.nfc.bytesToHexString(event.tag.id));

      try {
        Console.log(this.nfc.bytesToString(event.tag.ndefMessage[0].payload));
      } catch (err) {
        Console.log(err);
      }
    });

  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad BarcodePrinterPage');
    this.initializeNFC();
  }

  printUserCode() {    
  }

  writeCard() {
    Console.log('Writing info to card: ' + this.qrValue);
    let message = this.ndef.textRecord(this.qrValue);
    this.nfc.write([message]).then((_success) => {
      Console.log("Write Successfully")
      Constants.showLongToastMessage("Card Written Successfully", this.toastCtrl);
    }).catch((_error) => {
      Console.log(_error);
    });
  }

  finish() {
    this.navCtrl.push("RegisterPage");
  }
}
