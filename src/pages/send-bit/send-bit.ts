import { CoinsSender } from './../utils/coinssender';
import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Loading, LoadingController, AlertController, IonicPage } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { networks } from "bitcoinjs-lib";

import { StorageService } from '../utils/storageservice';

/*
  Generated class for the SendBit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-send-bit',
  templateUrl: 'send-bit.html'
})
export class SendBitPage {

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

  constructor(private barcodeScanner: BarcodeScanner, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public toastCtrl: ToastController) {
    this.sendBitForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      networkAddress: ['', Validators.required],
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
    Console.log('ionViewDidLoad SendBitPage');
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
      .then((result: any) => {
        this.sendBitForm.controls.password.setValue(this.ls.getItem("password"));
        this.sendBit();
      })
      .catch((error: any) => {
        //doNothing
        Console.log(error);
        Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  getTransactions(showLoading) {
    let fees = Constants.getCurrentWalletProperties();
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    let key = Constants.WORKING_WALLET + "Address";

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.ls.getItem(key),
      emailAddress: this.ls.getItem("emailAddress"),
      currencyId: fees.currencyId,
      equityId: fees.equityId
    };

    Console.log(postData);

    this.http.post(Constants.GET_TX_URL, postData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(responseData => {
        if (showLoading) {
          this.loading.dismiss();
        }
        //if (responseData.response_text === "success") {
        if (responseData.response_code === 0) {
          this.ls.setItem(Constants.WORKING_WALLET + "confirmedAccountBalance", responseData.result.balance);
          let balance = +responseData.result.balance;
          let xendFees = +fees.xendFees * balance;
          //0.001 is added because of rounding issues.
          Console.log("confirmedAccountBalance: " + balance);
          let canSend = balance - fees.blockFees - xendFees;
          if (canSend < 0) {
            canSend = 0;
          }
          Constants.showAlert(this.toastCtrl, this.howMuchCanISendText, "You can send " + canSend.toFixed(3) + " " + Constants.WORKING_WALLET);          
        }
      }, _error => {
        if (showLoading) {
          this.loading.dismiss();
        }
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }


  howMuchCanISend() {
    let fees = Constants.getCurrentWalletProperties();
    let balance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    if (balance === undefined || balance === NaN) {
      this.getTransactions(true);
    } else {
      let xendFees = +fees.xendFees * balance;
      //0.001 is added because of rounding issues.
      Console.log("confirmedAccountBalance: " + balance);
      let canSend = balance - fees.blockFees - xendFees;
      if (canSend < 0) {
        canSend = 0;
      }
      Constants.showAlert(this.toastCtrl, this.howMuchCanISendText, "You can send " + canSend.toFixed(3) + " " + Constants.WORKING_WALLET);
    }
  }

  sendBit() {
    let isValid = false;
    let bv = this.sendBitForm.value;
    let amountToSend = +bv.amount;
    let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let password = bv.password;
    let toBitcoinAddress = bv.networkAddress;

    let fees = Constants.getCurrentWalletProperties();

    let invalidAddressMessage = "Invalid Coin Address detected".replace("Coin", fees.currencyText);

    let xendFees = +fees.xendFees * amountToSend;
    if (amountToSend === 0) {
      Console.log(balance);
      Console.log(amountToSend + fees.blockFees + xendFees);
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (amountToSend + fees.blockFees + xendFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else if (toBitcoinAddress === '') {
      Constants.showPersistentToastMessage(invalidAddressMessage, this.toastCtrl);
    } else if (password !== this.ls.getItem("password")) {
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
      data['alertCtrl'] = this.alertCtrl;

      this.disableButton = true;
      Console.log(fees);
      Console.log(fees.btcText);
      if (fees.btcText.indexOf('ETH') > 0) {
        CoinsSender.sendCoinsEth(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET);
      } else if (fees.btcText.indexOf('XND') >= 0 || fees.btcText.indexOf('NXT') >= 0 || fees.btcText.indexOf('ARDR') >= 0 || fees.btcText.indexOf('IGNIS') >= 0) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
      } else if (fees.currencyId !== undefined) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
      } else if (fees.equityId !== undefined) {
        CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
      } else {
        let key = Constants.WORKING_WALLET + "Address";
        data['key'] = key;
        CoinsSender.sendCoinsBtc(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET, this.ls.getItem(key), networks.bitcoin);
      }
      this.disableButton = false;
    }
  }

  sendCoinsSuccess(data) {
    Console.log("Success Code Called");
    let me: SendBitPage = data['sendBitPage'];
    console.dir(data);
    console.dir(me);
    me.sendBitForm.controls.amount.setValue("");
    me.sendBitForm.controls.networkAddress.setValue("");
    me.sendBitForm.controls.password.setValue("");


  }

  addToExchangeTable(data) {
    let fees = Constants.getCurrentWalletProperties();
    let amount = +data['amount'];
    let xendFees = (amount * +fees.xendFees);
    let totalFees = xendFees + +fees.blockFees;
    let fromAddress = this.ls.getItem(data['key']);
    let password = this.ls.getItem('password');

    let postData = {
      amountToSell: amount,
      fees: totalFees,
      amountToRecieve: 0.00,
      sellerFromAddress: fromAddress,
      sellerToAddress: "",
      fromCoin: Constants.WORKING_WALLET,
      toCoin: "",
      rate: 0.00,
      emailAddress: this.ls.getItem("emailAddress"),
      password: password,
      networkAddress: fromAddress,
      currencyId: fees.currencyId,
      equityId: fees.equityId,
      directSend: true
    }

    //this is wrong
    let url = Constants.POST_TRADE_URL;

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.clearForm();
      this.loading.dismiss();
      if (responseData.response_text === "success") {
        Constants.showPersistentToastMessage("Your sell order has been placed. It will be available in the market place soon", this.toastCtrl);
        Constants.properties['selectedPair'] = Constants.WORKING_WALLET + " -> Naira";
        this.navCtrl.push('MyOrdersPage');
      } else {
        Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }
  sendCoinsError(data) {
    let me: SendBitPage = data['sendBitPage'];
    me.disableButton = false;
    Constants.showLongerToastMessage('Error Sending Coin', me.toastCtrl);
    Console.log("Errored Out");
  }

  clearForm() {
    this.sendBitForm.controls.amount.setValue("");
    this.sendBitForm.controls.networkAddress.setValue("");
    this.sendBitForm.controls.password.setValue("");
  }

  scanCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        Constants.showLongerToastMessage('Barcode scanner cancelled', this.toastCtrl);
      } else {
        this.sendBitForm.controls.networkAddress.setValue(barcodeData.text);
      }
    }, (_err) => {
      Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }
}
