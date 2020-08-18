import { Console } from './../utils/console';
import { Http } from '@angular/http';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { FormBuilder, Validators } from "@angular/forms";
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Loading, ToastController, LoadingController, AlertController } from "ionic-angular";
import 'rxjs/add/operator/map';

/**
 * Generated class for the CollectPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collect-payment',
  templateUrl: 'collect-payment.html',
})

export class CollectPaymentPage {
  collectPaymentForm;
  ls: StorageService;
  loading: Loading;

  constructor(public formBuilder: FormBuilder, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public http: Http, public alertCtrl: AlertController) {
    this.collectPaymentForm = this.formBuilder.group({
      amount: ['', Validators.required],
      userCode: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectPaymentPage');
  }

  sendPayment() {
    let isValid = false;
    let bv = this.collectPaymentForm.value;
    let amountToSend = +bv.amount;
    let password = bv.password;
    let userCode = bv.userCode;

    if (amountToSend === 0) {
      Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
    } else if (this.collectPaymentForm.valid) {
      isValid = true;
    }

    if (isValid) {
      let postData = {};
      postData['btcValue'] = amountToSend;
      postData['password'] = password;
      postData['userCode'] = userCode;
      postData['emailAddress'] = this.ls.getItem("emailAddress");

      let url = Constants.REPAY_LOAN_URL;
      Console.log(url);

      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");

      this.http.post(url, postData, Constants.getWalletHeader("NGNC")).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        Console.log(responseData);
        if (responseData.response_text === 'error') {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
          return;
        }

        if (responseData.response_text === 'success') {
          Constants.showLongerToastMessage("Transaction Successful.", this.toastCtrl);
          this.collectPaymentForm.reset();
          return;
        }
      }, error => {
        this.loading.dismiss();
        Constants.showLongerToastMessage(error, this.toastCtrl);
      });
    }
  }
}
