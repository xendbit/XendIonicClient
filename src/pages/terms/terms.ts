import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

/*
  Generated class for the Terms page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html'
})

export class TermsPage {

  iAcceptText: string;
  pageTitle: string;
  ls: StorageService;

  constructor(public storage: Storage, public http: Http, public navCtrl: NavController, public navParams: NavParams) {
    this.iAcceptText = "I Accept";
    this.pageTitle = "Terms and Agreement";
  }

  ionViewDidLoad() {

    this.ls = new StorageService(this.storage);
  }

  acceptTermsAndAgreement() {
    if (Constants.REG_TYPE === 'recover') {
      this.navCtrl.push('GettingStartedPage');
    } else {
      Constants.registrationData['walletType'] = 'ADVANCED';
      StorageService.ACCOUNT_TYPE = "ADVANCED";
      StorageService.IS_BENEFICIARY = false;
      this.ls.setItem("accountType", "ADVANCED");
      this.navCtrl.push('WarningPage');
    }
  }
}
