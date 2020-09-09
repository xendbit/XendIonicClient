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
  blockFees = 0;
  xendFees = 0;

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
    console.log(data);
    this.sellOrder = data;
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
    this.fromCoin = data['fromCoin'];
    this.blockFees = data['blockFees'];
    this.xendFees = data['xendFees'];

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

  successCall() {
    this.disableButton = true;
    //ok, we need to call server "update-exchange-status";
    let url = Constants.UPDATE_TRADE_URL;
    let requestData = {
      "sellOrderTransactionId": this.sellOrder['trxId'],
      "status": "SUCCESS",
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.ls.getItem("password")
    };

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(_responseData => {
      //doNothing
      this.navCtrl.pop();
    }, _error => {
      this.navCtrl.pop();
      Constants.showLongerToastMessage("We have released coins to the buyer, but we can't update the status " +
        "of your transaction. Please speak to an admin immediately", this.toastCtrl);
    })
  }

  errorCall() {
    this.disableButton = true;
    //ok, we need to call server "update-exchange-status";
    let url = Constants.UPDATE_TRADE_URL;
    let requestData = {
      "sellOrderTransactionId": this.sellOrder['trxId'],
      "status": "SELLER_SENDING_ERROR",
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.ls.getItem("password")
    };

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(_responseData => {
      this.navCtrl.pop();
      Constants.showLongerToastMessage("We can not send coins to buyer at this time. Please speak to an admin immediately", this.toastCtrl);
    }, _error => {
      this.navCtrl.pop();
      Constants.showLongerToastMessage("We can not send coins to buyer at this time. Please speak to an admin immediately", this.toastCtrl);
    })
  }

  sendCoins(data) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let url = Constants.SEND_COINS_URL

    this.http.post(url, data, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.response_text === "success") {
        this.successCall();
      } else {
        this.errorCall();
      }
    }, _error => {
      this.loading.dismiss();
    });
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
            data['amountToRecieve'] = this.amountToSend
            data['buyerToAddress'] = this.buyerAddress;
            data['blockFees'] = this.blockFees;
            data['xendFees'] = this.xendFees;
            data['emailAddress'] = this.ls.getItem("emailAddress");
            data['password'] = this.ls.getItem("password");
            this.sendCoins(data);


            // TODO: Coins must now be sent from the server

            // if (this.fromCoin.indexOf('ETH') >= 0) {
            //   CoinsSender.sendCoinsEth(data, this.successCall, this.errorCall, this.fromCoin);
            // } else if (this.fromCoin === 'XND' || this.fromCoin === "NXT" || this.fromCoin === "ARDOR" || this.fromCoin === "IGNIS") {
            //   CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            // } else if (fees.currencyId !== undefined) {
            //   CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            // } else if (fees.equityId !== undefined) {
            //   CoinsSender.sendCoinsXnd(data, this.successCall, this.errorCall, fees);
            // } else {
            //   let key = this.fromCoin + "Address";
            //   CoinsSender.sendCoinsBtc(data, this.successCall, this.errorCall, this.fromCoin, this.ls.getItem(key), Constants.NETWORKS[this.fromCoin]);
            // }
          }
        }
      ]
    });
    alert.present();
  }

  confirmBankPayment() {
    this.presentAlert();
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
}
