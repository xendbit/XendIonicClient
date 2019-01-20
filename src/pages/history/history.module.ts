import { Clipboard } from '@ionic-native/clipboard';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistoryPage } from './history';

@NgModule({
  declarations: [
    HistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HistoryPage),
  ],
  providers: [
    Clipboard
  ],
  exports: [
    HistoryPage
  ],
})
export class HistoryPageModule { }
