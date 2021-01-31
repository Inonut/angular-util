import 'hammerjs';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppInputSpinnerDirective} from './common/input-spinner/app-input-spinner.directive';
import {AppTabDragDirective} from './common/tab-drag/app-tab-drag.directive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IsxColumnDragHeaderDirective} from "./common/table/column-drag/isx-column-drag-header.directive";
import {IsxColumnDragCellDirective} from "./common/table/column-drag/isx-column-drag-cell.directive";
import {IsxColumnDragDirective} from "./common/table/column-drag/isx-column-drag.directive";
import {IsxColumnResizeCellDirective} from "./common/table/column-resize/isx-column-resize-cell.directive";
import {IsxColumnResizeDirective} from "./common/table/column-resize/isx-column-resize.directive";
import {IsxColumnResizeHeaderDirective} from "./common/table/column-resize/isx-column-resize-header.directive";
import {IsxTableVirtualScrollFixedSizeDirective} from "./common/table/virtual-scroll/isx-table-virtual-scroll-fixed-size.directive";
import {MatNativeDateModule} from "@angular/material/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {DemoMaterialModule} from "./material-module";
import {IsxRowActionDirective} from "./common/table/row-action/isx-row-action.directive";
import {IsxTableMessageDirective} from "./common/table/message/isx-table-message.directive";

@NgModule({
    declarations: [
        AppComponent,
        AppInputSpinnerDirective,
        AppTabDragDirective,

        IsxColumnDragHeaderDirective,
        IsxColumnDragCellDirective,
        IsxColumnDragDirective,

        IsxColumnResizeHeaderDirective,
        IsxColumnResizeCellDirective,
        IsxColumnResizeDirective,

        IsxTableVirtualScrollFixedSizeDirective,

        IsxRowActionDirective,
        IsxTableMessageDirective
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
