import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the SetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html',
})
export class SetupPage {

  typeIsAgent = false;
  typeIsPOS = false;
  type = '';
  merchantCode = '';
  ls;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetupPage');
  }

  register() {
    Constants.REG_TYPE = 'register';
    //this.navCtrl.push('RegisterPaginated');
    this.navCtrl.push('TermsPage');
  }

  openLogin() {
    this.navCtrl.push("LoginPage");
  }

  pos() {
    if(this.merchantCode === '' || this.merchantCode === undefined || this.merchantCode === null) {
      Constants.showLongToastMessage('Please enter your merchant code, you can get one at www.xendcredit.com', this.toastCtrl);
    } else {
      this.ls.setItem('merchantCode', this.merchantCode);
      this.navCtrl.push("SendBitPage");
    }
  }

  selectLoginType(type) {
    Console.log(type);
    console.dir(this.ls);
    this.type = type;
    if(type === 'agent') {
      this.typeIsAgent = true;
      this.typeIsPOS = false;
    } else if(type === 'pos') {
      this.typeIsAgent = false;
      this.typeIsPOS = true;
    }

    this.ls.setItem('login-type', type);
  }
}
