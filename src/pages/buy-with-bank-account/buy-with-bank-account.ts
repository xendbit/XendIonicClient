import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Constants } from './../utils/constants';
import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { ToastController, NavController, NavParams, Loading, LoadingController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import { Console } from '../utils/console';
/**
 * Generated class for the BuyWithBankAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-buy-with-bank-account',
  templateUrl: 'buy-with-bank-account.html',
})
export class BuyWithBankAccountPage {

  pageTitle: string;
  usdRate: number = 0;
  ls: StorageService;
  btcRate: number = 0;
  btcToNgn = 0;
  btcText: string;
  currencyText: string;
  buyBitFormHeaderText: string;
  banks = [];
  bankName: string;
  accountNumber: string;
  totalAmount: number;
  fullName: string;
  loading: Loading;
  referenceCode: string;
  disableButton = false;

  constructor(private iab: InAppBrowser, public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public toastCtrl: ToastController) {
    let fees = Constants.getCurrentWalletProperties();
    this.pageTitle = "Bank Information";
    this.currencyText = fees.currencyText
    this.buyBitFormHeaderText = this.pageTitle;
    this.btcText = fees.btcText;
    this.banks = Constants.properties['banks'];

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    //let pageTitle = "Select Payment Method";
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);

    let data = Constants.properties['buyWithBankMessage'];
    for (let bank in this.banks) {
      if (this.banks[bank]['bankCode'] === data['sellerBank']) {
        this.bankName = this.banks[bank]['bankName'];
        break;
      }
    }

    this.accountNumber = data['sellerAccountNumber'];
    this.totalAmount = data['amountToRecieve'];
    this.referenceCode = data['trxId'];
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad BuyWithBankAccountPage');
  }

  sendExternalMessage() {
    let data = Constants.properties['buyWithBankMessage'];
    console.log(data);
    let seller = data.seller;
    let phoneNumber = seller.kyc.phoneNumber;
    //let phoneNumber = '2348025943549';
    if (phoneNumber === undefined || phoneNumber === null) {
      Constants.showLongerToastMessage("You can't chat with this seller.", this.toastCtrl);
    } else {
      let coin = seller.fromCoin;
      let toCoin = seller.toCoin;
      let priceFrom = seller.amountToSell;
      let priceTo = seller.amountToRecieve;
      let rate = seller.rate;
      let message = "I'm interested in your " + priceFrom + coin + " -> " + priceTo + toCoin + " (@ " + rate + ") trade posted on XendBit";
      let url = "https://wa.me/" + phoneNumber + "?text=" + message;
      const browser = this.iab.create(url, "_system", "hardwareback=yes,");
      browser.close();
    }
  }

  loadRate() {
    let fees = Constants.getCurrentWalletProperties();
    let tickerSymbol = fees.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.buy;
      this.btcRate = responseData.result.rate;
      Constants.LAST_USD_RATE = this.btcRate;
      this.btcToNgn = this.btcRate / this.usdRate;
    }, error => {
      //doNothing
    });
  }

  confirmBankPayment() {
    Console.log("confirmBankPayment");
    let message = Constants.properties['buyWithBankMessage'];
    let connection = Constants.properties['ws_connection'];
    let data = {
      "buyerEmailAddress": this.ls.getItem("emailAddress"),
      "action": "buyerConfirmedBankPayment",
      "trxId": message['trxId'],
    };

    Console.log(data);

    connection.send(Constants.encryptData(JSON.stringify(data))).subscribe((_data) => {
    }, (_error) => {
    }, () => {
    });
    Constants.showLongerToastMessage("Trader notified. Once trader confirms reciept of payment, your wallet will be credited", this.toastCtrl);
    this.disableButton = true;
  }

  cancelTrade() {
    let message = Constants.properties['buyWithBankMessage'];
    let connection = Constants.properties['ws_connection'];
    let data = {
      "action": "cancelBankPayment",
      "trxId": message['trxId']
    };
    connection.send(Constants.encryptData(JSON.stringify(data))).subscribe((data) => {
    }, (error) => {
    }, () => {
    });
    this.disableButton = true;
  }
}
