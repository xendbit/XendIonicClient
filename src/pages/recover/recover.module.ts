import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { RecoverPage } from './recover';

@NgModule({
    declarations: [
      RecoverPage,
    ],
    imports: [
      IonicPageModule.forChild(RecoverPage),
    ],
    exports: [
      RecoverPage
    ],
    providers: [
      Clipboard
    ]
  })

  export class MyOrdersPageModule {}