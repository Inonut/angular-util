import 'hammerjs';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppInputSpinnerDirective} from './common/input-spinner/app-input-spinner.directive';
import {AppTabDragDirective} from './common/tab-drag/app-tab-drag.directive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkColumnDragHeaderDirective} from "./common/table/column-drag/cdk-column-drag-header.directive";
import {CdkColumnDragCellDirective} from "./common/table/column-drag/cdk-column-drag-cell.directive";
import {CdkColumnDragDirective} from "./common/table/column-drag/cdk-column-drag.directive";
import {CdkColumnResizeCellDirective} from "./common/table/column-resize/cdk-column-resize-cell.directive";
import {CdkColumnResizeDirective} from "./common/table/column-resize/cdk-column-resize.directive";
import {CdkColumnResizeHeaderDirective} from "./common/table/column-resize/cdk-column-resize-header.directive";
import {CdkTableVirtualScrollFixedSizeDirective} from "./common/table/virtual-scroll/cdk-table-virtual-scroll-fixed-size.directive";
import {MatNativeDateModule} from "@angular/material/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {DemoMaterialModule} from "./material-module";
import {CdkRowActionDirective} from "./common/table/row-action/cdk-row-action.directive";

@NgModule({
    declarations: [
        AppComponent,
        AppInputSpinnerDirective,
        AppTabDragDirective,

        CdkColumnDragHeaderDirective,
        CdkColumnDragCellDirective,
        CdkColumnDragDirective,

        CdkColumnResizeHeaderDirective,
        CdkColumnResizeCellDirective,
        CdkColumnResizeDirective,

        CdkTableVirtualScrollFixedSizeDirective,

        CdkRowActionDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        DemoMaterialModule,
        MatNativeDateModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
