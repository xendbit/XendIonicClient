import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { IonicPage, NavController, NavParams, ToastController, Loading, LoadingController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


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
  ls: StorageService;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public http: Http, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.newBankAccountForm = this.formBuilder.group({
      lastName: ['', Validators.compose([Validators.minLength(3), Validators.required])],
      firstName: ['', Validators.compose([Validators.minLength(3), Validators.required])],
      middleName: [''],
      bvn: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      bank: ['', Validators.compose([Validators.required])],
    });

    this.banks = Constants.properties['banks'];
    this.ls = Constants.storageService;
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

  showError(message) {
    const alert = this.alertCtrl.create({
      title: 'New Account Creation Error',
      subTitle: message,
      buttons: ['OK']
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
      let headers = Constants.getWalletHeader("NGNC").headers;
      headers.append("agent_account_number", this.ls.getItem("bankAccountNumber"));

      this.http.post(url, postData, {headers: headers}).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        if (responseData.response_text === 'error') {
          this.showError(responseData.result);
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
            this.showError('Can not create account at this time. Please try again laters');
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
