import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: "app"
    }
})
export class AppComponent {
    data: any = [];
    dataSource: MatTableDataSource<any>;
    displayedColumns = [];
    sizeColumns = {};
    rowCount = 500;
    columnCount = 20;

    @ViewChild(MatSort) sort: MatSort;

    constructor(private changeDetectorRef: ChangeDetectorRef) {

        const data = [];
        for (let i = 0; i < this.rowCount; i++) {
            data.push({
                column0: i,
                height: Math.random() * 200
            });
            for (let j = 1; j < this.columnCount; j++) {
                data[data.length - 1]['column' + j] = Math.floor(Math.random() * 1000);
            }
        }

        this.dataSource = new MatTableDataSource(data.slice(0, 100));
        this.displayedColumns = ['checkbox'].concat(new Array(this.columnCount).fill(1).map((el, i) => 'column' + i)).filter(el => !['height'].includes(el));
        this.displayedColumns.forEach(el => this.sizeColumns[el] = 50);
        this.data = data;
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    columnProcess(columnCount: number) {
        return [...Array(columnCount).keys()];
    }

    console(a, b) {
        console.log(this.dataSource);
    }

    addNextData(index: number) {
        if(index % 100 > 30 && this.dataSource.data.length - index < 100 && index < 400) {
            this.dataSource.data = this.dataSource.data.concat(this.data.slice(Math.floor(index / 100 + 1) * 100, Math.floor(index / 100 + 2) * 100));
        }
    }
}

