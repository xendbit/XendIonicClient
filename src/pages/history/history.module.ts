import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { HistoryPage } from './history';
import { Clipboard } from '@ionic-native/clipboard';

@NgModule({
    declarations: [
      HistoryPage,
    ],
    imports: [
      IonicPageModule.forChild(HistoryPage),
    ],
    exports: [
      HistoryPage
    ],
    providers: [
      Clipboard
    ]
  })

  export class MyOrdersPageModule {}