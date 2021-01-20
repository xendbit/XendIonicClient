import { PreImage } from './../utils/preimage';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, IonicPage, normalizeURL, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { AndroidPermissions } from '@ionic-native/android-permissions';


import { StorageService } from '../utils/storageservice';
import { Camera, CameraOptions } from '@ionic-native/camera';


/*
 Generated class for the Register page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  mnemonic: string;
  registerForm;
  loading: Loading;
  ls;

  pageTitle: string;
  cbnWarning: string;
  emailAddressText: string;
  phoneNumberText: string;

  bvnText: string;
  nextText: string;
  idImagePath: string = undefined;
  idImage: string;
  kycInformationText: string;
  formOfIdText: string;
  passportText: string;
  driversLicenceText: string;
  nationalIdText: string;
  idTypeText: string;
  idNumberText: string;
  idTypes = [];
  banks = [];
  idImageText: string;
  country: number;
  isTrader = true;
  isBasic = true;

  emailRegex = '^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$';

  constructor(public androidPermissions: AndroidPermissions, private loadingCtrl: LoadingController, private navCtrl: NavController, private navParams: NavParams, private formBuilder: FormBuilder, private toastCtrl: ToastController, private http: Http, public platform: Platform, private camera: Camera) {
    this.platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    });

    this.isTrader = Constants.properties['walletType'] === 'trader';
    this.banks = Constants.properties['banks'];
    this.pageTitle = "Complete Registration";
    this.cbnWarning = "Due to CBN regulations, Your XendFi wallet must be integrated with your BVN. Make sure the information below is the same as the one on your BVN registration. If we can not validate your information with your BVN information, you will not be able to Send Bits.";
    this.emailAddressText = "Email Address";
    this.phoneNumberText = "Phone Number";
    this.bvnText = "BVN";
    this.nextText = "Next";
    this.kycInformationText = "KYC Information";
    this.formOfIdText = "Form Of Identification";
    this.passportText = "Passport";
    this.driversLicenceText = "Driver's Licence";
    this.nationalIdText = "National ID Card";
    this.idTypeText = "ID Type";
    this.idNumberText = "ID Number";
    this.idTypes = Constants.properties['id.types'];
    this.idImageText = "ID Image";
    this.country = 1;

    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.maxLength(255), Validators.pattern(this.emailRegex), Validators.required])],
      phoneNumber: ['', Validators.compose([Validators.maxLength(11), Validators.minLength(11), Validators.required])],
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      surName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      bank: ['', Validators.required],
      bvn: ['', Validators.required],
      accountNumber: ['', Validators.required]
    });

    this.isBasic = false;
    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
      app.isBasic = StorageService.ACCOUNT_TYPE === "BASIC";
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewWillEnter() {
    this.mnemonic = this.navParams.get("mnemonic");
  }

  ionViewDidEnter() {
    this.isBasic = StorageService.ACCOUNT_TYPE === "BASIC";
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPage');
  }

  capturePassport() {
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.idImagePath = "path";
      this.idImage = PreImage.idImage;
      return;
    }

    const options: CameraOptions = {
      quality: 15,
      sourceType: 1,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.idImage = base64Image;
      this.idImagePath = "data:image";

    }, (err) => {
      // Handle error
    });
  }


  register() {
    let rf = this.registerForm.value;

    for (let bank of this.banks) {
      if (bank.bankCode === rf.bank) {
        Constants.registrationData['bankName'] = bank.bankName;
        break;
      }
    }

    console.log(Constants.registrationData);

    if (rf.email.match(this.emailRegex) === null) {
      Constants.showPersistentToastMessage("Enter valid email address", this.toastCtrl);
      return;
    }

    if (rf.phoneNumber === '') {
      Constants.showPersistentToastMessage("Enter valid phone number", this.toastCtrl);
      return;
    }

    if (rf.surName === '') {
      Constants.showPersistentToastMessage("Please enter your surname", this.toastCtrl);
      return;
    }

    if (rf.firstName === '') {
      Constants.showPersistentToastMessage("Please enter your first name", this.toastCtrl);
      return;
    }

    if (rf.middleName === '') {
      Constants.showPersistentToastMessage("Please enter your middle name", this.toastCtrl);
      return;
    }

    if (rf.idType === '') {
      Constants.showPersistentToastMessage("Please select  ID Type", this.toastCtrl);
      return;
    }

    if (rf.idNumber === '') {
      Constants.showPersistentToastMessage("Please enter  ID Number", this.toastCtrl);
      return;
    }

    if (rf.accountNumber === '') {
      Constants.showPersistentToastMessage("Please enter  Account Number", this.toastCtrl);
      return;
    }

    if (rf.bvn === '') {
      Constants.showPersistentToastMessage("Please enter  your BVN", this.toastCtrl);
      return;
    }    

    if (rf.bank === '') {
      Constants.showPersistentToastMessage("Please select Bank", this.toastCtrl);
      return;
    }


    if (this.idImagePath === undefined) {
      Constants.showPersistentToastMessage("Picture of ID not found, Please upload one", this.toastCtrl);
      return;
    }

    let url = Constants.NEW_USER_URL;
    let registrationType = "NEW";

    Constants.registrationData['loading'] = this.loading;
    Constants.registrationData['loadingCtrl'] = this.loadingCtrl;
    Constants.registrationData['navCtrl'] = this.navCtrl;
    Constants.registrationData['rf'] = rf;
    Constants.registrationData['http'] = this.http;
    Constants.registrationData['ls'] = this.ls;
    Constants.registrationData['toastCtrl'] = this.toastCtrl;
    Constants.registrationData['obv'] = Observable;
    Constants.registrationData['navCtrl'] = this.navCtrl;
    Constants.registrationData['tp'] = 'LoginPage';
    Constants.registrationData['idImage'] = this.idImage;
    Constants.registrationData['url'] = url;
    Constants.registrationData['registrationType'] = registrationType;

    this.navCtrl.push('PasswordPage');

    Constants.passwordPadSuccessCallback = this.passwordPadSuccess;
  }

  checkValue() {
    Console.log(this.registerForm.value.isBeneficiary);
  }

  passwordPadSuccess() {
    let rf = Constants.registrationData['rf'];

    let referralCode = rf.referralCode;

    if (referralCode === undefined || referralCode === null || referralCode === '') {
      referralCode = 'XENDBIT';
    }

    Constants.registrationData['email'] = rf.email;
    Constants.registrationData['phoneNumber'] = rf.phoneNumber;
    Constants.registrationData['surName'] = rf.surName;
    Constants.registrationData['firstName'] = rf.firstName;
    Constants.registrationData['middleName'] = rf.middleName;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['idType'] = rf.idType;
    Constants.registrationData['idNumber'] = rf.idNumber;
    Constants.registrationData['country'] = "";
    Constants.registrationData['enableWhatsapp'] = rf.enableWhatsapp;
    Constants.registrationData['referralCode'] = referralCode;
    Constants.registrationData['bankCode'] = rf.bank;
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['isBeneficiary'] = rf.isBeneficiary;
    StorageService.IS_BENEFICIARY = rf.isBeneficiary;

    Constants.registerOnServer();
  }
}
