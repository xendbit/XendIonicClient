import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Observable } from 'rxjs/Rx';

import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';

/**
 * Generated class for the BuyBitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-buy-bit',
  templateUrl: 'buy-bit.html',
})
export class BuyBitPage {

  currentWallet = {};
  usdRate: number = 0;
  btcRate: number = 0;
  btcToNgn = 0;

  ls: StorageService;
  loading: Loading;

  sellersText: string;
  sellers = [];
  priceText: string;
  buyerOtherAddress: string;
  currencyPairs = [];
  currencyPair: string;
  sellersPairs = [];
  fromCoin: string;
  toCoin: string;
  showHeaders = false;

  wallet = undefined;

  constructor(private iab: InAppBrowser, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController) {
    this.wallet = Constants.WALLET;
    this.currentWallet = this.wallet;
    this.loadRate();

    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad BuyBitNgntPage');
  }

  ionViewDidEnter() {
    this.loadSellers();
  }

  loadRate() {
    let tickerSymbol = this.wallet['ticker_symbol'];
    let url = Constants.GET_USD_RATE_URL + tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.buy;
      this.btcRate = responseData.result.rate;
      Constants.LAST_USD_RATE = this.btcRate;
      this.btcToNgn = this.btcRate * this.usdRate;

    }, _error => {
      //doNothing
    });
  }

  pairSelected(value) {
    this.showHeaders = false;
    Console.log("Selected Pair");
    let selectedPair = value;
    this.currencyPair = value;
    if (selectedPair !== undefined && selectedPair.indexOf("->") >= 0) {
      this.sellersPairs = [];
      for (let seller of this.sellers) {
        let splitted = selectedPair.split(" -> ");
        this.toCoin = splitted[1];
        this.fromCoin = splitted[0];
        if (seller.toCoin == this.toCoin) {
          this.sellersPairs.push(seller);
        }
      }

      this.showHeaders = this.sellersPairs.length > 0;
    }
  }

  loadSellers() {
    this.currencyPairs = [];
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet['value'] !== Constants.WORKING_WALLET) {
        let pair = Constants.WORKING_WALLET + " -> " + wallet['value'];
        this.currencyPairs.push(pair);
      }
    }

    for (let bpm of Constants.properties['payment.methods']) {
      let pair = Constants.WORKING_WALLET + " -> " + bpm.value;
      this.currencyPairs.push(pair);
    }


    let url = Constants.GET_SELL_ORDERS_TX_URL;

    let postData = {
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.ls.getItem("password")
    };

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.sellers = responseData.result;
      this.loading.dismiss();
      this.currencyPair = Constants.WORKING_WALLET + " -> Naira";
      this.pairSelected(this.currencyPair);
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  buyCustom() {
    this.navCtrl.push('BuyCustomPage');
  }

  buyBit(seller) {
    Console.log("buyBit");
    this.presentAlert(seller);
  }

  presentAlert(seller) {
    let message = 'Do you want to buy '
      + seller.amountToSell + ' '
      + seller.fromCoin + ' @ '
      + seller.rate + ' per coin? You will be paying '
      + seller.amountToRecieve + ' in '
      + seller.toCoin;

    let alert = this.alertCtrl.create({
      title: 'Confirm purchase',
      message: message,
      buttons: [
        {
          text: 'Buy',
          handler: () => {
            this.getBuyerOtherAddress(seller);
          }
        },
        // {
        //   text: 'Chat With Seller',
        //   handler: () => {
        //     this.sendExternalMessage(seller);
        //   }
        // },
        {
          text: "Don't Buy",
          role: 'cancel',
          handler: () => {
            //doNothing
          }
        }
      ]
    });
    alert.present();
  }

  sendExternalMessage(seller) {
    let phoneNumber = seller.seller.kyc.phoneNumber;
    //let phoneNumber = '2348025943549';
    if (phoneNumber === undefined || phoneNumber === null) {
      Constants.showLongerToastMessage("You can't chat with this seller.", this.toastCtrl);
    } else {
      let coin = seller.fromCoin;
      let toCoin = seller.toCoin;
      let priceFrom = seller.amountToSell;
      let priceTo = seller.amountToRecieve;
      let rate = seller.rate;
      let message = "I'm interested in your " + priceFrom + coin + " -> " + priceTo + toCoin + " (@ " + rate + ") trade posted on XendBit. Please log in to your XendBit app to continue trade";
      let url = "https://wa.me/" + phoneNumber + "?text=" + message;
      const browser = this.iab.create(url, "_system", "hardwareback=yes,");
      browser.close();
    }
  }

  getBuyerOtherAddress(seller) {
    let coin = seller.toCoin;
    if (coin === "Naira") {
      this.sendTradeStartMessage(seller);
    } else {
      this.buyerOtherAddress = this.wallet['chain_address'];
      this.checkCoinBalance(coin, seller);
    }
  }

  sendTradeStartMessage(seller) {
    let ws = Constants.properties['ws_connection'];
    let coin = seller.toCoin;

    if (coin === "Naira") {
      //this is a hack. we don't need the buyerAddress for NGNT Transactions
      this.buyerOtherAddress = "0000000000";
    } else {
      this.buyerOtherAddress = this.wallet['chain_address'];
    }

    let buyerAddress = this.wallet['chain_address'];
    let trxId = seller.trxId;

    let data = {
      "buyerAddress": buyerAddress,
      "buyerOtherAddress": this.buyerOtherAddress,
      "buyerEmailAddress": this.ls.getItem("emailAddress"),
      "action": "startTrade",
      "trxId": trxId
    };

    ws.send(Constants.encryptData(JSON.stringify(data))).subscribe((_data) => {
    }, (_error) => {
    }, () => {
    });

    Constants.properties['spmNavCtrl'] = this.navCtrl;
    this.showPleaseWait();
  }

  showPleaseWait() {
    let timer = 120;
    let running = Observable.interval(1000).subscribe(x => {
      timer = timer - 1;
      if (timer <= 0) {
        running.unsubscribe();
      }
    });
    Constants.properties['startTradeObservable'] = running;
  }

  checkCoinBalance(coin, seller) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Checking your current balance...");
    let amountToSend = +seller.amountToRecieve;

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.buyerOtherAddress,
      emailAddress: this.ls.getItem("emailAddress"),
    };

    this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader(coin))
      .map(res => res.json())
      .subscribe(responseData => {
        this.loading.dismiss();
        let confirmedAccountBalance = +responseData.result.balance;

        let xendFees = amountToSend * +this.wallet['token']['xendFees']
        let totalAmount: number = amountToSend + +this.wallet['token']['xendFees'] + xendFees;
        if (confirmedAccountBalance < totalAmount) {
          Constants.showLongerToastMessage("Insufficient " + coin + " balance", this.toastCtrl);
        } else {
            this.sendTradeStartMessage(seller);
        }
      }, error => {
        this.loading.dismiss();
        Constants.showLongerToastMessage("Can not retreive your " + coin + " balance. Please try again later", this.toastCtrl);
      });
  }
}
