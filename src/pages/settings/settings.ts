// import { HDNode, script, address, crypto, TransactionBuilder } from 'bitcoinjs-lib';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { ToastController, Loading, LoadingController, NavController, NavParams, Platform, AlertController, IonicPage } from 'ionic-angular';

import { StorageService } from '../utils/storageservice';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
// import { mnemonicToSeed } from 'bip39';

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
  ls: StorageService;
  loading: Loading;
  showMnemonicForm;
  passwordText: string;
  revealText: string;
  isAdvanced = false;
  isBeneficiary = false;
  canSwitchWallet = false;
  canLogout = true;
  enable2fa = false;

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
    this.canSwitchWallet = Constants.properties['home'] !== null;
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
    //this.craftMultisig();
    this.enable2fa = this.ls.getItem("enable2FA");

    if (StorageService.ACCOUNT_TYPE === "ADVANCED") {
      this.isAdvanced = true;
    }
    this.canSwitchWallet = Constants.properties['home'] !== null;
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
      Constants.showPersistentToastMessage("Please enter a valid password.", this.toastCtrl);
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

  enable2FA() {
    this.ls.setItem('enable2FA', this.enable2fa);
  }

  // craftMultisig() {
  //   var hd = HDNode.fromSeedBuffer(mnemonicToSeed("carve whenever axle type repent smash eternity zippers chase narrate childhood effort zippers"), Constants.NETWORKS.BTCTEST).derivePath("m/0/0/0");
  //   let privKey1 = hd.keyPair;

  //   var hd2 = HDNode.fromSeedBuffer(mnemonicToSeed("place ashtray blush amnesty problems serve bemused neck reheat pig tremble upright ashtray"), Constants.NETWORKS.BTCTEST).derivePath("m/0/0/0");
  //   let privKey2 = hd2.keyPair;

  //   var hd3 = HDNode.fromSeedBuffer(mnemonicToSeed("jan feb mar apr may jun jul aug sep oct nov dec dec"), Constants.NETWORKS.BTCTEST).derivePath("m/0/0/0");
  //   let privKey3 = hd3.keyPair;

  //   var privKeys = [privKey1, privKey2, privKey3];
  //   var pubKeys = privKeys.map(function(privKey) {
  //     return privKey.getPublicKeyBuffer();
  //   });

  //   var witnessScript = script.multisig.output.encode(2, pubKeys);
  //   var witnessScriptHash = crypto.sha256(witnessScript);

  //   var redeemScript = script.witnessScriptHash.output.encode(witnessScriptHash);
  //   var redeemScriptHash = crypto.hash160(redeemScript)

  //   var scriptPubKey = script.scriptHash.output.encode(redeemScriptHash);
  //   var P2SHaddress = address.fromOutputScript(scriptPubKey, Constants.NETWORKS.BTCTEST);

  //   console.log(P2SHaddress)

  //   var txb = new TransactionBuilder(Constants.NETWORKS.BTCTEST)

  //   txb.addInput("65b6f3b76e003a99df21ab66ffb7801196a39c4f9928c35b22edcb206279d5d3", 0, null, scriptPubKey);
  //   txb.addInput("246b6859a969e3c406e167f72ff0b02e00c5576bfb0f69042317b997473dbe98", 0, null, scriptPubKey);


  //   txb.addOutput ("mqgSLgUyDSwPG387ePKKXSLMXnWKrxDur5", 94500000-1000);

  //   var tx = txb.buildIncomplete();
  //   var txhex = tx.toHex();

  //   console.log (txhex);

  //   var transvalue0=64000000;
  //   var transvalue1=30500000;

  //   txb.sign(0, privKeys[0], redeemScript, null, transvalue0, witnessScript);
  //   txb.sign(0, privKeys[1], redeemScript, null, transvalue0, witnessScript);

  //   txb.sign(1, privKeys[0], redeemScript, null, transvalue1, witnessScript);
  //   txb.sign(1, privKeys[1], redeemScript, null, transvalue1, witnessScript);

  // }
}
