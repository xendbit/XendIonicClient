import { ReleaseCoinsPage } from './release-coins';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      ReleaseCoinsPage,
    ],
    imports: [
      IonicPageModule.forChild(ReleaseCoinsPage),
    ],
    exports: [
        ReleaseCoinsPage
    ],
  })

  export class ReleaseCoinsPageModule {}