import { Constants } from './../utils/constants';
import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the StatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {

  ls: StorageService;
  postData = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatusPage');
    this.loadServerError();
  }

  ionViewDidEnter() {
    this.loadServerError();
  }

  async edit(pd) {
    Constants.otherData['editMode'] = true;
    Constants.otherData['editModeKey'] = pd.key;
    this.navCtrl.push('RegisterPaginated');
  }

  async loadServerError() {
    this.postData = [];
    let keys = await this.ls.errorKeys();
    if (keys !== undefined) {
      for (let key of keys) {
        let pd = {
          key: key,
          data: await this.ls.getItem(key)
        }
        this.postData.push(pd);
      }
    }
  }
}
