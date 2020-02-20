import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ImageResizer } from '@ionic-native/image-resizer';
import { MediaCapture } from '@ionic-native/media-capture';
import { Base64 } from '@ionic-native/base64';
import { Camera } from '@ionic-native/camera';
import { RegisterPage } from './register';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      RegisterPage,
    ],
    imports: [
      IonicPageModule.forChild(RegisterPage),
    ],
    exports: [
        RegisterPage
    ],
    providers: [
        Base64,
        MediaCapture,
        ImageResizer,
        AndroidPermissions,
        Camera
    ]
  })

  export class RegisterPageModule {}
