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
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = 'ViewBeneficiariesPage';
  tab2Root: any = 'RegisterPaginated';
  tab3Root: any = 'CollectPaymentPage';
  tab4Root: any = 'SettingsPage';

  isAdvanced: boolean = false;

  constructor(public http: Http, public alertCtrl: AlertController, public platform: Platform) {
    if (Constants.properties === undefined) {
      //do nothing
    } else {
      this.initProps();
    }
  }

  ionViewDidEnter() {
    this.isAdvanced = false;
    if (StorageService.ACCOUNT_TYPE === "ADVANCED") {
      this.isAdvanced = true;
    }
  }

  initProps() {
  }
}
