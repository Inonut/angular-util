import {AfterContentInit, Directive, ElementRef, Host, Input, OnDestroy, Renderer2} from "@angular/core";
import {MatTable} from "@angular/material/table";
import {fromEvent, isObservable, Observable, of, Subject, timer} from "rxjs";
import {debounceTime, map, startWith, switchMap, takeUntil, tap} from "rxjs/operators";
import {isDataSource} from "@angular/cdk/collections";

@Directive({
    selector: '[cdk-table-virtual-scroll-fixed-size]',
    exportAs: 'cdkTableVirtualScrollFixedSize'
})
export class CdkTableVirtualScrollFixedSizeDirective<T> implements AfterContentInit, OnDestroy {
    private unsubscribe = new Subject();
    private readonly defaultRowHeight = 30;
    private readonly datasetIndex = 'cdkindex';
    private cacheData: T[] | readonly T[] = [];
    private index = 0;

    private fakeContainerScrollEl: any;
    private fakeScrollEl: any;
    private containerEl: any;

    private renderRowsStream = new Subject();
    private connectScrollBarStream = new Subject();
    private preventScrollBarStream = new Subject();

    @Input() buffer: number = -1;

    constructor(private tableEl: ElementRef,
                private renderer: Renderer2,
                @Host() private table: MatTable<T>) {

        this.containerEl = this.renderer.createElement('div');
        this.renderer.addClass(this.containerEl, 'cdk-table-virtual-scroll');
        this.renderer.insertBefore(this.tableEl.nativeElement.parentElement, this.containerEl, this.tableEl.nativeElement);
        this.renderer.appendChild(this.containerEl, this.tableEl.nativeElement);
        this.fakeContainerScrollEl = this.renderer.createElement('div');
        this.renderer.addClass(this.fakeContainerScrollEl, 'scrollable');
        this.renderer.appendChild(this.containerEl, this.fakeContainerScrollEl);
        this.fakeScrollEl = this.renderer.createElement('div');
        this.renderer.addClass(this.fakeScrollEl, 'fake-height');
        this.renderer.appendChild(this.fakeContainerScrollEl, this.fakeScrollEl);

        let that = this;
        let oldRenderRows = this.table['renderRows'];
        this.table['renderRows'] = function () {
            let render = (start, end) => {
                this._data = that.cacheData.slice(start, end);
                oldRenderRows.bind(this)();

                let rows = [...that.tableEl.nativeElement.children];

                let startIndex = rows.filter(el => el.classList.contains('mat-row')).findIndex((el, i) => el.dataset[that.datasetIndex] == null);
                if (startIndex == 0) {
                    startIndex = rows.filter(el => el.classList.contains('mat-header-row')).length;
                } else {
                    startIndex = rows.length - (end - start) - 1;
                }
                rows.forEach((el, i) => {
                    if (rows[i].classList.contains('mat-row')) {
                        if (i >= startIndex && i <= startIndex + end - start) {
                            rows[i].dataset[that.datasetIndex] = start + i - startIndex;
                            rows[i].classList.remove('hidden');
                        } else {
                            rows[i].dataset[that.datasetIndex] = null;
                            rows[i].classList.add('hidden');
                        }
                    }
                });
            }
            let interval = that.processStartAndEnd();
            render(interval.start, interval.end);
        }

        let oldObserveRenderChanges = this.table['_observeRenderChanges'];
        this.table['_observeRenderChanges'] = function () {

            if (!this.dataSource) {
                return;
            }

            let dataStream: Observable<T[] | ReadonlyArray<T>> | undefined;

            if (isDataSource(this.dataSource)) {
                dataStream = this.dataSource.connect(this);
            } else if (isObservable(this.dataSource)) {
                dataStream = this.dataSource;
            } else if (Array.isArray(this.dataSource)) {
                dataStream = of(this.dataSource);
            }

            this._renderChangeSubscription = dataStream.pipe(takeUntil(this._onDestroy))
                .subscribe(data => that.cacheData = data);

            oldObserveRenderChanges.bind(this)();

            this.renderRows();
            that.renderer.setStyle(that.fakeScrollEl, 'height', that.processScrollHeight() + 'px');
            that.syncVisibleScroll();
        }
    }

