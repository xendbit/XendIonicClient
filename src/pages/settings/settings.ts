import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { ToastController, Loading, LoadingController, NavController, NavParams, Platform, AlertController, IonicPage } from 'ionic-angular';

import { StorageService } from '../utils/storageservice';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  pageTitle: string;
  restoreWalletText: string;
  logoutText: string;
  showMnemonicText: string;
  updgradeAccountText: string;
  afterUpgradeWarningText: string;
  accountType;
  ls;
  loading: Loading;
  showMnemonicForm;
  passwordText: string;
  revealText: string;
  isAdvanced = false;
  isBeneficiary = false;
  canSwitchWallet = false;
  canLogout = true;

  constructor(public http: Http, public toastCtrl: ToastController, public formBuilder: FormBuilder, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public platform: Platform, public navCtrl: NavController, public navParams: NavParams) {
    this.showMnemonicForm = formBuilder.group({
      password: ['', Validators.required]
    });
    this.passwordText = "Wallet Password";
    this.pageTitle = "More...";
    this.restoreWalletText = Constants.properties['restore.wallet'];
    this.logoutText = "Logout";
    this.updgradeAccountText = "Upgrade Account";
    this.showMnemonicText = "Show my Passphrase";
    this.revealText = "Reveal";
    this.canSwitchWallet = Constants.properties['home'] !== undefined;
    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    this.accountType = StorageService.ACCOUNT_TYPE;
    this.isBeneficiary = StorageService.IS_BENEFICIARY;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad SettingsPage');
  }

  ionViewDidEnter() {
    Console.log('ionViewDidEnter SettingsPage');
    if (StorageService.ACCOUNT_TYPE === "ADVANCED") {
      this.isAdvanced = true;
    }
    this.canSwitchWallet = Constants.properties['home'] !== undefined;
    this.canLogout = !this.platform.is('ios');
    this.afterUpgradeWarningText = Constants.AFTER_UPGRADE_WARNING;
    this.accountType = StorageService.ACCOUNT_TYPE;
    this.isBeneficiary = StorageService.IS_BENEFICIARY;
  }

  switchWallet() {
    this.navCtrl.push('SwitchWalletPage');
  }

  logout() {
    if (Constants.AFTER_UPGRADE_WARNING !== "") {
      Constants.AFTER_UPGRADE_WARNING = "";
    }
    this.showConfirm();
  }

  becomeBeneficiary() {
    let postData = {
      password: this.ls.getItem("password"),
      emailAddress: this.ls.getItem("emailAddress"),
      beneficiary: true
    };

    let loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    this.http.post(Constants.BECOME_BENEFICIARY_URL, postData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(responseData => {
        loading.dismiss();
        if (responseData.result === "successfull") {
          StorageService.IS_BENEFICIARY = true;
          this.isBeneficiary = true;
          Constants.showLongerToastMessage("You are now a beneficiary, you will show up in donor searches.", this.toastCtrl);
        } else {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
        }
      }, error => {
        loading.dismiss();
        Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
      });

  }

  upgrade() {
    this.navCtrl.push('UpgradePage');
  }

  showMyInfo() {
    Console.log('Showing My Info Page');
    this.navCtrl.push('PersonalPage');
  }

  showMnemonic() {
    let bv = this.showMnemonicForm.value;
    let password = bv.password;
    if (password !== this.ls.getItem("password")) {
      Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
    } else {
      this.showMnemonicForm.controls.password.setValue("");
      let sm = this.ls.getItem('mnemonic').split(' ').splice(0, 12).join(' ');

      let alert = this.alertCtrl.create({
        title: "Your Passphrase",
        message: sm,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Logout?',
      message: 'Are you sure you want to logout? The App will quit.',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.ls.setItem("lastLoginTime", "");
            this.platform.exitApp();
          }
        }
      ]
    });
    confirm.present();
  }

}
