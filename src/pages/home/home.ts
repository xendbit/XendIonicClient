import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { Platform, ActionSheetController, ModalController, AlertController, NavController, ToastController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Wallet } from '../utils/wallet';
declare var Highcharts: any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  networkAddress: string;
  confirmedAccountBalance: number;
  totalSent: number;
  totalReceived: number;
  escrow: number;

  cashBalance: number = 0;
  ls: StorageService;
  static wallet: any;
  loading: Loading;

  pageTitle: string;
  yourBTCWalletText: string;
  yourCashWalletText: string;
  clickToCopyText: string;
  accountBalanceText: string;
  xendBalance: string;
  cashSymbolText: string;
  btcText: string;
  sellBitText: string;
  loadWalletText: string;
  private clipboard: Clipboard;
  btcToNgn = 0;
  qrType = 'img';
  qrValue: string;
  qrCssClass = "hide";
  isShowingQr = false;
  currencyText: string;
  emailAddress: string;
  showXendBalance = true;
  isAdvanced = false;
  isBeneficiary = false;

  cryptoSellOrderText = 'Sell';
  cryptoBuyOrderText = 'Buy';
  fiatSellOrderText = 'Fiat Sell-Order';
  wtv = 'btc';
  wallet: Wallet;

  constructor(public modalCtrl: ModalController, public alertCtrl: AlertController, public platform: Platform, public loadingCtrl: LoadingController, public navCtrl: NavController, public http: Http, public toastCtrl: ToastController, public localNotifications: LocalNotifications, public actionSheetCtrl: ActionSheetController) {
    this.clipboard = new Clipboard();
    this.ls = Constants.storageService;    
    Constants.properties['home'] = this;
    this.wtv = Constants.WORKING_TICKER_VALUE;
    this.wallet = Constants.WALLET;    
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

  copyBitcoinAddress() {
    if (this.isShowingQr) {
      this.qrCssClass = "hide";
      this.isShowingQr = false;
    } else {
      this.qrCssClass = "show";
      this.isShowingQr = true;
    }
    this.clipboard.copy(this.networkAddress);
    let message = "Coin Address Copied".replace("Coin", this.wallet.chain);
    Constants.showLongToastMessage(message, this.toastCtrl);
  }

  refresh(showLoading) {
    let app = this;
    setTimeout(function () {
      app.qrValue = app.wallet.chainAddress
      app.emailAddress = app.ls.getItem('emailAddress');
      app.networkAddress = app.wallet.chainAddress
      app.currencyText = app.wallet.chain;
      app.btcText = app.wallet.chain;

      app.yourBTCWalletText = "My Coin Wallet".replace('Coin', app.btcText);

      app.getTransactions(showLoading);
      app.loadRate();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }


  ionViewDidLoad() {
    Console.log('ionViewDidLoad HomePage');
    this.cryptoSellOrderText = 'Sell';
    this.cryptoBuyOrderText = 'Buy';
    this.fiatSellOrderText = 'Fiat Sell-Order'

    Console.log("Working Wallet: " + Constants.WORKING_WALLET);
    this.initProps();
    this.loadCharts();
  }

  loadCharts() {
    let tickerSymbol = this.wallet.tickerSymbol;
    let symbol = this.wallet.chain;
    let url = Constants.CHART_URL.replace("{{symbol}}", tickerSymbol.toUpperCase());
    this.http.get(url).map(res => res.json()).subscribe(data => {
      let dates = Object.keys(data['Time Series (Digital Currency Daily)']);
      dates.sort();
      let jsonData = data['Time Series (Digital Currency Daily)'];
      data = [];
      for (let date of dates) {
        let dateLong = new Date(date).getTime();
        let value = +jsonData[date]["4a. close (USD)"];
        let singleValue = [dateLong, value];
        data.push(singleValue);
      }

      Highcharts.stockChart('container', {
        chart: {
          alignTicks: false
        },
        rangeSelector: {
          selected: 1
        },
        title: {
          text: symbol + ' Price Chart'
        },
        series: [{
          type: 'line',
          name: symbol + ' Price Chart',
          data: data,
          tooltip: {
            valueDecimals: 2
          },
          dataGrouping: {
            units: [[
              'week', // unit name
              [1] // allowed multiples
            ], [
              'month',
              [1, 2, 3, 4, 6]
            ]]
          }
        }]
      });
    }, _error => {
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      Console.log("Can not pull data from server");
      //this.platform.exitApp();
    });
  }

  ionViewDidEnter() {
    Console.log('ionViewDidEnter HomePage');
    this.isAdvanced = false;

    this.refresh(false);

    if (StorageService.ACCOUNT_TYPE === "ADVANCED") {
      this.isAdvanced = true;
    }

    this.cryptoSellOrderText = 'Sell';
    this.cryptoBuyOrderText = 'Buy';
    this.fiatSellOrderText = 'Fiat Sell Order'
  }

  ionViewWillLeave() {
    Console.log('ionViewWillLeave HomePage');
  }

  getTransactions(showLoading) {
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.wallet.chainAddress,
      emailAddress: this.ls.getItem("emailAddress"),
    };

    this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader(Constants.WORKING_WALLET))
      .map(res => res.json())
      .subscribe(responseData => {
        if (showLoading) {
          this.loading.dismiss();
        }
        //if (responseData.response_text === "success") {
        if (responseData.response_code === 0) {
          this.confirmedAccountBalance = responseData.result.balance
          this.ls.setItem(Constants.WORKING_WALLET + "confirmedAccountBalance", responseData.result.balance);
          this.totalReceived = responseData.result.received
          this.totalSent = responseData.result.spent

          this.escrow = responseData.result.escrow === 0 ? 0 : (responseData.result.escrow)
        }
      }, _error => {
        if (showLoading) {
          this.loading.dismiss();
        }
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }

  initProps() {
    this.pageTitle = "Home";
    this.yourCashWalletText = "My Cash Wallet";
    this.clickToCopyText = "Click the address to copy it";
    this.accountBalanceText = "Account Balance";
    this.cashSymbolText = "NGN";
    this.loadWalletText = "Fund Wallet";
    this.sellBitText = "Place Sell Order";

    this.currencyText = this.wallet.chain;
    this.btcText = this.wallet.chain;
    this.yourBTCWalletText = "My Coin Wallet".replace('Coin', this.btcText);
    this.yourBTCWalletText = this.yourBTCWalletText.replace('/t*BTC/gi', this.btcText);
  }

  exchange(type) {
    this.getTransactions(false);
    if (type === 'Sell') {
      this.getTransactions(false);
      this.navCtrl.push('SellBitPage');
    } else if (type === 'Buy') {
      this.navCtrl.push('BuyBitPage');
    } else if (type === 'Send') {
      this.navCtrl.push('SendBitPage');
    }
  }

  sellBit() {
    this.getTransactions(false);
    if (this.ls.getItem("bankCode") === "000" || this.ls.getItem('bankCode') === undefined) {
      Constants.showAlert(this.toastCtrl, "Feature Unavailable", "This feature is not available because you didn't provide bank details during registration.");
      return;
    } else if (this.ls.getItem("exchangeType") === 'exchange') {
      this.navCtrl.push('SellBitPage', { 'isOwner': true });
    } else {
      this.navCtrl.push('SellEquityPage', { 'isOwner': true });
    }
  }

  sellOrders() {
    this.navCtrl.push('MyOrdersPage');
  }
}
