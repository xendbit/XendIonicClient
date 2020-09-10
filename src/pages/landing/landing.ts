import { Console } from './../utils/console';
import { Constants } from './../utils/constants';

import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage, ActionSheetController } from 'ionic-angular';
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
  loadingWallets = [];
  loading: Loading
  totalAssets = 0;
  numberOfWallets = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {
    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.wallets = Constants.LOGGED_IN_USER['addressMappings'];
    this.numberOfWallets = this.wallets.length;
    let wallet = Constants.getWalletFormatted(this.wallets[0]);
    Constants.WORKING_WALLET = wallet['chain'];
    Constants.WALLET = wallet;
    Constants.WORKING_TICKER_VALUE = wallet['ticker_symbol'];
    this.totalAssets = 0;
    this.reloadWallets();
  }

  reloadWallets() {
    // chain: "ETH"
    // chainAddress: "0x21e5eafd04c99ae16ac529da67745c62e543966e"
    this.loadedWallets = this.ls.getItem("loadedWallets");
    this.loadingWallets = [];
    this.totalAssets = 0;
    for (let w of this.wallets) {
      let wallet = Constants.getWalletFormatted(w);
      this.getTransactions(wallet);
    }
  }

  getTransactions(wallet) {
    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: wallet['chain_address'],
      emailAddress: this.ls.getItem("emailAddress")
    };

    this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader(wallet['value']))
      .map(res => res.json())
      .subscribe(responseData => {
        if (responseData.response_code === 0) {
          wallet['confirmedAccountBalance'] = responseData.result.balance;
          wallet['escrow'] = responseData.result.escrow;
          this.loadRate(wallet);
        }
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }


  loadRate(wallet) {
    let working_wallet = wallet['value'];
    let url = Constants.GET_USD_RATE_URL + working_wallet;
    Console.log(url);

    this.http.get(url, Constants.getWalletHeader(working_wallet)).map(res => res.json()).subscribe(responseData => {
      wallet['usdRate'] = responseData.result.rate;
      wallet['usdBalance'] = responseData.result.rate * wallet['confirmedAccountBalance'];
      this.totalAssets += wallet['usdBalance'];
      this.loadingWallets.push(wallet);

      console.log(this.loadingWallets.length, this.numberOfWallets)
      if (this.loadingWallets.length === this.numberOfWallets) {
        this.loadedWallets = this.loadingWallets;
        this.ls.setItem("loadedWallets", this.loadedWallets);
      }
    }, _error => {
      //doNothing
    });
  }

  openHomePage(wallet) {
    Constants.WORKING_WALLET = wallet['chain'];
    Constants.WALLET = wallet;
    Constants.WORKING_TICKER_VALUE = wallet['ticker_symbol'];
    this.navCtrl.push('HomePage');
  }

  isEmpty() {
    try {
      return this.loadedWallets.length === 0;
    } catch (_error) {
      return 0;
    }
  }
}
