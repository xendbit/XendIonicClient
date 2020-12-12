import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ActionSheetController, AlertController, IonicPage, Loading } from 'ionic-angular';
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
  selector: 'page-ngnc',
  templateUrl: 'ngnc.html',
})
export class NgncPage {
  accountAction = "fund";
  user;
  amountToWithdraw = 0;
  password;
  ls: StorageService;
  loading: Loading;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
    this.user = Constants.LOGGED_IN_USER;
    this.ls = Constants.storageService;
  }

  ionViewDidEnter() {
    this.accountAction = Constants.NGNC_ACTION;
  }

  withdraw() {
    if(this.amountToWithdraw <= 0) {
      Constants.showPersistentToastMessage("Please enter the amount to withdrawal", this.toastCtrl);
      return;
    }

    let postData = {
      btcValue: this.amountToWithdraw,
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.password,
    }

    let url = Constants.WITHDRAW_NGNC_URL;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.response_text === "success") {
        this.amountToWithdraw = 0;
        this.password = "";
        Constants.showPersistentToastMessage("Your withdrawal request has been successfully sent", this.toastCtrl);
      } else {
        Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
      }
    }, _error => {
      this.loading.dismiss();
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
    });
  }
}
