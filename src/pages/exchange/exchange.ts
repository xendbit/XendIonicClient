import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';

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
  usdRate = 0;
  btcRate = 0;
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

  wallet = undefined;

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
  }
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
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loadRate();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    Console.log('ionViewDidEnter ExchangePage');
    this.init();
  }

  init() {
    this.wallet = Constants.WALLET;
    this.paymentMethods = [];

    this.currencyText = this.wallet['value'];
    this.btcText = this.wallet['value'];
    this.priceText = this.priceText.replace('Coin', this.btcText);
    this.numberOfBTCText = this.numberOfBTCText.replace('Coin', this.btcText);

    this.type = 'Sell';

    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet['value'] !== Constants.WORKING_WALLET) {
        this.paymentMethods.push(wallet);
      }
    }
  }

  loadRate() {
    let tickerSymbol = this.wallet['ticker_symbol'];
    let url = Constants.GET_USD_RATE_URL + tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.buy;
      this.btcRate = responseData.result.rate;
      Constants.LAST_USD_RATE = this.btcRate;
      this.btcToNgn = this.btcRate * this.usdRate;
    }, _error => {
      //doNothing
    });
  }

  sellBit() {
    let sb = this.sellForm.value;

    let fromCoin = Constants.WORKING_WALLET;
    let toCoin = this.selectedPaymentMethod;
    let sellerFromAddress = this.wallet['chain_address'];
    let networdAddress = sellerFromAddress;
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
    let coinAmount = +sb.numberOfBTC;
    let amountToRecieve = +sb.amountToRecieve;


    let xendFees = coinAmount * +this.wallet['token']['xendFees']
    let blockFees = +this.wallet['token']['minBlockFees'];

    if (coinAmount === 0) {
      Constants.showLongToastMessage("Please enter amount to sell", this.toastCtrl);
    } else if (rate === 0) {
      Constants.showLongToastMessage("Please enter rate", this.toastCtrl);
    } else if (password !== this.ls.getItem("password")) {
      Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
    } else if (coinAmount + xendFees + blockFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else if (sb.acceptedPaymentMethods === "") {
      Constants.showPersistentToastMessage("Please specify accepted payment method", this.toastCtrl);
    } else if (this.sellForm.valid) {
      isValid = true;
    }

    if (isValid) {
      let amountToSell = coinAmount;

      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
      let postData = {
        amountToSell: amountToSell,
        amountToRecieve: amountToRecieve,
        sellerFromAddress: sellerFromAddress,
        sellerToAddress: sellerToAddress,
        fromCoin: fromCoin,
        toCoin: toCoin,
        rate: rate,
        emailAddress: this.ls.getItem("emailAddress"),
        password: password,
        networkAddress: networdAddress,
      }

      let url = Constants.POST_TRADE_URL;
      this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(
        responseData => {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
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
    this.sellForm.controls.numberOfBTC.setValue('');
    this.sellForm.controls.amountToRecieve.setValue('');
    //this.sellForm.controls.pricePerBTC.setValue('');
    //this.sellForm.controls.recipientOtherAddress.setValue('');
    this.sellForm.controls.password.setValue('');
  }

  sellBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendBit",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    }).then((result: any) => {
      this.sellForm.controls.password.setValue(this.ls.getItem("password"));
      this.sellBit();
    })
      .catch((error: any) => {
        Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  paymentMethodSelected(value) {
    this.selectedPaymentMethod = value;
    let wallets = Constants.LOGGED_IN_USER['addressMappings'];
    let recipientOtherAddress = "";
    let f2 = undefined;
    for (let w of wallets) {
      let wallet = Constants.getWalletFormatted(w);
      if (wallet['value'] === value) {
        recipientOtherAddress = wallet['chain_address'];
        f2 = wallet;
      }
    }
    this.sellForm.controls.recipientOtherAddress.setValue(recipientOtherAddress);
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Calculating Exchange Rates. Please Wait....");
    let f1 = this.wallet;

    let url = Constants.GET_EXCHANGE_RATE_URL + f1['ticker_symbol'] + "/" + f2['ticker_symbol'];

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      this.rate = responseData.result['t1_t2'];
      this.sellForm.controls.pricePerBTC.setValue(this.rate.toFixed(7));
      let toSell = this.sellForm.value.numberOfBTC;
      if (toSell > 0) {
        let amount = toSell * this.rate;
        this.sellForm.controls.amountToRecieve.setValue(amount.toFixed(7));
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  calculateHowMuchToRecieve() {
    this.rate = this.sellForm.value.pricePerBTC;
    let toSell = +this.sellForm.value.numberOfBTC;
    if (this.rate !== 0 && toSell !== 0) {
      let toRecieve = toSell * this.rate;
      this.sellForm.controls.amountToRecieve.setValue(toRecieve.toFixed(7));
    }
  }

}
