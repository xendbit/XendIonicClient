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
  loading: Loading
  totalAssets = 0;
  loadWalletDelay = 500;
  count = 0;
  unloadedWallets = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {
    this.ls = Constants.storageService;
    this.wallets = Constants.properties['wallets'];
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    let localWallets = this.ls.getItem('localWallets');
    if (localWallets === undefined) {
      this.ls.setItem('localWallets', []);
    }
    this.reloadWallets();
  }

  reloadWallets() {
    if (this.count === 0) {
      this.loadedWallets = [];
      this.unloadedWallets = [];
      let temp = Object.assign([], this.wallets);
      for (let wallet of temp) {
        if (this.shouldDisplayWallet(wallet)) {
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
    } else {
      Constants.showLongToastMessage('Wallets Loading is in progress...Please wait', this.toastCtrl);
    }
  }

  loadWallets() {
    let wallet = this.wallets[this.count];
    if (wallet === undefined) {
      this.count = 0;
      Constants.showLongToastMessage('All wallets balance loaded succesfully', this.toastCtrl);
      return;
    }
    let working_wallet = wallet['value'];
    if (this.ls.getItem("exchangeType") === 'exchange') {
      if (working_wallet.indexOf("ETH") >= 0) {
        Constants.ethWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, working_wallet);
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
      } else if (working_wallet === 'ARDOR') {
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
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }

  shouldDisplayWallet(wallet) {
    let localWallets = this.ls.getItem('localWallets');

    for (let w of localWallets) {
      if (w['value'] === wallet['value']) {
        return true;
      }
    }

    if (wallet.confirmedAccountBalance > 0) {
      return true;
    }

    if (wallet.default === "true") {
      return true;
    }

    return false;
  }

  removeItem(wallet) {
    let localWallets = this.ls.getItem('localWallets');

    let index = localWallets.indexOf(wallet);
    localWallets.splice(index, 1);
    this.ls.setItem('localWallets', localWallets);

    index = this.loadedWallets.indexOf(wallet);
    this.loadedWallets.splice(index, 1);

    this.unloadedWallets.push(wallet);

    this.reloadWallets();
    Constants.showLongToastMessage(wallet['value'] + ' Removed. Reloading...', this.toastCtrl);
  }

  showUnloadedWallets() {
    let localWallets = this.ls.getItem('localWallets');
    let buttons = [];
    for (let uw of this.unloadedWallets) {
      let button = {
        text: uw['text'],
        handler: () => {
          localWallets.push(uw);
          this.ls.setItem('localWallets', localWallets);
          this.reloadWallets();
          Constants.showLongToastMessage('New Wallet Added. Reloading...', this.toastCtrl);
        }
      }

      buttons.push(button);
    }

    let button = {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    };

    buttons.push(button);

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Add New Wallet',
      buttons: buttons
    });
    actionSheet.present();
  }

  loadRate(wallet) {
    let working_wallet = wallet['value'];
    let shouldDisplay = this.shouldDisplayWallet(wallet);
    if (!shouldDisplay) {
      this.count = this.count + 1;
      this.loadWallets();
      this.unloadedWallets.push(wallet);
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
    Constants.WORKING_TICKER_VALUE = wallet['ticker_symbol'];
    this.navCtrl.push('HomePage');
  }

  isEmpty() {
    return this.loadedWallets.length === 0;
  }
}
