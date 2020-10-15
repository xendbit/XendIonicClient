import { StorageService } from './../utils/storageservice';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, ActionSheetController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';

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
  btcRate: number = 0;
  btcToNgn = 0;
  pageTitle: string;
  btcText: string;
  currencyText: string;
  rate = 1;

  priceText: string;
  numberOfBTCText: string;
  sendBitText: string;
  beneficiaryNameText: string;
  beneficiaryAccountNumberText: string;
  beneficiaryBankText: string;
  banks = [];
  beneficiaryName: string;
  passwordText: string;
  placeOrderText: string;
  isOwner = false;
  beneficiaryData = {
    beneficiaryBank: "",
    beneficiaryAccountNumber: ""
  };

  blockFees = 0;
  xendFees = 0;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
    this.banks = Constants.properties['banks']
    this.pageTitle = "Place Sell Order"
    this.priceText = "Price Per Coin (USD)";
    this.numberOfBTCText = "Number of Coins";
    this.sendBitText = "Place Sell Order";
    this.placeOrderText = "Place Order";
    this.beneficiaryNameText = "Beneficiary Name";
    this.beneficiaryAccountNumberText = "Beneficiary Account Number";
    this.beneficiaryBankText = "Beneficiary Bank";
    this.passwordText = "Wallet Password";

    let fees = Constants.getCurrentWalletProperties();
    this.currencyText = fees.currencyText;
    this.btcText = fees.btcText;
    this.priceText = this.priceText.replace('Coin', this.btcText);
    this.numberOfBTCText = this.numberOfBTCText.replace('Coin', this.btcText);

    this.sellForm = this.formBuilder.group({
      numberOfBTC: ['', Validators.required],
      pricePerBTC: ['', Validators.required],
      usdRate: ['', Validators.required],
      amountToRecieve: ['', Validators.required],
      beneficiaryAccountNumber: ['', Validators.required],
      beneficiaryBank: ['', Validators.required],
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
    let fees = Constants.getCurrentWalletProperties();
    this.blockFees = +fees.blockFees;
    this.xendFees = +fees.xendFees;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad SellBitPage');
    this.loadRate();
    this.loadBalanceFromStorage();
    this.populateBeneficiaryInformation();
  }

  async populateBeneficiaryInformation() {
    this.sellForm.controls.beneficiaryAccountNumber.setValue(await this.ls.getItem('accountNumber'));
    this.sellForm.controls.beneficiaryBank.setValue(await this.ls.getItem("bank"));
  }

  async sellBit() {
    let isValid = false;
    let sb = this.sellForm.value;
    let balance = await +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let price = +sb.pricePerBTC;
    let password = sb.password;
    let coinAmount = +sb.numberOfBTC;

    if (coinAmount === 0) {
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (!this.isOwner && sb.beneficiaryBank === "") {
      Constants.showLongToastMessage("Please select the beneficiary bank", this.toastCtrl);
    } else if (price === 0) {
      Constants.showLongToastMessage("Price must be greater than 0", this.toastCtrl);
    } else if (!this.isOwner && sb.beneficiaryAccountNumber === '') {
      Constants.showLongToastMessage("Please enter a valid beneficiary account number", this.toastCtrl);
    } else if (password !== await this.ls.getItem("password")) {
      Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
    } else if (coinAmount + this.xendFees + this.blockFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else {
      isValid = true;
    }

    if (isValid) {
      let beneficiaryAccountNumber = this.isOwner ? await this.ls.getItem('accountNumber') : sb.beneficiaryAccountNumber;
      let beneficiaryBank = this.isOwner ? await this.ls.getItem('bankCode') : sb.beneficiaryBank;

      this.beneficiaryData.beneficiaryBank = beneficiaryBank;
      this.beneficiaryData.beneficiaryAccountNumber = beneficiaryAccountNumber;

      let data = {
        beneficiaryBank: beneficiaryBank,
        beneficiaryAccountNumber: beneficiaryAccountNumber
      }

      this.confirmBeneficiary(data);
    }
  }

  presentActionSheet(beneficiaryName) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Continue" + '?',
      buttons: [
        {
          text: beneficiaryName,
          handler: () => {
            this.continue();
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }

  confirmBeneficiary(data) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");

    let url = Constants.RESOLVE_ACCOUNT_URL;
    let postData = {
      bankCode: data.beneficiaryBank,
      accountNumber: data.beneficiaryAccountNumber
    };

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      if (responseData.response_text === "success") {
        this.beneficiaryName = responseData.account_name;
        this.loading.dismiss();
        this.presentActionSheet(this.beneficiaryName);
      } else {
        Constants.showPersistentToastMessage("Can not confirm beneficiary account number.", this.toastCtrl);
        this.loading.dismiss();
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  async continue() {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let sb = this.sellForm.value;
    let coinAmount = +sb.numberOfBTC;
    let beneficiaryAccountNumber = this.beneficiaryData.beneficiaryAccountNumber;
    let beneficiaryBank = this.beneficiaryData.beneficiaryBank;
    let password = sb.password;
    let amountToRecieve = +sb.amountToRecieve;

    let rate = +sb.pricePerBTC;

    let fees = Constants.getCurrentWalletProperties();

    let btcValue = coinAmount;

    let totalFees = (+this.xendFees * btcValue) + +this.blockFees;

    let key = Constants.WORKING_WALLET + "Address";
    let sellerFromAddress = await this.ls.getItem(key);
    let sellerToAddress = beneficiaryBank + ":" + beneficiaryAccountNumber;

    let postData = {
      amountToSell: btcValue,
      fees: totalFees,
      amountToRecieve: amountToRecieve,
      sellerFromAddress: sellerFromAddress,
      sellerToAddress: sellerToAddress,
      fromCoin: Constants.WORKING_WALLET,
      toCoin: "Naira",
      rate: rate,
      emailAddress: await this.ls.getItem("emailAddress"),
      password: password,
      networkAddress: sellerFromAddress,
      currencyId: fees.currencyId,
      equityId: fees.equityId
    }

    //this is wrong
    let url = Constants.POST_TRADE_URL;

    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.clearForm();
      this.loading.dismiss();
      if (responseData.response_text === "success") {
        Constants.showPersistentToastMessage("Your sell order has been placed. It will be available in the market place soon", this.toastCtrl);
        Constants.properties['selectedPair'] = Constants.WORKING_WALLET + " -> Naira";
        this.navCtrl.push('MyOrdersPage');
      } else {
        Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }

  async sellAll() {
    let fees = Constants.getCurrentWalletProperties();
    let balance = await this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    this.xendFees = +fees.xendFees * balance;

    Console.log("confirmedAccountBalance: " + balance);
    let canSend = balance - this.blockFees - this.xendFees;

    //Correct for rounding error
    canSend = canSend - 0.001;

    if (canSend < 0) {
      canSend = 0;
    }

    this.sellForm.controls.numberOfBTC.setValue(canSend);
    this.sellForm.controls.amountToRecieve.setValue(this.sellForm.value.pricePerBTC * this.sellForm.value.usdRate * canSend);
  }

  sellBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendBit",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then(async (_result: any) => {
        this.sellForm.controls.password.setValue(await this.ls.getItem("password"));
        this.sellBit();
      })
      .catch((error: any) => {
        Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  loadRate() {
    let fees = Constants.getCurrentWalletProperties();
    let tickerSymbol = fees.tickerSymbol;
    let url = Constants.GET_USD_RATE_URL + tickerSymbol;

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.result.buy;
      this.btcRate = responseData.result.rate;
      Constants.LAST_USD_RATE = this.btcRate;
      this.blockFees = +fees.blockFees / Constants.LAST_USD_RATE;
      this.btcToNgn = this.btcRate * this.usdRate;
      this.sellForm.controls.pricePerBTC.setValue(this.btcRate.toFixed(4));
      this.sellForm.controls.usdRate.setValue(this.usdRate.toFixed(4));
    }, error => {
      //doNothing
    });
  }

  async loadBalanceFromStorage() {
    let key = Constants.WORKING_WALLET + "Address";
    this.networkAddress = await this.ls.getItem(key);
    if (this.networkAddress !== null) {
      this.confirmedAccountBalance = await this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    }
  }

  clearForm() {
    //this.sellForm.controls.pricePerBTC.setValue("");
    this.sellForm.controls.numberOfBTC.setValue("");
    this.sellForm.controls.usdRate.setValue("");
    this.sellForm.controls.password.setValue("");
  }

  calculateHowMuchToRecieve() {
    let fees = Constants.getCurrentWalletProperties();
    this.rate = this.sellForm.value.pricePerBTC;
    let usdRate = this.sellForm.value.usdRate;
    let toSell = +this.sellForm.value.numberOfBTC;
    if (this.rate !== 0 && toSell !== 0) {
      let toRecieve = toSell * this.rate * usdRate;
      this.xendFees = toSell * +fees.xendFees;
      this.sellForm.controls.amountToRecieve.setValue(toRecieve.toFixed(3));
    }
  }
}
