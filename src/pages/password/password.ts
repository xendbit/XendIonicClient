import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, ToastController, IonicPage } from 'ionic-angular';
import { Constants } from '../utils/constants';

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
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad PasswordPage');
  }

  isEnabled(val) {
    if (val === 'DEL' || val === 'CLS') {
      return false;
    } else {
      if(this.password.length === 6) {
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

  gotoNextPage() {
    Constants.registrationData['password'] = this.password;
    Constants.passwordPadSuccessCallback();
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
