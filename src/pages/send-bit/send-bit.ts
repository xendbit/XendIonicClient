import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { AlertController, IonicPage, Loading, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { StorageService } from '../utils/storageservice';
import { Wallet } from '../utils/wallet';
import { Constants } from './../utils/constants';


/*
  Generated class for the SendBit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-send-bit',
  templateUrl: 'send-bit.html'
})
export class SendBitPage {

  sendBitForm;
  ls: StorageService;
  loading: Loading
  toBitcoinAddress: string;
  useFingerprint: boolean = false;

  pageTitle: string;
  sendBitWarningText: string;
  amountToSendText: string;
  bitcoinAddressText: string;
  scanCodeText: string;
  passwordText: string;
  sendBitText: string;
  btcText: string;
  howMuchCanISendText: string;
  hmcisWarning: string;
  currencyText: string;
  disableButton = false;
  sliderValue = 5;

  usdRate: number = 0;
  usdToNgnRate: number = 0;
  btcToNgn = 0;

  wallet: Wallet;

  xendFees = 0;

  constructor(private barcodeScanner: BarcodeScanner, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public toastCtrl: ToastController) {
    this.sendBitForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      networkAddress: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    this.wallet = Constants.WALLET;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidEnter() {
    this.loadRate();
    this.pageTitle = "Xend Bit";
    this.sendBitWarningText = "Please make sure the bitcoin address you will enter below is correct. Once you send your bits, the transaction can not be reversed.";
    this.amountToSendText = "Amount to Send";
    this.bitcoinAddressText = "Bitcoin Address";
    this.scanCodeText = "Scan Address";
    this.passwordText = "Password";
    this.sendBitText = "Xend Bit";
    this.btcText = "BTC";
    this.howMuchCanISendText = "How much can I send?";
    this.hmcisWarning = "This is only an optimistic estimate depending on how much the block fee is, your charges may be less or more than we estimated.";

    this.btcText = this.wallet.chain;
    this.currencyText = this.wallet.chain;
    this.sendBitWarningText = this.sendBitWarningText.replace('bitcoin', this.currencyText)
    this.bitcoinAddressText = this.bitcoinAddressText.replace('Bitcoin', this.currencyText);
  }


  ionViewDidLoad() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.isAvailable().then(result => {
      this.useFingerprint = true;
    }, error => {
      this.useFingerprint = false;
      //doNothing
    });    
  }

  sendBitFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendFi",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then((_result: any) => {
        this.sendBitForm.controls.password.setValue(this.ls.getItem("password"));
        this.sendBit();
      })
      .catch((error: any) => {
        //doNothing
        Constants.showPersistentToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  howMuchCanISend() {
    let balance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");

    let xendFees = balance * this.wallet.fees.percXendFees;
    let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
    let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
    if (xendFees < minxfInTokens) {
      xendFees = minxfInTokens
    }

    if(xendFees > maxfInTokens) {
      xendFees = maxfInTokens;
    }

    let blockFees = this.wallet.fees.minBlockFees * this.sliderValue;    
    let canSend = balance - blockFees - xendFees;
    console.log(xendFees);
    console.log(blockFees);
    console.log(balance);
    console.log(canSend );

    console.log("Fees Chain: " + this.wallet.fees.feesChain);
    if(this.wallet.fees.feesChain !== null) {
      canSend = balance;
    }

    //Correct for rounding error
    //canSend = canSend - 0.00015;

    if (canSend < 0) {
      canSend = 0;
    }    

    Constants.showAlert(this.toastCtrl, this.howMuchCanISendText, "You can send " + canSend.toFixed(7) + " " + Constants.WORKING_WALLET);
  }

  loadRate() {
    let tickerSymbol = this.wallet.tickerSymbol
    let url = Constants.GET_USD_RATE_URL + tickerSymbol + "/BUY";

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.usdRate = responseData.data.usdRate;
      this.btcToNgn = responseData.data.ngnRate;
      this.usdToNgnRate = this.btcToNgn / this.usdRate;
      this.howMuchCanISend();
    }, _error => {
      //doNothing
    });
  }  


  confirmSend() {
    let bv = this.sendBitForm.value;

    let amountToSend = +bv.amount;    

      let message = 'Are you sure you want to send '
        + amountToSend + ' ' + Constants.WORKING_WALLET + ' '
        + 'to ' + bv.networkAddress + '?';

      let alert = this.alertCtrl.create({
        title: 'Confirm Send',
        message: message,
        buttons: [
          {
            text: 'Send',
            handler: () => {
              this.continue();
            }
          },
          {
            text: "Don't Send",
            role: 'cancel',
            handler: () => {
              //doNothing
            }
          }
        ]
      });
      alert.present();
  }  

  sendBit() {
    this.confirmSend();
  }

  continue() {
    let isValid = false;
    let bv = this.sendBitForm.value;
    let amountToSend = +bv.amount;
    let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
    let password = bv.password;
    let toBitcoinAddress = bv.networkAddress;

    let invalidAddressMessage = "Invalid Coin Address detected".replace("Coin", this.currencyText);

    let blockFees = this.wallet.fees.minBlockFees * this.sliderValue;

    let xendFees = amountToSend * this.wallet.fees.percXendFees;
    let minxfInTokens = this.wallet.fees.minXendFees / this.usdRate;
    let maxfInTokens = this.wallet.fees.maxXendFees / this.usdRate;
    if (xendFees < minxfInTokens) {
      xendFees = minxfInTokens
    }

    if(xendFees > maxfInTokens) {
      xendFees = maxfInTokens;
    }

    console.log(balance);
    console.log(amountToSend);
    console.log(xendFees);
    console.log(blockFees);

    let plusFees = amountToSend + blockFees + xendFees;
    if(this.wallet.fees.feesChain !== null) {
      plusFees = amountToSend;
    }

    if (amountToSend === 0) {
      Constants.showPersistentToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (amountToSend + blockFees + xendFees > balance) {
      Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
    } else if (toBitcoinAddress === '') {
      Constants.showPersistentToastMessage(invalidAddressMessage, this.toastCtrl);
    } else if (password !== this.ls.getItem("password")) {
      Constants.showPersistentToastMessage("Please enter a valid password.", this.toastCtrl);
    } else if (this.sendBitForm.valid) {
      isValid = true;
    }

    if (isValid) {
      let data = {};
      data['amountToSend'] = amountToSend
      data['buyerToAddress'] = toBitcoinAddress;
      data['blockFees'] = blockFees;
      data['xendFees'] = xendFees;
      data['emailAddress'] = this.ls.getItem("emailAddress");
      data['password'] = this.ls.getItem("password");
      data['fromCoin'] = this.wallet.chain;
      this.disableButton = false;
      this.sendCoins(data);
    }    
  }

  sendCoins(data) {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let url = Constants.SEND_COINS_URL

    this.http.post(url, data, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.status === "success") {
        this.sendCoinsSuccess();
      } else {
        Constants.showPersistentToastMessage('Error Sending Coin: ' + responseData.message, this.toastCtrl);
        this.sendCoinsError();
      }
    }, error => {
      this.loading.dismiss();
      const eb = JSON.parse(error._body);
      Constants.showPersistentToastMessage("Error: " + eb.error, this.toastCtrl);
    });
  }

  sendCoinsSuccess() {
    this.disableButton = false;
    this.sendBitForm.reset();

    Constants.showPersistentToastMessage("Your tokens have been sent. Recipient will recieve them once it's confirmed", this.toastCtrl);
    this.navCtrl.pop();
  }

  sendCoinsError() {
    this.disableButton = false;
  }


  scanCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        Constants.showPersistentToastMessage('Barcode scanner cancelled', this.toastCtrl);
      } else {
        this.sendBitForm.controls.networkAddress.setValue(barcodeData.text);
      }
    }, (_err) => {
      Constants.showPersistentToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }
}
