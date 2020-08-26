import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

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
  distributorCode = '';
  ls;
  manufacturers = undefined;
  manufacturerId = undefined;

  constructor(public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.ls = Constants.storageService;
    let app = this;
    setTimeout(() => {
      app.loadSettings();
    }, 2000);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetupPage');
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter SetupPage");
  }

  loadSettings() {
    Console.log(Constants.SETTINGS_URL);
    this.http.get(Constants.SETTINGS_URL).map(res => res.json()).subscribe(data => {
      Console.log("Settings loaded successfully");
      Constants.properties = data;
      this.manufacturers = Constants.properties['manufacturers'];
    }, _error => {
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      Console.log("Can not pull data from server");
      //this.platform.exitApp();
    });
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
    if (this.distributorCode === '' || this.distributorCode === undefined || this.distributorCode === null) {
      Constants.showLongToastMessage('Please enter your distributor code, you can get one at www.xendcredit.com', this.toastCtrl);
      return;
    }

    if (this.manufacturerId === undefined) {
      Constants.showLongToastMessage('Please select a manufacturer.', this.toastCtrl);
      return;
    }

    this.ls.setItem('distributorCode', this.distributorCode);
    this.ls.setItem('manufacturerId', this.manufacturerId);
    this.navCtrl.push("ProductsPage");
  }

  selectLoginType(type) {
    Console.log(type);
    console.dir(this.ls);
    this.type = type;
    if (type === 'agent') {
      this.typeIsAgent = true;
      this.typeIsPOS = false;
    } else if (type === 'pos') {
      this.typeIsAgent = false;
      this.typeIsPOS = true;
    }

    this.ls.setItem('login-type', type);
  }
}
