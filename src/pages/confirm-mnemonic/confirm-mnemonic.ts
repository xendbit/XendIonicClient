import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { ActionSheetController, NavController, NavParams, ToastController, Loading, LoadingController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

import { StorageService } from '../utils/storageservice';
/*
  Generated class for the CreateMnemonic page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-confirm-mnemonic',
  templateUrl: 'confirm-mnemonic.html'
})
export class ConfirmMnemonicPage {

  passphrase: string;
  confirmMnemonic = "";
  shouldRegister: string;
  buttonText: string;
  description: string;

  wallet: any;
  isRestore = false;
  isNew = false;
  isUpgrade = false;
  loading: Loading;
  email: string;
  ls: StorageService;

  pageTitle: string;
  createWalletText: string;
  restorWalletText: string;
  mnemonicArray = [];
  disableButton = false;

  FB_APP_ID: number = 1900836276861220;

  constructor( public actionSheetCtrl: ActionSheetController, public http: Http, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = "Confirm The Passphrase";
    this.email = navParams.get('email');
    this.passphrase = navParams.get('mnemonic');
    let splitted = this.passphrase.split(" ");

    let pushed = [];
    while (true) {
      let x = Math.ceil(Math.random() * 12) - 1;
      if (x < 12 && pushed.indexOf(x) < 0) {
        this.mnemonicArray.push(splitted[x]);
        pushed.push(x);
      }

      if (pushed.length === 12) {
        break;
      }
    }

    this.shouldRegister = navParams.get("shouldRegister");
    this.isRestore = navParams.get("type") == "restore";
    this.isUpgrade = navParams.get("type") == "upgrade";
    this.isNew = navParams.get("type") == "new";
    this.ls = Constants.storageService;

    if (this.shouldRegister === 'true') {
      this.buttonText = "Create Wallet";
      this.description = "Let's confirm you have written down your Passphrase correctly. Please click the words in the order they were shown on the previous page.";
    } else {
      this.buttonText = "Restore Wallet";
      this.description = "Enter the Passphrase you were asked to write down during initial configuration/registration.";
    }

    if (this.isUpgrade) {
      this.buttonText = "Upgrade Account";
    }
  }

  disableAndSave(ma) {
    this.confirmMnemonic += ma + " ";
  }

  isEnabled(ma) {
    return this.confirmMnemonic.split(" ").indexOf(ma) < 0;
  }

  ionViewDidEnter() {
    this.disableButton = false;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad ConfirmMnemonicPage');
  }

  createWallet() {
    this.confirmMnemonic = this.confirmMnemonic.toLowerCase().trim();

    if (this.isRestore) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
      let postData = {
        passphrase: this.confirmMnemonic
      };

      this.http.post(Constants.GET_13TH_WORD, postData, Constants.getHeader()).map(res => res.json()).subscribe(
        responseData => {
          this.loading.dismiss();
          if (responseData.response_code == 0) {
            this.ls.clear();
            let lastWord = responseData.result;
            this.passphrase = this.confirmMnemonic + " " + lastWord;
            this.ls.setItem('mnemonic', this.passphrase);

            Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "BTC");
            Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "LTC");
            Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "BTCTEST");
            Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "LTCTEST");            
            Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'XND');
            Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'NXT');
            Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'ARDR');
            Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'IGNIS');
            Constants.tokenWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "NGNT");
            Constants.ethWallet(this.ls);

            this.ls.setItem('emailAddress', this.email);
            Constants.showLongToastMessage("Restore Successful. Now login", this.toastCtrl);
            this.navCtrl.push('LoginPage');
          } else {
            throw (responseData.response_text);
          }
        },
        error => {
          this.loading.dismiss();
          throw (error);
        }
      );
    } else {
      this.ls.clear();
      this.ls.setItem('mnemonic', this.passphrase);

      Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "BTC");
      Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "LTC");
      Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "BTCTEST");
      Constants.btcWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "LTCTEST");
      Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'XND');
      Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'NXT');
      Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'ARDR');
      Constants.xndWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, 'IGNIS');            
      Constants.tokenWallet(this.ls, this.loading, this.loadingCtrl, this.http, this.toastCtrl, "NGNT");
      Constants.ethWallet(this.ls);

      if (this.isRestore) {
        return;
      } else {
        Constants.registrationData['loadingCtrl'] = this.loadingCtrl;
        Constants.registrationData['isRestore'] = this.isRestore;
        Constants.registrationData['isNew'] = this.isNew;
        Constants.registrationData['isUpgrade'] = this.isUpgrade;
        Constants.registrationData['http'] = this.http;
        Constants.registrationData['ls'] = this.ls;
        Constants.registrationData['toastCtrl'] = this.toastCtrl;
        Constants.registrationData['obv'] = Observable;
        Constants.registrationData['navCtrl'] = this.navCtrl;
        Constants.registrationData['passwordPadSuccess'] = this.passwordPadSuccess;

        let url = Constants.RESTORE_USER_URL;
        if (this.isNew) {
          url = Constants.NEW_USER_URL;
        }

        Constants.registrationData['url'] = url;

        let minus13thWord = this.passphrase.split(" ").splice(0, 12).join(' ');

        if (this.isRestore) {
          //this.getAccountType();
          //do nothing the code will never get here.
        } else {
          if (this.confirmMnemonic === undefined) {
            Constants.showLongToastMessage("Type the Passphrase shown on the previous page", this.toastCtrl);
            return;
          } else if (minus13thWord !== this.confirmMnemonic) {
            Constants.showLongToastMessage("The Passphrase don't match", this.toastCtrl);
            this.confirmMnemonic = "";
            return;
          }

          Constants.registrationData['mnemonic'] = this.passphrase;
          this.presentActionSheet();
        }
      }
    }
  }

  passwordPadSuccess() {
    Constants.registrationData['tp'] = 'LoginPage';
    Constants.registrationData['idImage'] = "";
    Constants.registrationData['phoneNumber'] = "";
    Constants.registrationData['password'] = "password";
    Constants.registrationData['bvn'] = "";
    Constants.registrationData['idType'] = "";
    Constants.registrationData['idNumber'] = "";

    let loading = Constants.showLoading(Constants.registrationData['loading'], Constants.registrationData['loadingCtrl'], "Please Wait...");
    Constants.registrationData['loading'] = loading;
    Constants.registerOnServer();
  }

  presentActionSheet() {
    this.disableButton = true;
    this.navCtrl.push('RegisterPage', { "mnemonic": this.confirmMnemonic, "type": "new" });
  }
}