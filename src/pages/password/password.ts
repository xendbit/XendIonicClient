import { Component } from '@angular/core';
import {Console} from '../utils/console';
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
 password;
 displayed: string = "";
 numbers = [];
 pageTitle: string;
 passwordWarningText: string;
 completeRegistrationText: string;
 enterPasswordText: string;
 importantNoticeText: string;

  constructor(public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = "Enter Your Password";
    this.passwordWarningText = "Select Your Password. You need it for transactions. It will also be used to encrypt your Passphrase. So make sure you don't forget it. Make sure no one is watching. If your are restoring your wallet, make sure you use the password you used previously.";
    this.numbers = Constants.properties['password.page.numbers.pad'];
    this.completeRegistrationText = "Complete Registration";
    this.enterPasswordText = "Enter Your Password";
    this.importantNoticeText = Constants.properties['important.notice'];
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad PasswordPage');
  }

  gotoNextPage() {
    if (this.password !== undefined && this.password.length >= 6) {
      Constants.registrationData['password'] = this.password;
      Constants.passwordPadSuccessCallback();
    } else {
      Constants.showLongToastMessage("Please enter a valid password not less than 6 characters", this.toastCtrl);
    }
  }
}
