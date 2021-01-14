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
  hasNgnPair = false;

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
      this.btcToNgn = responseData.data.ngnRate;
      if(this.btcToNgn < 0 || this.wallet.fees.externalDepositFees === -1) {
        this.hasNgnPair = false;
      } else {
        this.hasNgnPair = true;
      }
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
    Constants.showToastMessage(message, this.toastCtrl);
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

      app.getBalance(showLoading);
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
      if (data["Error Message"] === undefined) {
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
      }
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

  getBalance(showLoading) {
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    const userId = this.ls.getItem("userId");
    const url = Constants.GET_BALANCE_URL + "/" + userId + "/" + this.wallet.chain;

    this.http.get(url)
      .map(res => res.json())
      .subscribe(responseData => {
        if (showLoading) {
          this.loading.dismiss();
        }
        
        if (responseData.status === 'success') {
          this.confirmedAccountBalance = responseData.data.balance
          this.ls.setItem(Constants.WORKING_WALLET + "confirmedAccountBalance", responseData.data.balance);

          this.escrow = responseData.data.escrow;
        }
      }, error => {
        if (showLoading) {
          this.loading.dismiss();
        }
        let errorBody = JSON.parse(error._body);
        Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);    
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
    this.getBalance(false);
    if (type === 'Sell') {
      this.getBalance(false);
      this.navCtrl.push('SellBitPage');
    } else if (type === 'Buy') {
      this.navCtrl.push('BuyBitPage');
    } else if (type === 'Send') {
      this.navCtrl.push('SendBitPage');
    }
  }
}
