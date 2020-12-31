import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';
import { Wallet } from '../utils/wallet';

/**
 * Generated class for the ExchangePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-exchange',
  templateUrl: 'exchange.html',
})
export class ExchangePage {

  ls: StorageService;
  btcToNgn = 0;
  sellForm;
  btcText: string;
  currencyText: string;
  priceText: string;
  numberOfBTCText: string;
  paymentMethods = [];
  bankPaymentMenthods = [];
  amountToRecieve: number;
  recipientOtherAddress: string;
  loading: Loading;
  selectedPaymentMethod: string;
  rate = 0;
  type = 'Sell';
  getOrPay = "get";
  sentOrDeducted = "sent to";
  isSellEnabled = false;
  isBuyEnabled = true;
  sliderValue = 5;

  wallet: Wallet;
  usdRate = 0;
  xendFees = 0;
  blockFees = 0;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    this.sellForm = this.formBuilder.group({
      numberOfBTC: ['', Validators.required],
      pricePerBTC: ['', Validators.required],
      password: ['', Validators.required],
      acceptedPaymentMethod: ['', Validators.required],
      amountToRecieve: ['', Validators.required],
      recipientOtherAddress: ['', Validators.required]
    });

    this.numberOfBTCText = "Number of Coins";
    this.priceText = "Price Per Coin";

    this.ls = Constants.storageService;
    this.wallet = Constants.WALLET;
    this.init();
  }

  ionViewWillEnter() {
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    Console.log('ionViewDidEnter ExchangePage');
    this.loadRate('BUY', false);
  }

  init() {
    this.paymentMethods = [];

    this.currencyText = this.wallet.chain;
    this.btcText = this.wallet.chain
    this.priceText = this.priceText.replace('Coin', this.btcText);
    this.numberOfBTCText = this.numberOfBTCText.replace('Coin', this.btcText);

    this.type = 'Sell';

    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet.chain !== Constants.WORKING_WALLET) {
        this.paymentMethods.push(wallet);
      }
    }
  }

  loadRate(side, showLoading) {
    let tickerSymbol = this.wallet.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + "/" + side;

    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Calculating Exchange Rates. Please Wait....");
    }
    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      if (showLoading) {
        this.loading.dismiss();
      }
      this.btcToNgn = responseData.data.ngnRate;
      this.usdRate = responseData.data.usdRate;

      if (showLoading) {
        this.calculateHowMuchToRecieve();
      }
    }, _error => {
      if (showLoading) {
        this.loading.dismiss();
      }
    });
  }

  switchTo(type) {
    this.type = type;
    this.getOrPay = this.type === 'Sell' ? 'get' : 'pay';
    this.sentOrDeducted = this.type === 'Sell' ? 'sent to' : 'deducted from';
    if (type === 'Sell') {
      this.isSellEnabled = false;
      this.isBuyEnabled = true;
    } else {
      this.isSellEnabled = true;
      this.isBuyEnabled = false;
    }

    this.loadRate(type === 'Sell' ? 'SELL' : 'BUY', true);
  }


  sellBit() {
    let sb = this.sellForm.value;

    let fromCoin = Constants.WORKING_WALLET;
    let toCoin = this.selectedPaymentMethod;
    let sellerFromAddress = this.wallet.chainAddress;
    let sellerToAddress = sb.recipientOtherAddress;

    if (this.type === 'Buy') {
      //switch sides
      let temp = sellerFromAddress;
      sellerFromAddress = sellerToAddress;
      sellerToAddress = temp;
      temp = fromCoin;
      fromCoin = toCoin;
      toCoin = temp;
    }

    let isValid = false;
    let balance = +this.ls.getItem(fromCoin + "confirmedAccountBalance");
    let rate = +sb.pricePerBTC;
    let password = sb.password;
    let toSell = +sb.numberOfBTC;
    let toRecieve = +sb.amountToRecieve;

    if (this.type === 'Buy') {
      toSell = +sb.amountToRecieve;
      toRecieve = +sb.numberOfBTC;
    }

    if (toSell === 0) {
      Constants.showPersistentToastMessage("Please enter amount to sell", this.toastCtrl);
    } else if (rate === 0) {
      Constants.showPersistentToastMessage("Please enter rate", this.toastCtrl);
    } else if (password !== this.ls.getItem("password")) {
      Constants.showPersistentToastMessage("Please enter a valid password.", this.toastCtrl);
    } else if (toSell + this.xendFees + this.blockFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else if (sb.acceptedPaymentMethods === "") {
      Constants.showPersistentToastMessage("Please specify accepted payment method", this.toastCtrl);
    } else if (this.sellForm.valid) {
      isValid = true;
    }

    if (isValid) {    
      let totalFees = +this.xendFees + this.blockFees;

      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
      let postData = {
        toSell: toSell,
        toRecieve: toRecieve,
        sellerFromAddress: sellerFromAddress,
        sellerToAddress: sellerToAddress,
        fromCoin: fromCoin,
        toCoin: toCoin,
        rate: rate,
        emailAddress: this.ls.getItem("emailAddress"),
        password: password,
        networkAddress: sellerFromAddress,
        xendFees: this.xendFees,
        blockFees: this.blockFees,
        fees: totalFees,
        orderType: 'P2P',
        side: 'SELL',
      }

      let url = Constants.SELL_TRADE_URL;
      this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(
        responseData => {
          Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
          this.clearForm();
          this.loading.dismiss();
        }, error => {
          this.loading.dismiss();
          Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
          //doNothing
        })
    }
  }

  clearForm() {
    this.sellForm.reset();
  }

  sellBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendFi",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    }).then((result: any) => {
      this.sellForm.controls.password.setValue(this.ls.getItem("password"));
      this.sellBit();
    })
      .catch((error: any) => {
        Constants.showPersistentToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  paymentMethodSelected(value) {
    this.selectedPaymentMethod = value;
    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    let recipientOtherAddress = "";
    let f2 = undefined;
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet.chain === value) {
        recipientOtherAddress = wallet.chainAddress;
        f2 = wallet;
        break;
      }
    }
    this.sellForm.controls.recipientOtherAddress.setValue(recipientOtherAddress);
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Calculating Exchange Rates. Please Wait....");
    let f1 = this.wallet;

    let url = Constants.GET_EXCHANGE_RATE_URL + f1.tickerSymbol + "/" + f2.tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      this.rate = responseData.result['t1_t2'];
      this.sellForm.controls.pricePerBTC.setValue(this.rate.toFixed(7));
      let toSell = this.sellForm.value.numberOfBTC;
      if (toSell > 0) {
        let toRecieve = toSell * this.rate;
        this.sellForm.controls.amountToRecieve.setValue(toRecieve.toFixed(7));
      }

      this.calculateHowMuchToRecieve();
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  calculateHowMuchToRecieve() {
    this.rate = this.sellForm.value.pricePerBTC;
    this.blockFees = this.wallet.fees.minBlockFees * this.sliderValue;
    if (this.type === 'Sell') {      
      let toSell = +this.sellForm.value.numberOfBTC;      

      let xendFees = toSell * this.wallet.fees.percXendFees;
      let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
      let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
      if (xendFees < minxfInTokens) {
        xendFees = minxfInTokens
      }
  
      if(xendFees > maxfInTokens) {
        xendFees = maxfInTokens;
      }

      this.xendFees = xendFees;

      if (this.rate !== 0) {
        let toBuy = toSell * this.rate;
        this.sellForm.controls.amountToRecieve.setValue(toBuy.toFixed(7));
      }
    } else {
      let toBuy = +this.sellForm.value.numberOfBTC;
      if (this.rate !== 0) {
        let toSell = toBuy * this.rate;
        let xendFees = toSell * this.wallet.fees.percXendFees;

        let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
        let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
        if (xendFees < minxfInTokens) {
          xendFees = minxfInTokens
        }
    
        if(xendFees > maxfInTokens) {
          xendFees = maxfInTokens;
        }
    
        this.xendFees = xendFees;
  
        this.sellForm.controls.amountToRecieve.setValue(toSell.toFixed(7));
      }
    }
  }

}
