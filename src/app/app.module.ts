import 'hammerjs';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppInputSpinnerDirective} from './common/input-spinner/app-input-spinner.directive';
import {AppTabDragDirective} from './common/tab-drag/app-tab-drag.directive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        AppInputSpinnerDirective,
        AppTabDragDirective,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
