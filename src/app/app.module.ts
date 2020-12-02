import 'hammerjs';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppInputSpinnerDirective} from './common/input-spinner/app-input-spinner.directive';
import {AppTabDragDirective} from './common/tab-drag/app-tab-drag.directive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from "@angular/material/table";
import {TableItemSizeDirective} from "./common/table/virtual-scroll/table-item-size.directive";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {CommonModule} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSortModule} from "@angular/material/sort";
import {IsxColumnDragHeaderDirective} from "./common/table/column-drag/isx-column-drag-header.directive";
import {IsxColumnDragCellDirective} from "./common/table/column-drag/isx-column-drag-cell.directive";
import {IsxColumnDragDirective} from "./common/table/column-drag/isx-column-drag.directive";
import {IsxColumnResizeCellDirective} from "./common/table/column-resize/isx-column-resize-cell.directive";
import {IsxColumnResizeDirective} from "./common/table/column-resize/isx-column-resize.directive";
import {IsxColumnResizeHeaderDirective} from "./common/table/column-resize/isx-column-resize-header.directive";

@NgModule({
    declarations: [
        AppComponent,
        AppInputSpinnerDirective,
        AppTabDragDirective,

        TableItemSizeDirective,

        IsxColumnDragHeaderDirective,
        IsxColumnDragCellDirective,
        IsxColumnDragDirective,

        IsxColumnResizeHeaderDirective,
        IsxColumnResizeCellDirective,
        IsxColumnResizeDirective,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        BrowserAnimationsModule,
        MatTableModule,
        ScrollingModule,
        MatSortModule,
        MatCheckboxModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
