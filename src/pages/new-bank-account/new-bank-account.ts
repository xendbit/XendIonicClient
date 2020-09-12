import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { IonicPage, NavController, NavParams, ToastController, Loading, LoadingController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';


/**
 * Generated class for the NewBankAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-bank-account',
  templateUrl: 'new-bank-account.html',
})
export class NewBankAccountPage {

  newBankAccountForm: FormGroup;
  loading: Loading;
  banks = [];
  bankData = {};
  storedAccountNumber = undefined;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public http: Http, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.newBankAccountForm = this.formBuilder.group({
      lastName: ['', Validators.compose([Validators.minLength(3), Validators.required])],
      firstName: ['', Validators.compose([Validators.minLength(3), Validators.required])],
      middleName: [''],
      bvn: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      bank: ['', Validators.compose([Validators.required])],
    });

    this.banks = Constants.properties['banks'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewBankAccountPage');
  }

  ionViewWillEnter() {
    this.bankData = Constants.registrationData;
    console.log(this.bankData);
    this.newBankAccountForm.controls.lastName.setValue(this.bankData['lastName']);
    this.newBankAccountForm.controls.firstName.setValue(this.bankData['firstName']);
    this.newBankAccountForm.controls.middleName.setValue(this.bankData['middleName']);
    this.newBankAccountForm.controls.bvn.setValue(this.bankData['bvn']);
    this.newBankAccountForm.controls.bank.setValue(this.bankData['bank']);
    this.storedAccountNumber = this.bankData['accountNumber'];
  }

  showAccountNumber(accountNumber) {
    const alert = this.alertCtrl.create({
      title: 'Your Account Number is: ' + accountNumber,
      subTitle: '',
      buttons: ['Continue']
    });
    alert.present();
  }

  showError() {
    const alert = this.alertCtrl.create({
      title: 'New Account Creation',
      subTitle: 'The account number will be created soon. You can continue the registration while this is been done',
      buttons: ['Continue']
    });
    alert.present();
  }

  createAccount() {
    if (!this.newBankAccountForm.valid) {
      Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
      return false;
    }

    let rf = this.newBankAccountForm.value;
    let postData = {};
    postData['firstName'] = rf.firstName;
    postData['lastName'] = rf.lastName;
    postData['middleName'] = rf.middleName;
    postData['bvn'] = rf.bvn;
    postData['bank'] = rf.bank;
    postData['accountNumber'] = this.storedAccountNumber;

    Constants.registrationData = postData;

    if (this.storedAccountNumber === undefined || this.storedAccountNumber === '') {
      // call the server
      console.log(postData);
      let url = Constants.NEW_BANK_ACCOUNT_URL;

      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please wait...");
      this.http.post(url, postData, Constants.getWalletHeader("NGNC")).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        if (responseData.response_text === 'error') {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
          return;
        }

        if (responseData.response_text === 'success') {
          this.newBankAccountForm.reset();
          Constants.showLongerToastMessage("Account Creation Successful.", this.toastCtrl);
          //show the account number
          let accountNumber = responseData.result;
          if (accountNumber !== "0000000000") {
            this.showAccountNumber(accountNumber);
          } else {
            this.showError();
          }
        }
      }, error => {
        this.loading.dismiss();
        Constants.showLongerToastMessage(error, this.toastCtrl);
      });
    } else {
      this.showAccountNumber(this.storedAccountNumber);
    }
  }

}
