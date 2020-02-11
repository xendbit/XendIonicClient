import { Base64 } from '@ionic-native/base64';
import { FileTransfer } from '@ionic-native/file-transfer';
import { MediaCapture, CaptureImageOptions, MediaFile, CaptureError } from '@ionic-native/media-capture';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
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

declare var genwallet: any;

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

  constructor(public androidPermissions: AndroidPermissions, public base64: Base64, public imageResizer: ImageResizer, private loadingCtrl: LoadingController, private navCtrl: NavController, private navParams: NavParams, private formBuilder: FormBuilder, private toastCtrl: ToastController, private http: Http, private mediaCapture: MediaCapture, public platform: Platform, private transfer: FileTransfer) {
    this.platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    });

    this.isTrader = Constants.properties['walletType'] === 'trader';
    this.banks = Constants.properties['banks'];
    this.pageTitle = "Complete Registration";
    this.cbnWarning = "Due to CBN regulations, Your XendBit wallet must be integrated with your BVN. Make sure the information below is the same as the one on your BVN registration. If we can not validate your information with your BVN information, you will not be able to Send Bits.";
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

    Constants.registrationData['fileTransferObject'] = this.transfer.create();

    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.maxLength(255), Validators.pattern(this.emailRegex), Validators.required])],
      phoneNumber: [''],
      idType: ['',],
      idNumber: ['',],
      surName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      country: [''],
      bank: ['', Validators.required],
      accountNumber: ['', Validators.required],
      isBeneficiary: ['false'],
      referralCode: [''],
      enableWhatsapp: ['No'],
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
    if (Constants.IS_LOGGED_IN) {
      let result = genwallet();
      Console.log(result);
      Constants.registrationData['mnemonic'] = result.mnemonic;
      this.mnemonic = result.mnemonic;
    } else {
      this.mnemonic = this.navParams.get("mnemonic");
      Constants.registrationData['mnemonic'] = this.mnemonic;
    }
  }

  ionViewDidEnter() {
    this.isBasic = StorageService.ACCOUNT_TYPE === "BASIC";
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPage');
  }

  capturePassport() {
    Console.log("Capturing Passport");
    let options: CaptureImageOptions = { limit: 1 };
    this.mediaCapture.captureImage(options)
      .then(
        (data: MediaFile[]) => {
          Console.log("Passport Captured with data: " + data);
          Console.log("Path: " + data[0]['fullPath']);
          this.resizeImage(data[0]['fullPath']);
        },
        (err: CaptureError) => {
          Console.log(err);
        }
      );
  }

  resizeImage(uri) {
    Console.log("Resizing Image");
    this.idImagePath = uri;
    Console.log("Platform is iOS: " + this.platform.is('ios'));
    if (this.platform.is('ios')) {
      uri = normalizeURL(uri);
      this.toDataUrl(uri, function (myBase64) {
        this.idImage = myBase64;
      });
    } else {
      let fileName = Constants.makeid();
      let options: ImageResizerOptions = {
        uri: uri,
        folderName: 'XendBit',
        quality: 100,
        width: 400,
        height: 400,
        fileName: fileName
      };

      Console.log("Resizing Options: " + options);

      this.imageResizer.resize(options).then((filePath: string) => {
        Console.log("Resizing Succesful. New Path is: " + filePath);
        this.idImagePath = filePath;
        Console.log("Encoding Into Base64");
        this.base64.encodeFile(filePath).then((base64File: string) => {
          Console.log("Base64 Encoding Succesful: " + base64File.substr(0, 10));
          this.idImage = base64File;
        }, (err) => {
          Console.log(err);
        });
      }).catch(e => {
        Console.log(e)
      });
    }
  }

  toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  register() {
    let isValid = false;
    let rf = this.registerForm.value;

    if (this.registerForm.valid) {
      isValid = true;
    } else {
      if (rf.email.match(this.emailRegex) === null) {
        Constants.showLongToastMessage("Enter valid email address", this.toastCtrl);
        return;
      }

      if (rf.phoneNumber === '') {
        Constants.showLongToastMessage("Enter valid phone number", this.toastCtrl);
        return;
      }

      if (rf.surName === '') {
        Constants.showLongToastMessage("Please enter your surname", this.toastCtrl);
        return;
      }

      if (rf.firstName === '') {
        Constants.showLongToastMessage("Please enter your first name", this.toastCtrl);
        return;
      }

      if (rf.idNumber === '') {
        Constants.showLongToastMessage("Please enter  ID Number", this.toastCtrl);
        return;
      }

      for (let bank in this.banks) {
        if (this.banks[bank]['bankCode'] === rf.bank) {
          Constants.registrationData['bankName'] = this.banks[bank]['bankName'];
          break;
        }
      }

      if (rf.phoneNumber !== undefined) {
        if (rf.phoneNumber.startsWith("+")) {
          Constants.showLongerToastMessage("Phone number should contain only numbers", this.toastCtrl);
          return;
        }

        if (rf.phoneNumber.startsWith("0")) {
          Constants.showLongerToastMessage("Phone number entered is not in international format", this.toastCtrl);
          return;
        }
      }
    }

    if (isValid) {
      this.idImagePath = "1011001";
      if (this.idImagePath === undefined) {
        Constants.showLongToastMessage("Picture of ID not found, Please upload one", this.toastCtrl);
        return;
      }

      let url = Constants.RESTORE_USER_URL;
      url = Constants.NEW_USER_URL;
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
      Constants.registrationData['idImage'] = "data:image/jpeg;base64,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";//this.idImage;
      Constants.registrationData['url'] = url;
      Constants.registrationData['registrationType'] = registrationType;

      this.navCtrl.push('PasswordPage');

      Constants.passwordPadSuccessCallback = this.passwordPadSuccess;
    } else {
      Constants.showLongToastMessage("Please fill form properly", this.toastCtrl);
    }
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
    if (rf.bank !== undefined && rf.bank !== "") {
      Constants.registrationData['bankCode'] = rf.bank;
    } else {
      Constants.registrationData['bankCode'] = "000";
    }
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['isBeneficiary'] = Constants.IS_LOGGED_IN;
    StorageService.IS_BENEFICIARY = rf.isBeneficiary;

    Constants.registerOnServer();
  }
}
