import { Console } from './../utils/console';
import { Constants } from './../utils/constants';

import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Wallet } from '../utils/wallet';

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
  loadedWallets: Wallet[] = [];
  loadingWallets: Wallet[] = [];
  loading: Loading
  totalAssets = 0;
  loadingTotalAssets = 0;
  numberOfWallets = 0;
  ngncBalance = 0;
  tab: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {
    this.ls = Constants.storageService;
    this.tab = this.navCtrl.parent;
  }

  ionViewDidLoad() {
  }

  gotongnc() {
    this.tab.select(3).then(() => {console.log("xNGN Tabbed")});
  }

  ionViewDidEnter() {
    this.wallets = Constants.LOGGED_IN_USER['addressMappings'];
    console.log(this.wallets);
    this.numberOfWallets = this.wallets.length;
    let wallet: Wallet = Constants.getWalletFormatted(this.wallets[0]);
    Constants.WORKING_WALLET = wallet.chain;
    Constants.WALLET = wallet;
    Constants.WORKING_TICKER_VALUE = wallet.tickerSymbol
    this.totalAssets = 0;
    this.ngncBalance = this.ls.getItem("ngncBalance");

    this.reloadWallets();
    this.getNgncBalance();
    //this.ls.setItem("loadedWallets", []);
  }

  reloadWallets() {
    // chain: "ETH"
    // chainAddress: "0x21e5eafd04c99ae16ac529da67745c62e543966e"
    this.loadedWallets = this.ls.getItem("loadedWallets");
    this.totalAssets = this.ls.getItem("totalAssets");
    this.loadingWallets = [];
    this.loadingTotalAssets = 0;
    for (let w of this.wallets) {
      console.log(w);
      let wallet: Wallet = Constants.getWalletFormatted(w);
      this.getTransactions(wallet);
    }
  }

  getNgncBalance() {
    let userId = this.ls.getItem("userId");
    let url = Constants.GET_NGNC_BALANCE_URL.replace("#{userId}", userId);
    this.http.get(url, Constants.getWalletHeader('BTC')).map(res => res.json()).subscribe(responseData => {
      this.ngncBalance = responseData.result;
    });
  }

  getTransactions(wallet: Wallet) {
    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: wallet.chainAddress,
      emailAddress: this.ls.getItem("emailAddress")
    };

    this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader(wallet.chain))
      .map(res => res.json())
      .subscribe(responseData => {
        if (responseData.response_code === 0) {
          wallet.confirmedAccountBalance = responseData.result.balance;
          wallet.escrow = responseData.result.escrow;
          this.loadRate(wallet);
        }
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }


  loadRate(wallet: Wallet) {
    let working_wallet = wallet.chain;
    let url = Constants.GET_USD_RATE_URL + working_wallet + '/BUY';
    Console.log(url);

    this.http.get(url, Constants.getWalletHeader(working_wallet)).map(res => res.json()).subscribe(responseData => {
      wallet.usdRate = +responseData.result.usdRate;
      wallet.usdBalance = wallet.usdRate * wallet.confirmedAccountBalance;

      if (!this.alreadyAdded(wallet)) {
        this.loadingWallets.push(wallet);
        this.loadingTotalAssets += wallet.usdBalance;
      }

      if (this.loadingWallets.length === this.numberOfWallets) {
        this.loadedWallets = this.loadingWallets;
        this.totalAssets = this.loadingTotalAssets;
        this.ls.setItem("loadedWallets", this.loadedWallets);
        this.ls.setItem("totalAssets", this.totalAssets);
      }
    }, _error => {
      //doNothing
    });
  }

  openHomePage(wallet: Wallet) {
    console.log(wallet);
    Constants.WORKING_WALLET = wallet.chain
    Constants.WALLET = wallet;
    Constants.WORKING_TICKER_VALUE = wallet.tickerSymbol
    this.navCtrl.push('HomePage');
  }

  isEmpty() {
    try {
      return this.loadedWallets.length === 0;
    } catch (_error) {
      return 0;
    }
  }

  alreadyAdded(w1) {
    for (let w2 of this.loadingWallets) {
      if (w1['ticker_symbol'] === w2['ticker_symbol']) {
        return true;
      }
    }

    return false;
  }
}
