import { NFCHelper } from './../utils/nfc';
import { NFC, Ndef } from '@ionic-native/nfc';
import { CoinsSender } from './../utils/coinssender';
import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Loading, LoadingController, AlertController, IonicPage, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
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
  userCode: string;
  useFingerprint: boolean = false;
  showToast = false;
  products;

  constructor(public platform: Platform, public nfc: NFC, public ndef: Ndef, private barcodeScanner: BarcodeScanner, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public toastCtrl: ToastController) {
    this.products = Constants.properties['products'];

    this.sendBitForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      userCode: ['', Validators.required],
      password: ['', Validators.required],
      product: ['', Validators.required]
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
    this.showToast = true;
    this.initializeNFC();
  }

  initializeNFC() {
    NFCHelper.readNFC(this.platform, this.nfc).then(res => {
      this.sendBitForm.controls.userCode.setValue(res);
      Constants.showLongToastMessage("Beneficiary Code Read Successfully", this.toastCtrl);
      this.initializeNFC();
    });
  }

  ionViewDidLeave() {
    this.showToast = false;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad SendBitPage');
    let coin = 'ETH';
    Constants.ethWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, coin);
  }

  sendBit() {
    let isValid = false;
    let bv = this.sendBitForm.value;
    let amountToSend = +bv.amount;
    let password = bv.password;
    let sellerCode = this.ls.getItem('distributorCode');
    let userCode = bv.userCode;
    let product = bv.product;

    if (amountToSend === 0) {
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (this.sendBitForm.valid) {
      isValid = true;
    }

    if (isValid) {
      let data = {};
      data['amount'] = amountToSend
      data['password'] = password;
      data['sellerCode'] = sellerCode;
      data['userCode'] = userCode;
      data['product'] = product;

      data['loading'] = this.loading;
      data['loadingCtrl'] = this.loadingCtrl;
      data['ls'] = this.ls;
      data['toastCtrl'] = this.toastCtrl;
      data['http'] = this.http;
      data['sendBitPage'] = this;
      data['alertCtrl'] = this.alertCtrl;
      CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError);
    }
  }

  sendCoinsSuccess(data) {
    Console.log("Success Code Called");
    let me: SendBitPage = data['sendBitPage'];
    console.dir(data);
    console.dir(me);
    me.sendBitForm.controls.amount.setValue("");
    me.sendBitForm.controls.userCode.setValue("");
    me.sendBitForm.controls.password.setValue("");
    me.sendBitForm.controls.sellerCode.setValue("");
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
        this.sendBitForm.controls.userCode.setValue(barcodeData.text);
      }
    }, (_err) => {
      Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }
}
