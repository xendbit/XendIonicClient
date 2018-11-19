import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, ToastController, IonicPage } from 'ionic-angular';
import { Constants } from '../utils/constants';

import { StorageService } from '../utils/storageservice';

/*
  Generated class for the GettingStarted page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-getting-started',
  templateUrl: 'getting-started.html'
})

export class GettingStartedPage {
  pageTitle: string;
  basicWalletText: string;
  canSendCoinsText: string;
  canNotConvertCashText: string;
  canNotConvertCoinsText: string;
  createBasicWalletText: string;
  advancedWalletText: string;
  canConvertCashText: string;
  canConvertCoinsText: string;
  createAdvancedWalletText: string;
  restoreText: string;
  restoreWalletText: string;
  doesNotRequireKYCText: string;
  requireKYCText: string;
  recoverText: string;
  walletType: string = 'trader';
  email = "";
  password = "";
  confirmPassword = "";
  showDetailsBasic = false;
  showDetailsAdvanced = false;
  detailsAdvanced = "Details...";
  detailsBasic = "Details...";
  isReset = false;
  passwordPlaceHolder = "Password";

  ls;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.pageTitle = "Select Account Type";
    this.restoreText = "Restore";
    this.restoreWalletText = "Restore Wallet";
    this.basicWalletText = "Basic Wallet";
    this.canSendCoinsText = "SEND, RECEIVE & TRANSFER COINS";
    this.canNotConvertCashText = "Can not convert cash to coins";
    this.canNotConvertCoinsText = "Can not convert coins to cash";
    this.createBasicWalletText = "Create Basic Wallet";
    this.advancedWalletText = "Advanced Wallet";
    this.canConvertCashText = "Can convert cash to coins";
    this.canConvertCoinsText = "Can convert coins to cash";
    this.createAdvancedWalletText = "Create Advanced Wallet";
    this.doesNotRequireKYCText = "Does not require KYC";
    this.requireKYCText = "Requires Full KYC Documents";
    this.recoverText = "RECOVER OR MIGRATE WALLET";
    this.ls = Constants.storageService;
  }

  ionViewWillEnter() {
    this.isReset = this.navParams.get('type') === 'resetPassword';
    if (this.isReset) {
      this.passwordPlaceHolder = "New Password";
    }
  }

  toggleShowDetailsAdvanced() {
    this.showDetailsAdvanced = !this.showDetailsAdvanced;
    this.detailsAdvanced = this.showDetailsAdvanced ? "Hide" : "Details...";
  }

  toggleShowDetailsBasic() {
    this.showDetailsBasic = !this.showDetailsBasic;
    this.detailsBasic = this.showDetailsBasic ? "Hide" : "Details...";
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad GettingStartedPage');
  }

  openBasicWallet() {
    Constants.registrationData['walletType'] = this.walletType;
    StorageService.ACCOUNT_TYPE = "BASIC";
    StorageService.IS_BENEFICIARY = false;
    this.ls.setItem("accountType", "BASIC");
    this.navCtrl.push('WarningPage');
  }

  openAdvancedWallet() {
    Constants.registrationData['walletType'] = this.walletType;
    StorageService.ACCOUNT_TYPE = "ADVANCED";
    StorageService.IS_BENEFICIARY = false;
    this.ls.setItem("accountType", "ADVANCED");
    this.navCtrl.push('WarningPage');
  }

  restoreWallet() {
    let data = {
      mnemonic: '',
      type: 'resetPassword',
      'email': this.email,
      'shouldRegister': 'false',
      'password': this.password
    };
    if (this.email === '') {
      Constants.showLongerToastMessage('Please enter your email address', this.toastCtrl);
      return;
    } else if (this.password === '') {
      Constants.showLongerToastMessage('Please enter your password', this.toastCtrl);
      return;
    } else if (this.isReset) {

      if (this.password !== this.confirmPassword) {
        Constants.showLongerToastMessage('Passwords did not match', this.toastCtrl);
        return;
      }

      this.navCtrl.push('ConfirmMnemonicPage', data);

    } else {
      data = {
        mnemonic: '',
        type: 'restore',
        'email': this.email,
        'shouldRegister': 'false',
        'password': this.password
      };      
      this.navCtrl.push('ConfirmMnemonicPage', data);
    }
  }
}
