import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Dialogs } from '@ionic-native/dialogs';
import { Wallet } from '../utils/wallet';

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
  orderType = 'MO';
  buyForm: any;


  sliderValue = 5;
  rate = 0;
  usdToNgnRate = 0;
  usdRate = 0;
  btcText = 'xNGN';

  wallet: Wallet;


  constructor(public formBuilder: FormBuilder, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController, private dialogs: Dialogs) {
    this.wallet = Constants.WALLET;    

    this.loadRate();

    this.btcText = this.wallet.chain;

    this.buyForm = this.formBuilder.group({
      amountToGet: ['', Validators.required],
      pricePerBTC: ['', Validators.required],
      usdRate: ['', Validators.required],
      amountToSpend: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad BuyBitNgntPage');
  }

  ionViewDidEnter() {
    this.loadSellers();
    this.loadRate();
  }

  loadRate() {
    let tickerSymbol = this.wallet.tickerSymbol
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + "/BUY";

    Console.log(url);

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.usdRate;
      this.btcToNgn = responseData.result.ngnRate;
      this.usdToNgnRate = this.btcToNgn / this.usdRate;
      this.buyForm.controls.pricePerBTC.setValue(this.usdRate.toFixed(4));
      this.buyForm.controls.usdRate.setValue(this.usdToNgnRate.toFixed(4));

      this.calculateHowMuchToRecieve();
    }, _error => {
      //doNothing
    });
  }

  calculateHowMuchToRecieve() {
    this.rate = this.buyForm.value.pricePerBTC;  
    const amount = +this.buyForm.value.amountToSpend - this.wallet.fees.externalDepositFees;
    if (this.rate !== 0 && amount !== 0 && this.btcToNgn !== 0) {
      let numBTC = amount * (1/this.btcToNgn);
      let xendFees = numBTC * this.wallet.fees.percXendFees;
      let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
      let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
      if (xendFees < minxfInTokens) {
        xendFees = minxfInTokens
      }
  
      if(xendFees > maxfInTokens) {
        xendFees = maxfInTokens;
      }
    
      numBTC = numBTC - (numBTC * this.wallet.fees.percExternalTradingFees) - this.wallet.fees.externalWithdrawalFees - xendFees;
      this.buyForm.controls.amountToGet.setValue(numBTC.toFixed(7));
    }
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
      let wallet: Wallet = Constants.getWalletFormatted(w);
      if (wallet.chain !== Constants.WORKING_WALLET) {
        let pair = Constants.WORKING_WALLET + " -> " + wallet.chain;
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

  buyBit(seller) {
    Console.log("buyBit");
    if (this.orderType === 'MO') {
      let sb = this.buyForm.value;
      let password = sb.password;
      let coinAmount = +sb.amountToGet;

      if (coinAmount === 0) {
        Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
        return;
      } else if (password !== this.ls.getItem("password")) {
        Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
        return;
      }

      this.confirmBuy();
    } else {
      this.presentAlert(seller);
    }
  }

  continue() {
    if (this.orderType === 'MO') {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
      let tickerSymbol = this.wallet.tickerSymbol
      let url = Constants.GET_USD_RATE_URL + tickerSymbol + "/BUY";

      Console.log(url);

      this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
        this.usdRate = responseData.result.usdRate;
        this.btcToNgn = responseData.result.ngnRate;
        this.usdToNgnRate = this.btcToNgn / this.usdRate;
        this.buyForm.controls.pricePerBTC.setValue(this.usdRate.toFixed(4));
        this.buyForm.controls.usdRate.setValue(this.usdToNgnRate.toFixed(4));

        this.calculateHowMuchToRecieve();
        
        let sb = this.buyForm.value;
        let amountToGet = +sb.amountToGet;
        let password = sb.password;
        let amountToSpend = +sb.amountToSpend;

        let rate = +sb.pricePerBTC;

        let orderType = this.orderType;

        let key = Constants.WORKING_WALLET + "Address";
        let sellerFromAddress = this.ls.getItem(key);

        let postData = {
          amountToGet: amountToGet,
          xendFees: 0,
          blockFees: this.sliderValue * this.wallet.fees.minBlockFees,
          fees: 0,
          amountToSpend: amountToSpend,
          sellerFromAddress: sellerFromAddress,
          sellerToAddress: sellerFromAddress,
          fromCoin: Constants.WORKING_WALLET,
          toCoin: "Naira",
          rate: rate,
          emailAddress: this.ls.getItem("emailAddress"),
          password: password,
          networkAddress: sellerFromAddress,
          orderType: orderType,
          side: 'BUY',
        }

        console.log(postData);

        //this is wrong
        let url = Constants.BUY_TRADE_URL;

        this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
          this.loading.dismiss();
          if (responseData.response_text === "success") {
            this.buyForm.reset();
            this.loadRate();
            Constants.showPersistentToastMessage("Your buy order has been placed.", this.toastCtrl);
            this.navCtrl.pop();
          } else {
            Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
          }
        }, _error => {
          this.loading.dismiss();
          Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
        });
      }, _error => {
        //doNothing
      });
    }
  }

  confirmBuy() {
    let sb = this.buyForm.value;
    let amountToGet = +sb.amountToGet;
    let amountToSpend = +sb.amountToSpend;

      let message = 'Are you sure you want to buy '
        + Constants.numberWithCommas(amountToSpend) + ' NGN worth of '
        + Constants.WORKING_WALLET + '? You will recieve an estimated '
        + amountToGet + ' ' + Constants.WORKING_WALLET;  
      let alert = this.alertCtrl.create({
        title: 'Confirm Buy',
        message: message,
        buttons: [
          {
            text: 'Buy',
            handler: () => {
              this.continue();
            }
          },
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

  presentAlert(seller) {
    let message = 'Do you want to buy '
      + seller.amountToSell + ' '
      + seller.fromCoin + ' @ '
      + seller.rate + ' per coin? You will be paying '
      + seller.amountToReceive + ' in '
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

  getBuyerOtherAddress(seller) {
    let coin = seller.toCoin;
    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet.chain === coin) {
        this.buyerOtherAddress = wallet.chainAddress
        break;
      }
    }
    this.trade(seller);
  }

  trade(seller) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait....");
    let buyerAddress = this.wallet.chainAddress;
    let trxId = seller.trxId;
    let data = {
      "buyerAddress": buyerAddress,
      "buyerOtherAddress": this.buyerOtherAddress,
      "buyerEmailAddress": this.ls.getItem("emailAddress"),
      "password": this.ls.getItem("password"),
      "trxId": trxId
    };

    console.log(data);
    let url = Constants.TRADE_URL;

    this.http.post(url, data, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.response_text === 'success') {
        this.loadSellers();
        Constants.showLongerToastMessage('Order Successfully Completed. Reload to see your new balance', this.toastCtrl);
      } else {
        this.loadSellers();
        Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
      }
    }, error => {
      this.loading.dismiss();
      Console.log(error);
      Constants.showLongToastMessage('Can not buy coin at this time. Please try again', this.toastCtrl);
    })
  }

  showOrderTypeInfo() {    
    let title = this.orderType === 'MO' ? 'Market Order' : 'P2P Exchange'
    let moText = 'Market Order: Selling your coins immediately on the exchange using the current market price.';
    let p2pText = 'P2P Exchnage: Allows you to set the price you want your coins to be sold at.\n'
      + 'This is usually reserved for advanced traders';
    let text = this.orderType === 'MO' ? moText : p2pText;
    console.log(title, text);
    this.dialogs.alert(text, title, 'OK')
      .then(() => console.log('Dialog dismissed'))
      .catch(e => console.log('Error displaying dialog', e));
  }
}
