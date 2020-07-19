import { Base64 } from '@ionic-native/base64';
import { MediaCapture } from '@ionic-native/media-capture';
import { ImageResizer } from '@ionic-native/image-resizer';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Camera } from '@ionic-native/camera';
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
    Base64,
    MediaCapture,
    ImageResizer,
    AndroidPermissions,
    Camera,
    Geolocation
  ],
})
export class RegisterPageModule {

}
