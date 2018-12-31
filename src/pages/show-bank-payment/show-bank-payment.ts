import { CoinsSender } from './../utils/coinssender';

import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { StorageService } from '../utils/storageservice';
import { Console } from '../utils/console';

/**
 * Generated class for the ShowBankPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-show-bank-payment',
  templateUrl: 'show-bank-payment.html',
})
export class ShowBankPaymentPage {
  usdRate: number = 0;
  btcRate: number = 0;
  btcToNgn = 0;
  btcText: string;
  currencyText: string;
  banks = [];
  bankName: string;
  accountNumber: string;
  totalAmount = 0;
  amountToSend = 0;
  fromCoin: string;

  referenceCode: string;
  buyerAddress: string;
  ls: StorageService;
  loading: Loading;
  sellOrder: any;
  disableButton = false;
  brokerAccount = "";

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public toastCtrl: ToastController) {
    this.currencyText = "NGN";
    this.btcText = "BTC";
    this.banks = Constants.properties['banks'];

    let data = Constants.properties['finalize_sale_order'];
    this.sellOrder = data;
    Console.log(data);
    let sellerToAddress = data['sellerToAddress'];
    let splitted = sellerToAddress.split(":");

    for (let bank in this.banks) {
      if (this.banks[bank]['bankCode'] === splitted[0]) {
        this.bankName = this.banks[bank]['bankName'];
        break;
      }
    }

    this.accountNumber = splitted[1];
    this.totalAmount = data['amountToRecieve']
    this.referenceCode = data['trxId'];
    this.buyerAddress = data['buyerFromAddress'];
    this.amountToSend = data['amountToSell'];
    this.brokerAccount = data['brokerAccount'];
    this.fromCoin = data['fromCoin'];

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    //let pageTitle = "Select Payment Method";
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);

  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad ShowBankPaymentPage');
  }

  successCall(data) {
    let app: ShowBankPaymentPage = data['page'];
    app.disableButton = true;
    Console.log(app.sellOrder);
    //ok, we need to call server "update-exchange-status";
    let url = Constants.UPDATE_TRADE_URL;
    let requestData = {
      "sellOrderTransactionId": app.sellOrder['trxId'],
      "status": "SUCCESS",
      emailAddress: app.ls.getItem("emailAddress"),
      password: app.ls.getItem("password")
    };

    app.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      //doNothing
    }, error => {
      Constants.showLongerToastMessage("We have released coins to the buyer, but we can't update the status of your transaction. Please speak to an admin immediately", app.toastCtrl);
    })
  }

  errorCall(data) {
    //doNothing
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure you want to confirm this order?',
      subTitle: 'Once confirmed, the coins held in escrow will be released to the buyer',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            let data = {};
            data['amount'] = this.amountToSend
            data['recipientAddress'] = this.buyerAddress;
            data['loading'] = this.loading;
            data['loadingCtrl'] = this.loadingCtrl;
            data['ls'] = this.ls;
            data['toastCtrl'] = this.toastCtrl;
            data['http'] = this.http;
            data['page'] = this;
            data['trxId'] = this.sellOrder;
            data['brokerAccount'] = this.brokerAccount;

            let fees = Constants.getCurrentWalletProperties();
            if (this.fromCoin.indexOf('ETH') >= 0) {
              CoinsSender.sendCoinsEth(data, this.successCall, this.errorCall, this.fromCoin);
            } else if (this.fromCoin === 'XND' || this.fromCoin === "NXT" || this.fromCoin === "ARDR" || this.fromCoin === "IGNIS") {
              CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            } else if (fees.currencyId !== undefined) {
              CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            } else if (fees.equityId !== undefined) {
              CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            } else {
              let key = this.fromCoin + "Address";
              CoinsSender.sendCoinsBtc(data, this.successCall, this.errorCall, this.fromCoin, this.ls.getItem(key), Constants.NETWORKS[this.fromCoin]);
            }
          }
        }
      ]
    });
    alert.present();
  }

  confirmBankPayment() {
    this.presentAlert();
  }

  updateOrder(transactionId) {
    let url = Constants.UPDATE_USER_SELL_ORDERS_TX_URL;
    let postData = {
      emailAddress: this.ls.getItem("emailAddress"),
      sellOrderTransactionId: transactionId,
      status: "sold",
      password: this.ls.getItem("password")
    };

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      //doNothing
    }, error => {
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  loadRate() {
    let fees = Constants.getCurrentWalletProperties();
    let tickerSymbol = fees.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.buy;
      this.btcRate = responseData.result.rate;
      this.btcToNgn = this.btcRate / this.usdRate;
    }, error => {
      //doNothing
    });
  }
}