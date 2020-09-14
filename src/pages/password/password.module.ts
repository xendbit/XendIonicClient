import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { PasswordPage } from './password';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      PasswordPage,
    ],
    imports: [
      IonicPageModule.forChild(PasswordPage),
    ],
    exports: [
        PasswordPage
    ],
    providers: [
      FingerprintAIO
    ]
  })

  export class PasswordPageModule {}
