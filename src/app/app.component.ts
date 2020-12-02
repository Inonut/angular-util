import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {TableVirtualScrollDataSource} from "./common/table/table-data-source";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    dataSource = null;
    displayedColumns = [];
    rowCount = 100000;
    columnCount = 20;

    constructor(private changeDetectorRef: ChangeDetectorRef) {

        const data = [];
        for (let i = 0; i < this.rowCount; i++) {
            data.push({
                column0: i
            });
            for (let j = 1; j < this.columnCount; j++) {
                data[data.length - 1]['column' + j] = 'column' + j;
            }
        }

        this.dataSource = new TableVirtualScrollDataSource(data);
        this.displayedColumns = ['checkbox'].concat(Object.keys(data[0]));
    }

    columnProcess(columnCount: number) {
        return [...Array(columnCount).keys()];
    }
}

