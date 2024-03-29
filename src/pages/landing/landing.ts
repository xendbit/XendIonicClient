import { Console } from './../utils/console';
import { Constants } from './../utils/constants';

import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/**
 * Generated class for the LandingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})
export class LandingPage {
  ls: StorageService;
  wallets = [];
  loadedWallets = [];
  loading: Loading
  totalAssets = 0;
  loadWalletDelay = 500;
  count = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public alertCtrl: AlertController) {
    this.ls = Constants.storageService;
    this.wallets = Constants.properties['wallets'];
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    Console.log("Entered");
    if (this.ls.getItem("exchangeType") === 'exchange') {
      this.wallets = Constants.properties['wallets'];
    } else if (this.ls.getItem("exchangeType") === 'equities') {
      this.wallets = Constants.properties['equities'];
    }
    Constants.properties['wallets'] = this.wallets;
    this.reloadWallets();
  }

  reloadWallets() {
    if (this.count === 0) {
      this.loadedWallets = [];
      let temp = Object.assign([], this.wallets);
      for (let wallet of temp) {
        if (wallet.default === "true") {
          let index = this.wallets.indexOf(wallet);
          this.wallets.splice(index, 1);
          if (wallet['usdRate'] === undefined) {
            wallet['usdRate'] = "0.00";
          }
          if (wallet['usdBalance'] === undefined) {
            wallet['usdBalance'] = "0.00";
          }
          this.loadedWallets.push(wallet);
          this.wallets.push(wallet);
        }
      }

      this.totalAssets = 0;
      if (this.ls.getItem("exchangeType") === 'exchange') {
        this.wallets = Constants.properties['wallets'];
      } else if (this.ls.getItem("exchangeType") === 'equities') {
        this.wallets = Constants.properties['equities'];
      }
      Constants.properties['wallets'] = this.wallets;
      this.count = 0;
      this.loadWallets();
    }
  }

  loadWallets() {
    let wallet = this.wallets[this.count];
    if (wallet == undefined) {
      this.count = 0;
      return;
    }
    let working_wallet = wallet['value'];
    if (this.ls.getItem("exchangeType") === 'exchange') {
      if (working_wallet.indexOf("ETH") >= 0) {
        Constants.ethWallet(this.ls);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (working_wallet === 'XND') {
        //this.showXendBalance = false;
        Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (working_wallet === 'NXT') {
        //this.showXendBalance = false;
        Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (working_wallet === 'ARDR') {
        Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (working_wallet === 'IGNIS') {
        Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (wallet['currencyId'] !== undefined) {
        Constants.tokenWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else {
        Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      }
    } else if (this.ls.getItem("exchangeType") === 'equities') {
      if (wallet['equityId'] !== undefined) {
        Constants.tokenWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      } else if (wallet['currencyId'] !== undefined) {
        Constants.tokenWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
        let app = this;
        setTimeout(function () {
          app.refresh(wallet);
        }, this.loadWalletDelay);
      }
    }
  }

  refresh(wallet) {
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      let working_wallet = wallet['value'];
      Constants.NETWORK = Constants.NETWORKS[working_wallet];
      app.getTransactions(wallet);
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  getTransactions(wallet) {
    let fees = Constants.getWalletProperties(wallet['value']);

    let key = wallet['value'] + "Address";

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.ls.getItem(key),
      emailAddress: this.ls.getItem("emailAddress"),
      currencyId: fees.currencyId,
      equityId: fees.equityId
    };

    this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader(wallet['value']))
      .map(res => res.json())
      .subscribe(responseData => {
        //if (responseData.response_text === "success") {
        if (responseData.response_code === 0) {
          wallet['confirmedAccountBalance'] = responseData.result.balance;
          wallet['escrow'] = responseData.result.escrow;
          this.loadRate(wallet);
        }
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
      });
  }

  loadRate(wallet) {
    let working_wallet = wallet['value'];
    if (wallet.confirmedAccountBalance === 0 && wallet.default !== "true") {
      this.count = this.count + 1;
      this.loadWallets();
    } else {
      let fees = Constants.getWalletProperties(working_wallet);
      let tickerSymbol = fees.tickerSymbol;
      let url = Constants.GET_USD_RATE_URL + tickerSymbol;

      this.http.get(url, Constants.getWalletHeader(working_wallet)).map(res => res.json()).subscribe(responseData => {
        let index = this.loadedWallets.indexOf(wallet);
        if (index >= 0) {
          this.loadedWallets[index]['usdRate'] = responseData.result.rate;
          this.loadedWallets[index]['usdBalance'] = responseData.result.rate * wallet['confirmedAccountBalance'];
          this.totalAssets += this.loadedWallets[index]['usdBalance'];
        } else {
          wallet['usdRate'] = responseData.result.rate;
          wallet['usdBalance'] = responseData.result.rate * wallet['confirmedAccountBalance'];
          this.totalAssets += wallet['usdBalance'];
        }

        if (index < 0) {
          this.loadedWallets.push(wallet);
        }
        this.count = this.count + 1;
        this.loadWallets();
      }, error => {
        //doNothing
      });
    }
  }

  openHome() {
    Constants.WORKING_WALLET = "BTC";
    this.navCtrl.push('HomePage');
  }

  openHomePage(wallet) {
    Constants.WORKING_WALLET = wallet['value'];
    this.navCtrl.push('HomePage');
  }

  isEmpty() {
    return this.loadedWallets.length === 0;
  }
}
