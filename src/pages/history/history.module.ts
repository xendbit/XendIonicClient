import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { HistoryPage } from './history';

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
  })

  export class MyOrdersPageModule {}