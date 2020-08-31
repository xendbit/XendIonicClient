import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, ToastController, IonicPage } from 'ionic-angular';
import { Constants } from '../utils/constants';
import { StorageService } from '../utils/storageservice';

/*
  Generated class for the Pin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-password',
  templateUrl: 'password.html'
})
export class PasswordPage {

  allnumbers = [];
  password: string = "";
  confirmPassword;
  displayed: string = "";
  numbers = [];
  pageTitle: string;
  passwordWarningText: string;
  completeRegistrationText: string;
  enterPasswordText: string;
  importantNoticeText: string;
  disableButton: boolean = true;
  ls: StorageService;

  isBeneficiary = false;

  rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['DEL', '0', 'CLS']
  ]

  constructor(public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = "Enter Your PIN";
    this.passwordWarningText = "Please Select Your PIN.";
    this.completeRegistrationText = "Complete Registration";

    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad PasswordPage');
    this.isBeneficiary = Constants.otherData['is_beneficiary'];
  }

  isEnabled(val) {
    if (val === 'DEL' || val === 'CLS') {
      return false;
    } else {
      if (this.password.length === 6) {
        this.disableButton = false;
        return true;
      } else {
        this.disableButton = true;
      }
    }
  }

  clicked(val) {
    if (val === 'DEL') {
      if (this.password !== "") {
        this.password = this.password.substr(0, (this.password.length - 1));
      }
    } else if (val === 'CLS') {
      this.password = "";
    } else {
      this.password += val;
    }
  }

  registerBeneficiary() {
    Console.log("Register Clicked");
    Constants.registerBeneficiary();
  }

  saveBeneficiary() {
    let postData = Constants.registrationData;
    postData['password'] = this.password;

    let phone = postData['phoneNumber'];

    let app = this;

    app.ls.setItem('postData-' + phone, postData);

    this.navCtrl.popToRoot();

    Constants.showLongToastMessage("Beneficiary Data saved succeffully. It will be uploaded when you are connected to the internet", this.toastCtrl);
  }

  gotoNextPage() {
    Constants.registrationData['password'] = this.password;

    let rf = Constants.registrationData['rf'];

    let referralCode = rf.referralCode;

    if (referralCode === undefined || referralCode === null || referralCode === '') {
      referralCode = 'XENDBIT';
    }

    Constants.registrationData['email'] = rf.email;
    Constants.registrationData['phoneNumber'] = rf.phoneNumber;
    Constants.registrationData['surName'] = rf.surName;
    Constants.registrationData['firstName'] = rf.firstName;
    Constants.registrationData['middleName'] = rf.middleName;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['idType'] = rf.idType;
    Constants.registrationData['idNumber'] = rf.idNumber;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['dateOfBirth'] = "" + new Date(rf.dateOfBirth).getTime();
    Constants.registrationData['country'] = "";
    Constants.registrationData['enableWhatsapp'] = rf.enableWhatsapp;
    Constants.registrationData['referralCode'] = referralCode;
    if (rf.bank !== undefined && rf.bank !== "") {
      Constants.registrationData['bankCode'] = rf.bank;
    } else {
      Constants.registrationData['bankCode'] = "000";
    }
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['isBeneficiary'] = Constants.IS_LOGGED_IN;
    StorageService.IS_BENEFICIARY = rf.isBeneficiary;

    Constants.registerOnServer();
    //^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$
    // if (this.password !== this.confirmPassword) {
    //   Constants.showLongToastMessage("Passwords did not match", this.toastCtrl);
    // } else {
    //   let found = this.password.search(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
    //   if (found < 0) {
    //     Constants.showLongToastMessage("Please enter a valid password", this.toastCtrl);
    //   } else {
    //     Constants.registrationData['password'] = this.password;
    //     Constants.passwordPadSuccessCallback();
    //   }
    // }
  }
}
