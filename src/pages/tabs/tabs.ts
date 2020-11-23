import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { Constants } from '../utils/constants';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { StorageService } from '../utils/storageservice';

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
 homeText: string;
 buyText: string;
 sendText: string;
 send2BankText: string;
 settingsText: string;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = 'LandingPage';
  tab2Root: any = 'MyOrdersPage';
  tab3Root: any = 'ExchangePage';
  tab4Root: any = 'NgncPage';
  tab5Root: any = 'SettingsPage';

 isAdvanced: boolean = false;

  constructor( public http: Http, public alertCtrl: AlertController, public platform: Platform) {
    if(Constants.properties === undefined) {
      //do nothing
    } else {
      this.initProps();
    }
  }

  ionViewDidEnter() {
    this.isAdvanced = false;
    if(StorageService.ACCOUNT_TYPE === "ADVANCED") {
      this.isAdvanced = true;
    }
  }

  initProps() {
    this.homeText = "Home";
    this.buyText = "Buy";
    this.sendText = "Xend";
    this.send2BankText = "Xend2Bank";
    this.settingsText = "More..";
  }
}
