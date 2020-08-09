import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectPaymentPage } from './collect-payment';

@NgModule({
  declarations: [
    CollectPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(CollectPaymentPage),
  ],
})
export class CollectPaymentPageModule {}
