import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject, combineLatest, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {map} from "rxjs/operators";
import {IsxListSelectionModel} from "./list-selection.model";

export class IsxTableDataSource<T> extends MatTableDataSource<T> {
    private _selectionModel = new IsxListSelectionModel<T>();
    sortedData: T[];

    _updateChangeSubscription() {
        const _sort: MatSort | null = this['_sort'];
        const _paginator: MatPaginator | null = this['_paginator'];
        const _internalPageChanges: Subject<void> = this['_internalPageChanges'];
        const _filter: BehaviorSubject<string> = this['_filter'];
        const _renderData: BehaviorSubject<T[]> = this['_renderData'];

        const sortChange: Observable<Sort | null | void> = _sort ?
            merge(_sort.sortChange, _sort.initialized) as Observable<Sort | void> :
            of(null);
        const pageChange: Observable<PageEvent | null | void> = _paginator ?
            merge(
                _paginator.page,
                _internalPageChanges,
                _paginator.initialized
            ) as Observable<PageEvent | void> :
            of(null);
        const dataStream: Observable<T[]> = this['_data'];
        const filteredData = combineLatest([dataStream, _filter])
            .pipe(map(([data]) => this._filterData(data)));
        const orderedData = combineLatest([filteredData, sortChange])
            .pipe(map(([data]) => {
                this.sortedData = this._orderData(data);
                this._selectionModel.data = this.sortedData;
                return this.sortedData;
            }));
        const paginatedData = combineLatest([orderedData, pageChange])
            .pipe(map(([data]) => this._pageData(data)));

        this._renderChangesSubscription?.unsubscribe();
        this._renderChangesSubscription = new Subscription();
        this._renderChangesSubscription = paginatedData.subscribe(data => _renderData.next(data));
    }

    withSelectionModel(selectionModel: IsxListSelectionModel<T>): IsxTableDataSource<T> {
        this._selectionModel = selectionModel;
        return this;
    }

    get selectionModel(): IsxListSelectionModel<T> {
        return this._selectionModel;
    }

}
