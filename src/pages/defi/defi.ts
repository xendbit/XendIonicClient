import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { StorageService } from '../utils/storageservice';
import { Constants } from '../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController, IonicPage, ModalController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { Wallet } from '../utils/wallet';
import { TokenSearchPage } from '../token-search/token-search';
import { Clipboard } from '@ionic-native/clipboard';

/**
 * Generated class for the ExchangePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-defi',
  templateUrl: 'defi.html',
})
export class DefiPage {

  ls: StorageService;
  wallet: Wallet;
  defiType = 'SWAP';
  tokens;
  from;
  to;
  clipboard: Clipboard;
  amountIn;
  amountOut;
  password;

  loading: Loading;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
  ) {
    this.ls = Constants.storageService;
    this.wallet = Constants.WALLET;
    this.clipboard = new Clipboard();
    this.init();
  }

  ionViewWillEnter() {
    this.from = Constants.defiParams.from;
    this.to = Constants.defiParams.to;
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.from = Constants.defiParams.from;
    this.to = Constants.defiParams.to;
  }

  init() {
    this.from = Constants.defiParams.from;
    this.to = Constants.defiParams.to;
  }

  copyAddress(token) {
    this.clipboard.copy(token.address);
    let message = "Address copied";
    Constants.showToastMessage(message, this.toastCtrl);
  }

  estimatePrice() {
    this.getPrice();
  }

  getPrice() {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    const url = Constants.GET_PRICE_URL.replace(":from", this.from.address).replace(":to", this.to.address);
    this.http.get(url).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      const price = +responseData.data;
      this.amountOut = (+this.amountIn * price).toFixed(6);
    }, error => {
      this.loading.dismiss();
      let errorBody = JSON.parse(error._body);
      console.log(errorBody);
      this.amountOut = 0;
      Constants.showPersistentToastMessage("Insufficient Reserves for Token Pair", this.toastCtrl);
    });    
  }

  loadAllTokens() {
    const url = Constants.GET_TOKENS_URL;
    this.http.get(url).map(res => res.json()).subscribe(responseData => {
      this.tokens = responseData.data;
    }, error => {
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }

  confirmSwap() {
    let message = 'Are you sure you want to swap '
      + this.amountIn + this.from.symbol + ' to ' + this.to.symbol + '?';
    let alert = this.alertCtrl.create({
      title: 'Confirm Swap',
      message: message,
      buttons: [
        {
          text: 'Swap',
          handler: () => {
            this.swap();
          }
        },
        {
          text: "Don't Swap",
          role: 'cancel',
          handler: () => {
            //doNothing
          }
        }
      ]
    });
    alert.present();
  }

  swap() {
    if (+this.amountIn <= 0 || this.amountIn === undefined) {
      Constants.showPersistentToastMessage("Amount must be greater than 0", this.toastCtrl);
      return;
    }

    if (this.from.address === this.to.address) {
      Constants.showPersistentToastMessage("You can not swap a token to itself", this.toastCtrl);
      return;
    }

    const postData = {
      "emailAddress": this.ls.getItem("emailAddress"),
      "password": this.password,
      "fromAddress": this.from.address,
      "toAddress": this.to.address,
      "amountIn": this.amountIn
    }

    console.log(postData);

    const url = Constants.SWAP_TOKENS_URL;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.status === "success") {
        Constants.showPersistentToastMessage("Your SWAP is posted. You will get your tokens once it's confirmed", this.toastCtrl);
        this.from = undefined;
        this.to = undefined;
        this.amountIn = "";
        this.password = "";
      } else {
        Constants.showPersistentToastMessage(responseData.data, this.toastCtrl);
      }
    }, error => {
      console.log(error);
      this.loading.dismiss();
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }

  swapFingerprint() {
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendFi",
      clientSecret: "password", //Only necessary for Android
      disableBackup: true  //Only for Android(optional)
    })
      .then((_result: any) => {
        this.password = this.ls.getItem("password");
        this.swap();
      })
      .catch((error: any) => {
        Constants.showPersistentToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
      });
  }

  async openModal(param) {
    this.navCtrl.push(TokenSearchPage, { param: param });
  }
}