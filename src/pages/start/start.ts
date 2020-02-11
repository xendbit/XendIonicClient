import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { Platform, AlertController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Constants } from '../utils/constants';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { StorageService } from '../utils/storageservice';


/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-start',
  templateUrl: 'start.html'
})

export class StartPage {

  //public loading: Loading;
  pageTitle: string;
  ss: StorageService;
  appVersion: string;
  userType = "agent"

  constructor(public storage: Storage, public alertCtrl: AlertController, public platform: Platform, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.ss = new StorageService(storage);
    Constants.storageService = this.ss;
  }

  ionViewDidLoad() {
    this.appVersion = Constants.APP_VERSION;
    Console.log('ionViewDidLoad StartPage');
  }

  ionViewDidEnter() {
    this.loadSettings();
  }

  pos() {
    this.navCtrl.push("SendBitPage");
  }

  register() {
    Constants.REG_TYPE = 'register';
    this.navCtrl.push('TermsPage');
  }

  recover() {
    Constants.REG_TYPE = 'recover';
    this.navCtrl.push('TermsPage');
  }

  openLogin() {
    this.navCtrl.push("LoginPage");
    //this.navCtrl.push("RegisterPage");
  }

  loadSettings() {
    Console.log(Constants.SETTINGS_URL);
    this.http.get(Constants.SETTINGS_URL).map(res => res.json()).subscribe(data => {
      Constants.properties = data;
    }, _error => {
      Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      Console.log("Can not pull data from server");
      //this.platform.exitApp();
    });
  }
}
