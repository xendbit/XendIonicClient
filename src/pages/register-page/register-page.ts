import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';
import { Constants } from '../utils/constants';
import { Geolocation } from '@ionic-native/geolocation';


/**
 * Generated class for the RegisterPageOnePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register-page',
  templateUrl: 'register-page.html',
})
export class RegisterPaginated {

  registerPageOneForm;
  registerPageTwoForm;
  registerPageThreeForm;
  registerPageFourForm;
  registerPageFiveForm;
  registerPageSixForm;

  page = 1;  
  lastPage = 6;

  states = [];
  lgas = [];
  selectedLGAs = [];
  lat: number;
  long: number;

  constructor(private geolocation: Geolocation, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder) {    
    this.states = Constants.properties['states'];
    this.lgas = Constants.properties['lgas'];

    Console.log("--- States ---");
    Console.log(this.states);

    this.registerPageOneForm = this.formBuilder.group({
      firstName: ['',  Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      phoneNumber: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      disability: [''],
      state: ['', Validators.required],
      lga: ['', Validators.required],
    });

    this.registerPageTwoForm = this.formBuilder.group({
      cluster: ['',  Validators.required],
      association: ['',  Validators.required],
      gpsCoordinate: ['',  Validators.required],
      tradeType: ['',  Validators.required],
      tradeSubType: ['',  Validators.required],
    });    

    this.registerPageThreeForm = this.formBuilder.group({
      accountName: ['',  Validators.required],
      accountNumber: ['',  Validators.required],
      bank: ['',  Validators.required],
      bvn: ['',  Validators.required],
    });        

    this.registerPageFourForm = this.formBuilder.group({
      nextOfKin1: ['',  Validators.required],
      nextOfKin2: ['',  Validators.required],
      nextOfKin3: ['',  Validators.required],
    });            

    this.registerPageFiveForm = this.formBuilder.group({
      guarantor1: ['',  Validators.required],
      guarantor2: ['',  Validators.required],
      guarantor3: ['',  Validators.required],
    });                

    this.registerPageSixForm = this.formBuilder.group({
      idType: ['',  Validators.required],
      idNumber: ['',  Validators.required],
      idExpiry: ['',  Validators.required],
    });             
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPageOnePage');
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude
      Console.log(resp);
     }).catch((error) => {
       console.log('Error getting location', error);
     });    
  }

  stateSelected(value) {
    let state = this.findStateByName(value);
    this.selectedLGAs = this.findLGAByStateId(state.id);
  }

  findLGAByStateId(id) {
    let found = [];
    for(let lga of this.lgas) {
      if(lga.state_id === id) {
        found.push(lga);
      }
    }

    return found;
  }

  findStateByName(name) {
    for(let state of this.states) {
      if(state.name === name) {
        return state;
      }
    }
  }
}
