import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AppInputSpinnerDirective} from './common/input-spinner/app-input-spinner.directive';
import {AppNumericFieldDirective} from './common/numeric-field/app-numeric-field.directive';
import {AppTabDragDirective} from './common/tab-drag/app-tab-drag.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppInputSearchComponent} from './common/input-search/app-input-search.component';
import {IsxColumnDragDirective} from './common/table/isx-column-drag.directive';
import {IsxColumnDragHeaderDirective} from './common/table/isx-column-drag-header.directive';
import {IsxColumnDragCellDirective} from './common/table/isx-column-drag-cell.directive';
import {IsxColumnResizeDirective} from './common/table/isx-column-resize.directive';
import {IsxColumnResizeHeaderDirective} from './common/table/isx-column-resize-header.directive';
import {IsxColumnResizeCellDirective} from './common/table/isx-column-resize-cell.directive';
import {IsxVirtualForDirective} from './common/table/isx-virtual-for.directive';
import {IsxRowActionDirective} from './common/table/isx-row-action.directive';
import {IsxVirtualScrollViewportComponent} from './common/table/isx-virtual-scroll-viewport.component';
import {IsxTableMessageDirecive} from './common/table/isx-table-message.direcive';

@NgModule({
  declarations: [
    AppComponent,
    AppInputSpinnerDirective,
    AppNumericFieldDirective,
    AppTabDragDirective,
    AppInputSearchComponent,

    IsxColumnDragDirective,
    IsxColumnDragHeaderDirective,
    IsxColumnDragCellDirective,
    IsxColumnResizeDirective,
    IsxColumnResizeHeaderDirective,
    IsxColumnResizeCellDirective,
    IsxVirtualForDirective,
    IsxRowActionDirective,
    IsxVirtualScrollViewportComponent,
    IsxTableMessageDirecive,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
