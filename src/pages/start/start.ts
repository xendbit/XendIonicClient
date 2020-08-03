import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { Platform, AlertController, NavController, NavParams, ToastController, Loading, LoadingController } from 'ionic-angular';
import { Constants } from '../utils/constants';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { StorageService } from '../utils/storageservice';
import { Observable } from 'rxjs/Rx';

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
  userType = "agent";
  loading: Loading;

  constructor(public loadingCtrl: LoadingController, public storage: Storage, public alertCtrl: AlertController, public platform: Platform, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.ss = new StorageService(storage);
    Constants.storageService = this.ss;
  }

  ionViewDidLoad() {
    let otherData = {};
    otherData['loading'] = this.loading;
    otherData['loadingCtrl'] = this.loadingCtrl;
    otherData['http'] = this.http;
    otherData['ls'] = Constants.storageService;
    otherData['toastCtrl'] = this.toastCtrl;
    otherData['obv'] = Observable;
    otherData['navCtrl'] = this.navCtrl;

    this.appVersion = Constants.APP_VERSION;
    Console.log('ionViewDidLoad StartPage');
    let app = this;
    setInterval(() => {
      console.dir(app.ss);
      let keys = app.ss.postDataKeys();
      Console.log("Keys: " + keys);
      if (keys !== undefined) {
        for (let key of keys) {
          let postData = app.ss.getItem(key);
          Console.log(postData);
          if (postData === null || postData === undefined) {
            app.ss.setItem('keys', keys);
          } else {
            Console.log("Calling Register on " + key);
            Constants.registerSaved(app.ss, postData, otherData, key);
          }
        }
      }
    }, 5000);
  }

  ionViewDidEnter() {
    this.loadSettings();
  }

  pos() {
    this.navCtrl.push("SendBitPage");
  }

  register() {
    Constants.REG_TYPE = 'register';
    //this.navCtrl.push('RegisterPaginated');
    this.navCtrl.push('TermsPage');
  }

  recover() {
    Constants.REG_TYPE = 'recover';
    this.navCtrl.push('TermsPage');
  }

  openLogin() {
    this.navCtrl.push("LoginPage");
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




//'{"dummy":1,"mnemonic":"V0dwdWJiR1ZsWTJnZ2JXRnpheUJ3YkdsbGNuTWdaR1ZvZVdSeVlYUmxJR0psWVcwZ1kyRnlkbVVnYW1GamEyVjBjeUIzWldWclpHRjVJR0ZpYjNWMElHUnlaV0ZrSUhOM2IzSmtJSFpsY25rZ1lXSnZkWFE9dFdRPT0=","ETHAddress":"0x8257181ee47a68f9e9d338222762f2ea3fceeeb0","ETHPassphrase":"Je17HUgleTtL48ZcyPZVOB17sv224bDzuDC5FIlKcBhyY1s2kaSVl46enRkv/xjNauY81CdpDtzSeW9NrP4Iul9bYcmzSfoH50dgPSDDgSLoclIn/ZnBNm/5+lbGmzNV","ETHWIF":"5TM8zIUZ0EXCTxK5FoTB50ZTjjYtwcfW7vyVH8lx+RRjsKc/iOx2R68poatgc4XMsfxh7XN8ODceCmwaYwnN9XluTxOvBoP/Aa3lCjcLzuQ=","emailAddress":"agent@one.com","password":"YVdWemRNVEF3TVRFdzBVUT09","isRegistered":"true","isGuest":false,"walletType":null,"lastLoginTime":"1596322346870","accountType":"ADVANCED","exchangeType":"exchange","accountNumber":"0109998058","bankCode":"058","ETHTESTAddress":"0x8257181ee47a68f9e9d338222762f2ea3fceeeb0","ETHconfirmedAccountBalance":0,"08089370111":{"firstName":"first","lastName":"last","middleName":"","phoneNumber":"08089370111","gender":"male","dateOfBirth":270777600000,"address":"Lagos","disabilityType":"","disabilitySubtype":"","state":"Edo","lga":"Ovia South-West","association":"Lagos","gpsCoordinates":"undefined,undefined","tradeType":"7","tradeSubtype":"7010","accountName":"1011001","accountNumber":"0109998058","bank":"058","bvn":"10102929384","nokFirstName":"first","nokLastName":"last","nokPhoneNumber":"08089","guarantorFirstName":"first","guarantorLastName":"last","guarantorPhoneNumber":"08089","idType":"International Passport","idNumber":"1011001","idExpiry":1596240000000,"passphrase":"faint mutter pattern estate mama march linen gnaw lynx unseen deeply erase","dateRegistered":1596321771963,"agentEmail":"agent@one.com"},"keys":["07062022486","08089370111","08089370313",""],"07062022486":{"firstName":"first","lastName":"last","middleName":"","phoneNumber":"07062022486","gender":"male","dateOfBirth":523238400000,"address":"Lagos","disabilityType":"","disabilitySubtype":"","state":"Edo","lga":"Oredo","association":"Assoc","gpsCoordinates":"undefined,undefined","tradeType":"6","tradeSubtype":"6009","accountName":"polo","accountNumber":"0109998058","bank":"058","bvn":"90786712341","nokFirstName":"first","nokLastName":"last","nokPhoneNumber":"middle","guarantorFirstName":"first","guarantorLastName":"last","guarantorPhoneNumber":"middle","idType":"International Passport","idNumber":"1011001","idExpiry":1596240000000,"passphrase":"alarms ghetto jubilee oilfield meant meant action street void human tremble wolf","dateRegistered":1596322452230,"agentEmail":"agent@one.com"}}'
