import { Constants } from './../utils/constants';

import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, AlertController, ModalController, IonicPage, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/**
 * Generated class for the ViewBeneficiariesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-view-beneficiaries',
  templateUrl: 'view-beneficiaries.html',
})
export class ViewBeneficiariesPage {

  ls: StorageService;
  loading: Loading;
  beneficiaries = [];

  constructor(public loadingCtrl: LoadingController,  public navCtrl: NavController, public navParams: NavParams, public http: Http, public alertCtrl: AlertController, public modalCtrl: ModalController, public toastCtrl: ToastController) {
    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidEnter(){
    this.loadBeneficiaries();
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad ViewBeneficiariesPage');
  }

  loadBeneficiaries(): any {
    let url = Constants.LOAD_BENEFICIARIES_URL;
    let key = Constants.WORKING_WALLET + "Address";

    let requestData = {
      password: this.ls.getItem("password"),
      networkAddress: this.ls.getItem(key),
      emailAddress: this.ls.getItem("emailAddress")
    }

    let loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(
      responseData => {
        loading.dismiss();
        this.beneficiaries = responseData['result'];
      }, error => {
        loading.dismiss();
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    )
  }

  showDetails(beneficiary) {
    Constants.registrationData['beneficiary'] = beneficiary;
    Constants.registrationData['viewBeneficiaries'] = this;
    let modal = this.modalCtrl.create('ShowBeneficiaryPage',{},{showBackdrop:true, enableBackdropDismiss:true});
    modal.present();
  }
}
