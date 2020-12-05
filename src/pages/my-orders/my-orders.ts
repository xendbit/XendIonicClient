
import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { Wallet } from '../utils/wallet';

/**
 * Generated class for the BuyBitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-orders',
  templateUrl: 'my-orders.html',
})
export class MyOrdersPage {
  btcToNgn = 0;

  ls: StorageService;
  loading: Loading;

  sellersText: string;
  sellers = [];
  buyOrders = undefined;
  priceText: string;
  buyerOtherAddress: string;
  currencyPairs = [];
  currencyPair: string;
  sellersPairs = [];
  fromCoin: string;
  toCoin: string;
  type = 'Sell';
  isSellEnabled = false;
  isBuyEnabled = true;
  lastValue: string;

  wallet: Wallet;

  constructor(public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController) {
    this.ls = Constants.storageService;
    this.wallet = Constants.WALLET;
    setTimeout(function () {
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidLoad() {    
    this.loadRate();
    Console.log('ionViewDidLoad BuyBitNgntPage');
  }

  ionViewDidLeave() {
    this.buyOrders = undefined;
    this.isSellEnabled = false;
    this.isBuyEnabled = true;
  }

  ionViewDidEnter() {
    this.wallet = Constants.WALLET;
    this.currencyPair = (Constants.properties['selectedPair'] !== undefined && Constants.properties['selectedPair'] !== "") ? Constants.properties['selectedPair'] : "";
    this.loadSellers();
  }

  loadRate() {
    let tickerSymbol = this.wallet.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + '/BUY';

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.btcToNgn = responseData.result.ngnRate;
    }, error => {
      //doNothing
    });
  }

  switchTo(type) {
    if (type === 'Sell') {
      this.isSellEnabled = false;
      this.isBuyEnabled = true;
      this.pairSelected(this.lastValue);
    } else {
      this.isSellEnabled = true;
      this.isBuyEnabled = false;
      this.loadBuyOrders();
    }
    //The below code is needed when we're doing exchange.
    // this.type = type;
    // if (type === 'Sell') {
    //     this.isSellEnabled = false;
    //     this.isBuyEnabled = true;
    // } else {
    //     this.isSellEnabled = true;
    //     this.isBuyEnabled = false;
    // }

    // this.pairSelected(this.lastValue);
  }

  pairSelected(value) {
    this.lastValue = value;
    let selectedPair = value;
    if (selectedPair !== undefined && selectedPair.indexOf("->") >= 0) {

      this.sellersPairs = [];
      for (let seller of this.sellers) {
        let splitted = selectedPair.split(" -> ");
        this.toCoin = splitted[1];
        this.fromCoin = splitted[0];

        if (this.type === 'Sell') {
          if (seller.toCoin === this.toCoin) {
            this.sellersPairs.push(seller);
          }
        }
        if (this.type === 'Buy') {
          if (seller.fromCoin === this.toCoin) {
            this.sellersPairs.push(seller);
          }
        }
      }
    }
  }

  loadBuyOrders() {
    if (this.buyOrders === undefined) {
      let url = Constants.GET_USER_BUY_ORDERS_TX_URL;

      let postData = {
        emailAddress: this.ls.getItem("emailAddress"),
        password: this.ls.getItem("password")
      };

      this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
        this.buyOrders = responseData.result;
        this.loading.dismiss();
      }, _error => {
        this.loading.dismiss();
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
    }
  }

  loadSellers() {
    this.currencyPairs = [];
    this.sellersPairs = [];
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    /**
     * The commented code is only neccessary if/when we are doing exchange
     */
    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet.chain !== Constants.WORKING_WALLET) {
        let pair = Constants.WORKING_WALLET + " -> " + wallet.chain;
        this.currencyPairs.push(pair);
      }
    }

    for (let bpm of Constants.properties['payment.methods']) {
      let pair = Constants.WORKING_WALLET + " -> " + bpm.value;
      this.currencyPairs.push(pair);
    }

    let url = Constants.GET_USER_SELL_ORDERS_TX_URL;

    let postData = {
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.ls.getItem("password")
    };

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.sellers = responseData.result;
      this.loading.dismiss();
      if (this.currencyPair === undefined || this.currencyPair === "") {
        this.currencyPair = Constants.WORKING_WALLET + " -> Naira";
      }
      this.pairSelected(this.currencyPair);
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  finalizeSale(sellOrder) {
    Constants.properties['finalize_sale_order'] = sellOrder;
    this.navCtrl.push('ShowBankPaymentPage');
  }

  presentAlert(transactionId) {
    let alert = this.alertCtrl.create({
      title: 'Are you sure you want to delete this order?',
      subTitle: 'This process can not be reversed',
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
            this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
            let url = Constants.UPDATE_USER_SELL_ORDERS_TX_URL;
            let postData = {
              emailAddress: this.ls.getItem("emailAddress"),
              sellOrderTransactionId: transactionId,
              status: "delete",
              password: this.ls.getItem("password")
            };

            this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
              this.loading.dismiss();
              let deletedId = responseData.result;
              if (deletedId > 0) {
                Constants.showLongToastMessage("Order Deleted Successfully", this.toastCtrl);
                this.loadSellers();
              } else {
                Constants.showLongToastMessage("Error Deleting your order, please try again", this.toastCtrl)
              }
            }, _error => {
              this.loading.dismiss();
              Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
            });
          }
        }
      ]
    });
    alert.present();
  }

  deleteOrder(transactionId) {
    this.presentAlert(transactionId);
  }
}
