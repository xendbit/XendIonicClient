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
  password;
  confirmPassword;
  displayed: string = "";
  numbers = [];
  pageTitle: string;
  passwordWarningText: string;
  completeRegistrationText: string;
  enterPasswordText: string;
  importantNoticeText: string;

  constructor(public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = "Enter Your Password";
    this.passwordWarningText = "Select Your Password. You need it for transactions. It will also be used to encrypt your Passphrase. So make sure you don't forget it. Make sure no one is watching.";
    this.numbers = Constants.properties['password.page.numbers.pad'];
    this.completeRegistrationText = "Complete Registration";
    this.enterPasswordText = "Enter Your Password";
    this.importantNoticeText = Constants.properties['important.notice'];
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad PasswordPage');
  }

  gotoNextPage() {
    //^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$
    if (this.password !== this.confirmPassword) {
      Console.log("Passwords don't match");
      Constants.showPersistentToastMessage("Passwords did not match", this.toastCtrl);
    } else {
      let found = this.password.search(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
      if (found < 0) {
        Console.log("Passwords invalid");
        Constants.showPersistentToastMessage("Please enter a valid password", this.toastCtrl);
      } else {
        Console.log("Password is OK");
        Constants.registrationData['password'] = this.password;
        Constants.passwordPadSuccessCallback();
      }
    }
  }
}
