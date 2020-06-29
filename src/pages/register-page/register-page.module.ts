import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterPaginated } from './register-page';
import { Geolocation } from '@ionic-native/geolocation';


@NgModule({
  declarations: [
    RegisterPaginated,
  ],
  imports: [
    IonicPageModule.forChild(RegisterPaginated),
  ],
  providers: [
    Geolocation
  ],
})
export class RegisterPageModule {
  
}
