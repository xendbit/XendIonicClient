import { Constants } from './../utils/constants';
import { StorageService } from './../utils/storageservice';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
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

  async delete(pd) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: "Are you sure you want to delete this record. You won't be retrieve the record again",
      buttons: [
        {
          text: "No, Don't Delete",
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes, Delete',
          handler: () => {
            this.deleteFinal(pd);
          }
        }
      ]
    });
    confirm.present();
  }

  async deleteFinal(pd) {
    let key = pd.key;
    let dataKey = "postData-" + key.split('-')[1];
    let errorKey = 'serverError-' + key.split('-')[1];
    console.log(dataKey);
    console.log(errorKey);
    await this.ls.removeItem(dataKey);
    await this.ls.removeItem(errorKey);
    this.loadServerError();
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
