import { StorageService } from './../utils/storageservice';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, ActionSheetController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { Dialogs } from '@ionic-native/dialogs';
import { Wallet } from '../utils/wallet';

/**
 * Generated class for the SellBitPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sell-bit',
  templateUrl: 'sell-bit.html',
})
export class SellBitPage {

  networkAddress: string;
  confirmedAccountBalance: string;
  ls: StorageService;
  sellForm: any;
  loading: Loading;
  usdRate: number = 0;
  usdToNgnRate: number = 0;
  btcToNgn = 0;
  pageTitle: string;
  btcText: string;
  currencyText: string;
  rate = 1;

  priceText: string;
  numberOfBTCText: string;
  sendBitText: string;
  beneficiaryNameText: string;
  banks = [];
  beneficiaryName: string;
  passwordText: string;
  placeOrderText: string;
  isOwner = false;
  sliderValue = 5;
  wallet: Wallet;
  orderType = "MO";

  xendFees = 0;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, private dialogs: Dialogs) {
    this.banks = Constants.properties['banks']
    this.pageTitle = "Place Sell Order"
    this.priceText = "Price Per Coin (USD)";
    this.numberOfBTCText = "Number of Coins";
    this.sendBitText = "Place Sell Order";
    this.placeOrderText = "Place Order";
    this.beneficiaryNameText = "Beneficiary Name";
    this.passwordText = "Wallet Password";

    this.wallet = Constants.WALLET;
    this.currencyText = this.wallet.chain;
    this.btcText = this.wallet.chain;
    this.priceText = this.priceText.replace('Coin', this.btcText);
    this.numberOfBTCText = this.numberOfBTCText.replace('Coin', this.btcText);

    this.sellForm = this.formBuilder.group({
      amountToSpend: ['', Validators.required],
      pricePerBTC: ['', Validators.required],
      usdRate: ['', Validators.required],
      amountToGet: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();

    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewWillEnter() {
    this.isOwner = this.navParams.get('isOwner') === undefined ? false : true;
    this.loadRate();
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad SellBitPage');
    this.loadBalanceFromStorage();
  }

  confirmSell() {
    let sb = this.sellForm.value;
    let amountToSpend = +sb.amountToSpend;
    let amountToGet = +sb.amountToGet;

      let message = 'Are you sure you want to sell '
        + amountToSpend + ' ' + Constants.WORKING_WALLET + '? You will recieve an estimated '
        + Constants.numberWithCommas(amountToGet) + ' NGN';  
      let alert = this.alertCtrl.create({
        title: 'Confirm Buy',
        message: message,
        buttons: [
          {
            text: 'Sell',
            handler: () => {
              this.continue();
            }
          },
          {
            text: "Don't Sell",
            role: 'cancel',
            handler: () => {
              //doNothing
            }
          }
        ]
      });
      alert.present();
  }

  sellBit() {
    let sb = this.sellForm.value;
    let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let password = sb.password;
    let coinAmount = +sb.amountToSpend;
    const blockFees = this.wallet.fees.minBlockFees * this.sliderValue;
    const externalTradingFees = this.wallet.fees.percExternalTradingFees * balance;
    let plusFees = coinAmount + this.xendFees + blockFees + externalTradingFees;
    
    if(this.wallet.fees.feesChain !== undefined) {
      plusFees -= blockFees;
    }

    console.log(coinAmount + this.xendFees + blockFees);
    console.log(balance);

    if (coinAmount === 0) {
      Constants.showPersistentToastMessage("Amount must be greater than 0", this.toastCtrl);
      return;
    } else if (password !== this.ls.getItem("password")) {
      Constants.showPersistentToastMessage("Please enter a valid password.", this.toastCtrl);
      return;
    } else if (plusFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
      return;
    }

    this.confirmSell();
  }

  continue() {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let tickerSymbol = this.wallet.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + '/SELL';
    const blockFees = this.wallet.fees.minBlockFees * this.sliderValue;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.usdRate;
      this.btcToNgn = responseData.result.ngnRate;
      this.usdToNgnRate = this.btcToNgn / this.usdRate;
      this.sellForm.controls.pricePerBTC.setValue(this.usdRate.toFixed(4));
      this.sellForm.controls.usdRate.setValue(this.usdToNgnRate.toFixed(4));
      this.calculateHowMuchToRecieve();

      let sb = this.sellForm.value;
      let amountToSpend = +sb.amountToSpend;
      let password = sb.password;
      let amountToGet = +sb.amountToGet;

      let rate = +sb.pricePerBTC;

      let totalFees = this.xendFees + blockFees;

      let orderType = this.orderType;

      let key = Constants.WORKING_WALLET + "Address";
      let sellerFromAddress = this.ls.getItem(key);

      // Get seller ETH Address to recieve xNGN
      let sellerToAddress = "";
      let wallets = Constants.LOGGED_IN_USER['addressMappings'];
      for (let w of wallets) {
        let wallet = Constants.getWalletFormatted(w);
        if (wallet.chain === 'ETH') {
          sellerToAddress = wallet.chainAddress;
          break;
        }
      }

      let postData = {
        amountToSpend: amountToSpend,
        xendFees: this.xendFees,
        blockFees: blockFees,
        fees: totalFees,
        amountToGet: amountToGet,
        sellerFromAddress: sellerFromAddress,
        sellerToAddress: sellerToAddress,
        fromCoin: Constants.WORKING_WALLET,
        toCoin: "Naira",
        rate: rate,
        emailAddress: this.ls.getItem("emailAddress"),
        password: password,
        networkAddress: sellerFromAddress,
        orderType: orderType,
        side: 'SELL',
      }

      console.log(postData);

      //this is wrong
      let url = Constants.SELL_TRADE_URL;

      this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        if (responseData.response_text === "success") {
          this.clearForm();
          Constants.showPersistentToastMessage("Your sell order has been placed. It will be available in the market place soon", this.toastCtrl);
          Constants.properties['selectedPair'] = Constants.WORKING_WALLET + " -> Naira";
          if (this.orderType === 'MO') {
            // do nothing
            this.navCtrl.pop();
          } else {
            this.navCtrl.push('MyOrdersPage');
          }
        } else {
          Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
        }
      }, _error => {
        this.loading.dismiss();
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });

    }, error => {
      //doNothing
    });
  }

  sellAll() {
    let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let xendFees = balance * this.wallet.fees.percXendFees;
    let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
    let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
    if (xendFees < minxfInTokens) {
      xendFees = minxfInTokens
    }

    if(xendFees > maxfInTokens) {
      xendFees = maxfInTokens;
    }

    this.xendFees = xendFees;

    const externalTradingFees = this.wallet.fees.percExternalTradingFees * balance;
    const blockFees = this.wallet.fees.minBlockFees * this.sliderValue;
    let canSend = balance - blockFees - xendFees - externalTradingFees - 0.00001;

    if(this.wallet.fees.feesChain !== undefined) {
      canSend += blockFees;
    }

    if (canSend < 0) {
      canSend = 0;
    }

    this.sellForm.controls.amountToSpend.setValue(canSend.toFixed(4));
    let atr = this.btcToNgn * canSend;
    this.sellForm.controls.amountToGet.setValue(atr.toFixed(4));
  }

  sellBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendFi",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then((_result: any) => {
        this.sellForm.controls.password.setValue(this.ls.getItem("password"));
        this.sellBit();
      })
      .catch((error: any) => {
        Constants.showPersistentToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  loadRate() {
    let tickerSymbol = this.wallet.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + '/SELL';

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.usdRate;
      this.btcToNgn = responseData.result.ngnRate;
      this.usdToNgnRate = this.btcToNgn / this.usdRate;
      this.sellForm.controls.pricePerBTC.setValue(this.usdRate.toFixed(4));
      this.sellForm.controls.usdRate.setValue(this.usdToNgnRate.toFixed(4));
      this.sellAll();
      this.calculateHowMuchToRecieve();
    }, error => {
      //doNothing
    });
  }

  loadBalanceFromStorage() {
    this.networkAddress = this.wallet.chainAddress;
    if (this.networkAddress !== null) {
      this.confirmedAccountBalance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    }
  }

  clearForm() {
    this.sellForm.reset();
    this.loadRate();
  }

  calculateHowMuchToRecieve() {
    this.rate = this.sellForm.value.pricePerBTC;
    let toSell = +this.sellForm.value.amountToSpend;
    let xendFees = toSell * this.wallet.fees.percXendFees;
    let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
    let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
    if (xendFees < minxfInTokens) {
      xendFees = minxfInTokens
    }

    if(xendFees > maxfInTokens) {
      xendFees = maxfInTokens;
    }

    if (this.rate !== 0 && toSell !== 0) {
      let toRecieve = toSell * this.btcToNgn;
      toRecieve = toRecieve - (toRecieve * this.wallet.fees.percExternalTradingFees) - this.wallet.fees.externalWithdrawalFees - xendFees;
      this.sellForm.controls.amountToGet.setValue(toRecieve.toFixed(3));
    }
  }

  showOrderTypeInfo() {
    let title = this.orderType === 'MO' ? 'Market Order' : 'Order Book'
    let moText = 'Market Order: Selling your coins immediately on the exchange using the current market price.';
    let p2pText = 'Oderbook Orders "Allows you to place a sell order for your asset';
    let text = this.orderType === 'MO' ? moText : p2pText;
    console.log(title, text);
    this.dialogs.alert(text, title, 'Got It!')
      .then(() => console.log('Dialog dismissed'))
      .catch(e => console.log('Error displaying dialog', e));
  }
}
