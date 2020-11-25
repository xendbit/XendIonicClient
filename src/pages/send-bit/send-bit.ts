import { Constants } from './../utils/constants';
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
  blockFees = 0;
  sliderValue = 5;
  minBlockFees = 0;
  maxBlockFees = 0;
  xendFees = 0;

  wallet = undefined;

  constructor(private barcodeScanner: BarcodeScanner, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public toastCtrl: ToastController) {
    this.sendBitForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      networkAddress: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    this.wallet = Constants.WALLET;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidEnter() {
    this.blockFees = +this.wallet['token']['blockFees'] * this.sliderValue;
    this.minBlockFees = +this.wallet['token']['minBlockFees'];
    this.maxBlockFees = +this.wallet['token']['maxBlockFees'];
    this.xendFees = +this.wallet['token']['xendFees'];

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

    this.btcText = this.wallet['value'];
    this.currencyText = this.wallet['value'];
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

  calculateXendFees() {
    let toSell = +this.sendBitForm.value.amount;
    this.xendFees = toSell * +this.wallet['token']['xendFees'];
    this.blockFees = this.minBlockFees * this.sliderValue;
  }

  sendBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendFi",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then((_result: any) => {
        this.sendBitForm.controls.password.setValue(this.ls.getItem("password"));
        this.sendBit();
      })
      .catch((error: any) => {
        //doNothing
        Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  getTransactions(showLoading) {
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    let key = Constants.WORKING_WALLET + "Address";

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.ls.getItem(key),
      emailAddress: this.ls.getItem("emailAddress")
    };


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
          this.xendFees = +this.wallet['token']['xendFees'] * balance;
          //0.001 is added because of rounding issues.
          let canSend = balance - this.blockFees - this.xendFees;
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
    let balance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    if (balance === undefined || balance === NaN || balance === 0) {
      this.getTransactions(true);
    } else {
      this.xendFees = +this.wallet['token']['xendFees'] * balance;
      let canSend = balance - this.blockFees - this.xendFees;

      //Correct for rounding error
      canSend = canSend - 0.0001;

      if (canSend < 0) {
        canSend = 0;
      }
      this.sendBitForm.controls.amount.setValue(canSend.toFixed(3));

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

    let invalidAddressMessage = "Invalid Coin Address detected".replace("Coin", this.currencyText);

    this.xendFees = +this.wallet['token']['xendFees'] * amountToSend;

    if (amountToSend === 0) {
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (amountToSend + this.blockFees + this.xendFees > balance) {
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
      data['amountToRecieve'] = amountToSend
      data['buyerToAddress'] = toBitcoinAddress;
      data['blockFees'] = this.blockFees;
      data['xendFees'] = this.xendFees;
      data['emailAddress'] = this.ls.getItem("emailAddress");
      data['password'] = this.ls.getItem("password");
      this.disableButton = true;
      this.sendCoins(data);
    }
  }

  sendCoins(data) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let url = Constants.SEND_COINS_URL

    this.http.post(url, data, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.response_text === "success") {
        this.sendCoinsSuccess();
      } else {
        Constants.showLongerToastMessage('Error Sending Coin: ' + responseData.result, this.toastCtrl);
        this.sendCoinsError();
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  sendCoinsSuccess() {
    this.disableButton = false;
    this.sendBitForm.reset();

    Constants.showPersistentToastMessage("Your tokens have been sent successfully.", this.toastCtrl);
    this.navCtrl.pop();
  }

  sendCoinsError() {
    this.disableButton = false;
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
