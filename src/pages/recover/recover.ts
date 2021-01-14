import { Constants } from '../utils/constants';
import { Component } from '@angular/core';
import { Loading, LoadingController, ToastController, IonicPage, NavController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { Wallet } from '../utils/wallet';
import { StorageService } from '../utils/storageservice';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the BuyBitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recover',
  templateUrl: 'recover.html',
})
export class RecoverPage {
  loading: Loading;

  wallet: Wallet;
  ls: StorageService;
  private emailAddress: string;
  private password: string;
  private cpassword: string;
  private passphrase: string;

  constructor(public storage: Storage, public loadingCtrl: LoadingController, public http: Http, public toastCtrl: ToastController, public navCtrl: NavController) {
    this.wallet = Constants.WALLET;
    this.ls = new StorageService(storage);
    Constants.storageService = this.ls;
    setTimeout(function () {
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidLoad() {
  }

  ionViewDidLeave() {
  }

  ionViewDidEnter() {
    this.wallet = Constants.WALLET;
  }

  recoverWallet() {
    if (this.password !== this.cpassword) {
      Constants.showPersistentToastMessage("Password Mismatch", this.toastCtrl);
      return;
    }

    let requestData = {
      emailAddress: this.emailAddress,
      password: this.password,
      passphrase: this.passphrase
    };

    let url = Constants.RECOVER_URL;

    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    this.http.post(url, requestData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(responseData => {
        if (responseData.status === "success") {
          this.loading.dismiss();
          let user = responseData.data;
          Constants.LOGGED_IN_USER = user;
          let walletType = user['walletType'];
          this.ls.setItem("emailAddress", this.emailAddress);
          this.ls.setItem("password", this.password);
          this.ls.setItem("isRegistered", "true");

          this.ls.setItem("userId", user.id);
          this.ls.setItem('walletType', walletType);
          this.ls.setItem("lastLoginTime", new Date().getTime() + "");
          StorageService.ACCOUNT_TYPE = user.accountType;
          StorageService.IS_BENEFICIARY = user.beneficiary;
          this.ls.setItem("accountType", user.accountType);
          this.ls.setItem("userId", user.id);
          this.ls.setItem("ngncBalance", user.ngncBalance);

          try {
            this.ls.setItem("accountNumber", user.bankAccountNumber);
            this.ls.setItem("bankCode", user.bankCode);
          } catch (e) {
            console.log(e);
          }

          this.navCtrl.push(TabsPage);
        } else {
          this.loading.dismiss();
          Constants.showPersistentToastMessage(responseData.message, this.toastCtrl);
        }
      }, error => {
        this.loading.dismiss();
        let errorBody = JSON.parse(error._body);
        Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
      });
  }
}
