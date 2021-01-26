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
    dataSource = null;
    displayedColumns = [];
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
                data[data.length - 1]['column' + j] = 'column' + j;
            }
        }

        this.dataSource = new MatTableDataSource(data);
        this.displayedColumns = ['checkbox'].concat(Object.keys(data[0])).filter(el => !['height'].includes(el));
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    columnProcess(columnCount: number) {
        return [...Array(columnCount).keys()];
    }

    console($event: WheelEvent, table: MatTable<any>) {
        // table['_elementRef'].nativeElement.scrollTop += $event.deltaY;
        table['_elementRef'].nativeElement.scrollBy({
            top: $event.deltaY,
            behavior: 'smooth'
        });
    }
}

