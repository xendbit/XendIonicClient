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
  bankAccountNumber = "";
  accountBalance = 0;
  searchTerm = "";

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public alertCtrl: AlertController, public modalCtrl: ModalController, public toastCtrl: ToastController) {
    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  async ionViewDidEnter() {
    this.ls.setItem("searchBarBeneficiaries", undefined);
    this.bankAccountNumber = await this.ls.getItem("bankAccountNumber");
    this.accountBalance = await this.ls.getItem("accountBalance");
    this.loadBeneficiaries();
  }

  ionViewDidLoad() {

  }

  async findBeneficiary(ev: any) {
    this.searchTerm = ev.target.value;
    let sbb = await this.ls.getItem("searchBarBeneficiaries");
    if (sbb === undefined && this.searchTerm.length === 1) {
      this.findBeneficiaries();
    } else {
      if(sbb !== undefined) {
        this.filterBeneficiaries(sbb);
      } else {
        this.filterBeneficiaries(this.beneficiaries);
      }
    }
  }

  async findBeneficiaries() {
    let url = Constants.FIND_BENEFICIARIES_URL;
    let key = Constants.WORKING_WALLET + "Address";

    let requestData = {
      password: await this.ls.getItem("password"),
      networkAddress: await this.ls.getItem(key),
      emailAddress: await this.ls.getItem("emailAddress")
    }

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(
      responseData => {
        let ben = responseData['result'];
        this.ls.setItem("searchBarBeneficiaries", ben);
        this.filterBeneficiaries(ben);
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    )
  }

  filterBeneficiaries(loaded) {

    this.beneficiaries = [];
    let searchTerm = this.searchTerm;
    console.log(searchTerm);
    for (let b of loaded) {
      if ((b.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else if ((b.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else if ((b.phoneNumber.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else if ((b.accountNumber.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else if ((b.bvn.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else if ((b.address.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)) {
        this.beneficiaries.push(b);
      } else {
        //do nothing
      }
    }

    console.log(this.beneficiaries);
  }

  async loadBeneficiaries() {
    let url = Constants.LOAD_BENEFICIARIES_URL;
    let key = Constants.WORKING_WALLET + "Address";

    let requestData = {
      password: await this.ls.getItem("password"),
      networkAddress: await this.ls.getItem(key),
      emailAddress: await this.ls.getItem("emailAddress")
    }

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(
      responseData => {
        this.beneficiaries = responseData['result'];
      }, error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    )
  }

  showDetails(beneficiary) {
    Constants.registrationData['beneficiary'] = beneficiary;
    Constants.registrationData['viewBeneficiaries'] = this;
    let modal = this.modalCtrl.create('ShowBeneficiaryPage', {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.present();
  }
}
