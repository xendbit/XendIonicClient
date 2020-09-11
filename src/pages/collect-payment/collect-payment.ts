import { Console } from './../utils/console';
import { Http } from '@angular/http';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { FormBuilder, Validators } from "@angular/forms";
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Loading, ToastController, LoadingController, AlertController, Platform } from "ionic-angular";
import 'rxjs/add/operator/map';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NFC, Ndef } from '@ionic-native/nfc';

/**
 * Generated class for the CollectPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collect-payment',
  templateUrl: 'collect-payment.html',
})

export class CollectPaymentPage {
  ls: StorageService;
  loading: Loading;
  beneficiaryCode;
  beneficiaryPassword;
  amount;

  constructor(public platform: Platform, public formBuilder: FormBuilder, public barcodeScanner: BarcodeScanner, public nfc: NFC, public ndef: Ndef, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public http: Http, public alertCtrl: AlertController) {
    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectPaymentPage');
    this.initializeNFC();
  }

  initializeNFC() {
    Console.log("is_core: " + this.platform.is('core'));
    Console.log("is_mobileweb: " + this.platform.is('mobileweb'));

    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      return;
    }

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
        let decodedMessage = this.nfc.bytesToString(event.tag.ndefMessage[0].payload);
        //remove /u0000
        this.beneficiaryCode = decodedMessage.slice(1);
        Console.log(this.beneficiaryCode);
        Constants.showLongToastMessage("Beneficiary Code Read Successfully", this.toastCtrl);
      } catch (err) {
        Console.log(err);
      }
    });
  }

  scanCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        Constants.showLongerToastMessage('Barcode scanner cancelled', this.toastCtrl);
      } else {
        this.beneficiaryCode = barcodeData.text;
      }
    }, (_err) => {
      Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }

  sendPayment() {
    let isValid = true;
    let amountToSend = this.amount;
    let password = this.beneficiaryPassword;
    let userCode = this.beneficiaryCode;

    if (amountToSend === 0) {
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    }

    if (isValid) {
      let postData = {};
      postData['btcValue'] = amountToSend;
      postData['password'] = password;
      postData['userCode'] = userCode;
      postData['emailAddress'] = this.ls.getItem("emailAddress");

      let url = Constants.REPAY_LOAN_URL;
      Console.log(url);

      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");

      this.http.post(url, postData, Constants.getWalletHeader("NGNC")).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        Console.log(responseData);
        if (responseData.response_text === 'error') {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
          return;
        }

        if (responseData.response_text === 'success') {
          Constants.showLongerToastMessage("Transaction Successful.", this.toastCtrl);
          this.amount = 0;
          this.beneficiaryCode = "";
          this.beneficiaryPassword = "";
          return;
        }
      }, error => {
        this.loading.dismiss();
        Constants.showLongerToastMessage(error, this.toastCtrl);
      });
    }
  }
}
