import { AndroidPermissions } from '@ionic-native/android-permissions';
import { RegisterPage } from './register';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { Camera } from '@ionic-native/camera';

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
        AndroidPermissions,
        Camera,
    ]
  })

  export class RegisterPageModule {}