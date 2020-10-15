import { PreImage } from './../utils/preimage';
import { Base64 } from '@ionic-native/base64';
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
import { Camera, CameraOptions } from '@ionic-native/camera';


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

  constructor(public camera: Camera, public androidPermissions: AndroidPermissions, public base64: Base64, public imageResizer: ImageResizer, private loadingCtrl: LoadingController, private navCtrl: NavController, private navParams: NavParams, private formBuilder: FormBuilder, private toastCtrl: ToastController, private http: Http, private mediaCapture: MediaCapture, public platform: Platform) {
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

    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.maxLength(255), Validators.pattern(this.emailRegex), Validators.required])],
      phoneNumber: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      idType: ['',],
      idNumber: ['',],
      surName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      country: [''],
      bank: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bvn: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      dateOfBirth: ['', Validators.required],
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

  clearForm() {
    // this.registerForm.controls.email.setValue("");
    // this.registerForm.controls.phoneNumber.setValue("");
    // this.registerForm.controls.idNumber.setValue("");
    // this.registerForm.controls.surName.setValue("");
    // this.registerForm.controls.firstName.setValue("");
    // this.registerForm.controls.middleName.setValue("");
    // this.registerForm.controls.accountNumber.setValue("");
    // this.registerForm.controls.bvn.setValue("");
    this.registerForm.reset();
    this.idImagePath = undefined;
    this.idImage = undefined;
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

  // TODO: create chose image method and chose image button
  capturePassport(sourceType) {
    Console.log("Capturing Passport");
    const options: CameraOptions = {
      quality: 15,
      sourceType: sourceType,
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
      Console.log(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  __capturePassport() {
    Console.log("Capturing Passport");
    let options: CaptureImageOptions = { limit: 1 };
    this.mediaCapture.captureImage(options)
      .then(
        (data: MediaFile[]) => {
          Console.log("Passport Captured with data: " + data);
          Console.log("Path: " + data[0]['fullPath']);
          //this.resizeImage(data[0]['fullPath']);
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
    Console.log('DOB: ' + this.registerForm.value.dateOfBirth);
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

      let dob = rf.dateOfBirth;
      let age = new Date(dob);
      var myAge = ~~((Date.now() - age.getTime()) / (31557600000));

      if (myAge < 18) {
        Constants.showLongToastMessage("Agent must be at least 18 years old", this.toastCtrl);
        return;
      }

      if (rf.dateOfBirth === '') {
        Constants.showLongToastMessage("Enter valid date of birth", this.toastCtrl);
        return;
      }

      if (rf.bvn === '') {
        Constants.showLongToastMessage("Enter valid BVN", this.toastCtrl);
        return;
      }
    }

    if (isValid) {
      if (this.platform.is('core') || this.platform.is('mobileweb')) {
        this.idImagePath = 'test';
        this.idImage = PreImage.idImage;
      }

      if (this.idImagePath === undefined) {
        Constants.showLongToastMessage("Picture of ID not found, Please upload one", this.toastCtrl);
        return;
      }

      let url = Constants.RESTORE_USER_URL;
      url = Constants.NEW_USER_URL;
      let registrationType = "NEW";

      Constants.registrationData['loading'] = this.loading;
      Constants.registrationData['loadingCtrl'] = this.loadingCtrl;
      Constants.registrationData['rf'] = rf;
      Constants.registrationData['http'] = this.http;
      Constants.registrationData['ls'] = this.ls;
      Constants.registrationData['toastCtrl'] = this.toastCtrl;
      Constants.registrationData['obv'] = Observable;
      Constants.registrationData['navCtrl'] = this.navCtrl;
      Constants.registrationData['tp'] = 'PasswordPage';
      Constants.registrationData['idImage'] = this.idImage;

      Constants.registrationData['idImage'] = this.idImage;
      Constants.registrationData['url'] = url;
      Constants.registrationData['registrationType'] = registrationType;
      Constants.passwordPadSuccessCallback = this.passwordPadSuccess;

      Constants.otherData['is_agent_register'] = true;
      Constants.otherData['is_beneficiary'] = false;
      Constants.otherData['is_login'] = false;
      this.navCtrl.push('PasswordPage');
    } else {
      Constants.showLongToastMessage("Please fill form properly", this.toastCtrl);
    }
  }

  checkValue() {
    Console.log(this.registerForm.value.isBeneficiary);
  }

  passwordPadSuccess() {

  }
}
