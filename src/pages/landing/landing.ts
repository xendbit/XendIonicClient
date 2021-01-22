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
  loadedWallets = [];
  loading: Loading
  totalAssets = 0;
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
    this.tab.select(2).then(() => { console.log("xNGN Tabbed") });
  }

  ionViewDidEnter() {
    this.wallets = Constants.LOGGED_IN_USER['addressMappings'];
    this.numberOfWallets = this.wallets.length;
    let wallet: Wallet = Constants.getWalletFormatted(this.wallets[0]);
    Constants.WORKING_WALLET = wallet.chain;
    Constants.WALLET = wallet;
    Constants.WORKING_TICKER_VALUE = wallet.tickerSymbol
    this.totalAssets = 0;
    this.ngncBalance = this.ls.getItem("ngncBalance");

    this.reloadWallets();
    this.getNgncBalance();
  }

  reloadWallets() {
    // chain: "ETH"
    // chainAddress: "0x21e5eafd04c99ae16ac529da67745c62e543966e"    
    this.loadedWallets = this.ls.getItem("loadedWallets");
    this.totalAssets = this.ls.getItem("totalAssets");
    if (this.loadedWallets === undefined || this.loadedWallets === null) {
      this.loadedWallets = [];
    }

    if (this.totalAssets === undefined || this.totalAssets === null) {
      this.totalAssets = 0;
    }
    for (let w of this.wallets) {
      let wallet: Wallet = Constants.getWalletFormatted(w);
      this.getBalance(wallet);
    }
  }

  getNgncBalance() {
    let userId = this.ls.getItem("userId");
    let url = Constants.GET_NGNC_BALANCE_URL.replace("#{userId}", userId);
    this.http.get(url, Constants.getWalletHeader('BTC')).map(res => res.json()).subscribe(responseData => {
      this.ngncBalance = responseData.data;
    });
  }

  getBalance(wallet: Wallet) {
    console.log("Getting Transactions for " + wallet.chain);

    const userId = this.ls.getItem("userId");
    const url = Constants.GET_BALANCE_URL + "/" + userId + "/" + wallet.chain;
    console.log(url);
    this.http.get(url).map(res => res.json()).subscribe(responseData => {
      if (responseData.status === 'success') {
        wallet.confirmedAccountBalance = responseData.data.balance;
        console.log(wallet);
        wallet.escrow = responseData.data.escrow;
        this.loadRate(wallet);
      }
    }, error => {
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }


  loadRate(wallet: Wallet) {
    let working_wallet = wallet.chain;
    let url = Constants.GET_USD_RATE_URL + working_wallet + '/BUY';
    Console.log(url);

    this.http.get(url, Constants.getWalletHeader(working_wallet)).map(res => res.json()).subscribe(responseData => {
      wallet.usdRate = +responseData.data.usdRate;
      wallet.usdBalance = wallet.usdRate * wallet.confirmedAccountBalance;

      Console.log(`logoURI: ${wallet.fees.logoURI}, coin: ${wallet.chain}`);
      this.removeIfAdded(wallet);
      console.log(`Adding Wallet: ${wallet.chain} : ${wallet.usdBalance}`);
      if (wallet.confirmedAccountBalance > 0) {
        this.loadedWallets.unshift(wallet);
      } else {
        this.loadedWallets.push(wallet);
      }


      this.totalAssets += wallet.usdBalance;
      console.log(`Total Assets: ${this.totalAssets}`);
      this.ls.setItem("loadedWallets", this.loadedWallets);
      this.ls.setItem("totalAssets", this.totalAssets);
    }, error => {
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }

  openHomePage(wallet: Wallet) {
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

  removeIfAdded(w1) {
    if (this.loadedWallets === undefined) {
      this.loadedWallets = [];
      return;
    }

    let filtered = this.loadedWallets.filter(x => {
      if (w1.tickerSymbol === x.tickerSymbol) {
        return false;
      }

      return true;
    });

    this.loadedWallets = filtered;
  }
}