    ngAfterContentInit(): void {
        fromEvent(window, 'resize')
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.renderRowsStream.next();
            });

        fromEvent(this.tableEl.nativeElement, 'wheel')
            .pipe(
                map((ev: WheelEvent) => ev.deltaY),
                tap((deltaY) => {

                    let rowHeight = this.processRowHeight();
                    this.index += deltaY / rowHeight;
                    if (this.index < 0) {
                        this.index = 0;
                    }

                    let containerHeight = this.computeTableRealHeight();
                    if (this.index > this.cacheData.length - containerHeight / rowHeight) {
                        this.index = this.cacheData.length - containerHeight / rowHeight + 1;
                    }
                    this.index = Math.floor(this.index);

                    this.renderRowsStream.next();
                }),
                takeUntil(this.unsubscribe),
                switchMap(() => fromEvent(this.tableEl.nativeElement, 'scroll').pipe(takeUntil(timer(300)), tap(() => this.connectScrollBarStream.next()))),
                takeUntil(this.unsubscribe),
            )
            .subscribe(() => {
                this.preventScrollBarStream.next();
                this.syncVisibleScroll()
            });


        this.connectScrollBarStream
            .pipe(
                takeUntil(this.unsubscribe),
                debounceTime(300),
                startWith(null as object),
                switchMap(() => fromEvent(this.fakeContainerScrollEl, 'scroll').pipe(takeUntil(this.preventScrollBarStream))),
                takeUntil(this.unsubscribe),
                tap(() => {
                    let rowHeight = this.processRowHeight();
                    let index = this.fakeContainerScrollEl.scrollTop / rowHeight;
                    index = Math.ceil(index);

                    this.tableEl.nativeElement.scrollTop += (index - this.index) * (rowHeight * Math.random());
                    this.index = index;

                    this.renderRowsStream.next();
                }),
                debounceTime(100),
                takeUntil(this.unsubscribe),
            )
            .subscribe(() => {
                this.syncHiddenScroll();
            })

        this.renderRowsStream
            .pipe(
                takeUntil(this.unsubscribe),
            )
            .subscribe(() => {
                this.table.renderRows();
            });

    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    scrollIntoView(data: T) {
        let rowHeight = this.processRowHeight();
        let containerHeight = this.computeTableRealHeight();

        this.index = Math.min(this.cacheData.indexOf(data), Math.floor(this.cacheData.length - containerHeight / rowHeight + 1));
        this.renderRowsStream.next();

        this.preventScrollBarStream.next();

        setTimeout(() => {
            this.syncHiddenScroll();
            this.syncVisibleScroll();
        }, 100);

        setTimeout(() => {
            this.connectScrollBarStream.next();
        }, 300);
    }

    elementByData(data: T) {
        return [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row'))[this.cacheData.indexOf(data) - this.processStartAndEnd().start];
    }

    private processRowHeight() {
        let elRows = [...this.containerEl.getElementsByClassName('cdk-row')];
        let rowHeight = this.defaultRowHeight;

        if (elRows.length != 0) {
            rowHeight = elRows.reduce((sum, el) => sum += el.offsetHeight, 0) / elRows.length;
        }

        return rowHeight;
    }

    private processHeaderHeight() {
        return [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-header-row')).reduce((sum, el) => sum += el.offsetHeight, 0);
    }

    private processFooterHeight() {
        return [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-footer-row')).reduce((sum, el) => sum += el.offsetHeight, 0);
    }

    private processScrollHeight() {
        return this.cacheData.length * this.processRowHeight() + this.processHeaderHeight() + this.processFooterHeight();
    }

    private processStartAndEnd() {
        let rowHeight = this.processRowHeight();
        let amount = this.containerEl.clientHeight / rowHeight;
        let index = this.index;
        let bufferRows = this.buffer;
        if (bufferRows < 0) {
            bufferRows = amount * 0.2 + 1;
        }
        index -= bufferRows;
        amount += bufferRows;

        if (index < 0) {
            index = 0;
        }

        return {
            start: Math.floor(index),
            end: Math.min(Math.ceil(index + amount), this.cacheData.length)
        }
    }

    private computeTableRealHeight() {
        return this.tableEl.nativeElement.clientHeight - this.processHeaderHeight() - this.processFooterHeight();
    }

    private syncVisibleScroll() {
        if (this.tableEl.nativeElement.scrollTop == 0 && this.processStartAndEnd().start > 0) {
            this.tableEl.nativeElement.scrollTop += this.processRowHeight();
        }
        if (this.tableEl.nativeElement.scrollTop + this.tableEl.nativeElement.clientHeight > this.tableEl.nativeElement.scrollHeight - 1 && this.processStartAndEnd().end < this.cacheData.length - 1) {
            this.tableEl.nativeElement.scrollTop -= this.processRowHeight();
        }

        this.fakeContainerScrollEl.scrollTop = (this.processStartAndEnd().start + [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row') && el.dataset.cdkindex != 'null').findIndex(el => el.getBoundingClientRect().top >= this.processHeaderHeight())) * this.processRowHeight();
    }

    private syncHiddenScroll() {
        let rowHeight = this.processRowHeight();
        this.tableEl.nativeElement.scrollTop = [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row')).findIndex(el => el.dataset.cdkindex == this.index) * rowHeight;
    }
}
