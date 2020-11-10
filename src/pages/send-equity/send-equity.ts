import { CoinsSender } from '../utils/coinssender';
import { Constants } from '../utils/constants';
import { Console } from '../utils/console';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Loading, LoadingController, AlertController, IonicPage } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';

import { StorageService } from '../utils/storageservice';

/*
  Generated class for the SendBit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-send-equity',
  templateUrl: 'send-equity.html'
})
export class SendEquityPage {

  sendBitForm;
  ls: StorageService;
  loading: Loading
  toBitcoinAddress: string;
  useFingerprint: boolean = false;

  pageTitle: string;
  sendBitWarningText: string;
  amountToSendText: string;
  bitcoinAddressText: string;
  scanCodeText: string;
  passwordText: string;
  sendBitText: string;
  btcText: string;
  howMuchCanISendText: string;
  hmcisWarning: string;
  currencyText: string;
  disableButton = false;

  constructor(private barcodeScanner: BarcodeScanner, public alertCtrl: AlertController,  public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public toastCtrl: ToastController) {
    this.sendBitForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      networkAddress: ['', Validators.required],
      brokerAccount: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidEnter() {
    this.pageTitle = "Xend Bit";
    this.sendBitWarningText = "Please make sure the bitcoin address you will enter below is correct. Once you send your bits, the transaction can not be reversed.";
    this.amountToSendText = "Amount to Send";
    this.bitcoinAddressText = "Bitcoin Address";
    this.scanCodeText = "Scan Address";
    this.passwordText = "Password";
    this.sendBitText = "Xend Bit";
    this.btcText = "BTC";
    this.howMuchCanISendText = "How much can I send?";
    this.hmcisWarning = "This is only an optimistic estimate depending on how much the block fee is, your charges may be less or more than we estimated.";

    let fees = Constants.getCurrentWalletProperties();
    this.btcText = fees.btcText;
    this.currencyText = fees.currencyText;
    this.sendBitWarningText = this.sendBitWarningText.replace('bitcoin', this.currencyText)
    this.bitcoinAddressText = this.bitcoinAddressText.replace('Bitcoin', this.currencyText);
  }

  ionViewDidLoad() {

    let faio: FingerprintAIO = new FingerprintAIO();
    faio.isAvailable().then(result => {
      this.useFingerprint = true;
    }, error => {
      this.useFingerprint = false;
      //doNothing
    });
  }

  sendBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendBit",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then(async (result: any) => {
        this.sendBitForm.controls.password.setValue(await this.ls.getItem("password"));
        this.sendBit();
      })
      .catch((error: any) => {
        //doNothing

        Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  async howMuchCanISend() {
    let fees = Constants.getCurrentWalletProperties();
    let balance = await this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let xendFees = +fees.xendFees * balance;
    //0.001 is added because of rounding issues.

    let canSend = balance - fees.blockFees - xendFees;
    if (canSend < 0) {
      canSend = 0;
    }
    Constants.showAlert(this.toastCtrl, this.howMuchCanISendText, canSend.toFixed(3));
  }

  async sendBit() {
    let isValid = false;
    let bv = this.sendBitForm.value;
    let amountToSend = +bv.amount;
    let balance = await +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let password = bv.password;
    let toBitcoinAddress = bv.networkAddress;
    let brokerAccount = bv.brokerAccount;

    let fees = Constants.getCurrentWalletProperties();

    let invalidAddressMessage = "Invalid Coin Address detected".replace("Coin", fees.currencyText);

    let xendFees = +fees.xendFees * amountToSend;
    if (amountToSend === 0) {


      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (amountToSend + fees.blockFees + xendFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else if (toBitcoinAddress === '') {
      Constants.showPersistentToastMessage(invalidAddressMessage, this.toastCtrl);
    } else if (brokerAccount === '') {
      Constants.showPersistentToastMessage("Please enter a broker address", this.toastCtrl);
    } else if (password !== await this.ls.getItem("password")) {
      Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
    } else if (this.sendBitForm.valid) {
      isValid = true;
    }

    if (isValid) {
      let data = {};
      data['amount'] = amountToSend
      data['recipientAddress'] = toBitcoinAddress;
      data['loading'] = this.loading;
      data['loadingCtrl'] = this.loadingCtrl;
      data['ls'] = this.ls;
      data['toastCtrl'] = this.toastCtrl;
      data['http'] = this.http;
      data['sendBitPage'] = this;
      data['brokerAccount'] = brokerAccount;
      data['alertCtrl'] = this.alertCtrl;

      this.disableButton = true;


      if (fees.btcText.indexOf('ETH') > 0) {
        CoinsSender.sendCoinsEth(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET);
      } else if (fees.btcText.indexOf('XND') >= 0 || fees.btcText.indexOf('NXT') >= 0 || fees.btcText.indexOf('ARDOR') >= 0 || fees.btcText.indexOf('IGNIS') >= 0) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError);
      } else if (fees.currencyId !== undefined) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError);
      } else if (fees.equityId !== undefined) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError);
      } else {
        let key = Constants.WORKING_WALLET + "Address";
        CoinsSender.sendCoinsBtc(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET, await this.ls.getItem(key), Constants.NETWORK);
      }
      this.disableButton = false;
    }
  }

  sendCoinsSuccess(data) {

    let me: SendEquityPage = data['sendBitPage'];
    console.dir(data);
    console.dir(me);
    me.sendBitForm.controls.amount.setValue("");
    me.sendBitForm.controls.networkAddress.setValue("");
    me.sendBitForm.controls.password.setValue("");
  }

  sendCoinsError(data) {
    let me: SendEquityPage = data['sendBitPage'];
    me.disableButton = false;
    Constants.showLongerToastMessage('Error Sending Coin', me.toastCtrl);

  }

  clearForm() {
    this.sendBitForm.controls.amount.setValue("");
    this.sendBitForm.controls.networkAddress.setValue("");
    this.sendBitForm.controls.password.setValue("");
  }

  scanCode() {
    let app = this;
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled === false) {
        app.sendBitForm.controls.networkAddress.setValue(barcodeData.text);
      } else {
        Constants.showLongerToastMessage('Barcode scanner cancelled', this.toastCtrl);
      }
    }, (err) => {
      Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }
}
