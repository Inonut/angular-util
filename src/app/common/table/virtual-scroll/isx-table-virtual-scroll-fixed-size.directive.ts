import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    Host,
    Input,
    OnDestroy,
    Output,
    Renderer2
} from "@angular/core";
import {MatTable} from "@angular/material/table";
import {EMPTY, fromEvent, isObservable, Observable, of, Subject, timer} from "rxjs";
import {debounceTime, filter, startWith, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {isDataSource} from "@angular/cdk/collections";
import {findParentWithClasses} from "../../utilities";

@Directive({
    selector: '[isx-table-virtual-scroll-fixed-size]',
    exportAs: 'isxTableVirtualScrollFixedSize'
})
export class IsxTableVirtualScrollFixedSizeDirective<T> implements AfterContentInit, OnDestroy {
    private unsubscribe = new Subject();
    private readonly datasetIndex = 'isxindex';
    private cacheData: T[] | readonly T[] = [];
    private index = 0;

    private fakeContainerScrollEl: any;
    private fakeScrollEl: any;
    private containerEl: any;

    private renderRowsStream = new Subject();
    private preventScrollBarStream = new Subject();
    private readyStream = new Subject();

    @Input() buffer: number = -1;
    @Input('cdk-table-virtual-scroll-fixed-size') defaultRowHeight = 20;

    @Output() indexChanged = new EventEmitter();

    constructor(private tableEl: ElementRef,
                private renderer: Renderer2,
                @Host() private table: MatTable<T>) {

        this.renderer.setAttribute(this.tableEl.nativeElement, 'tabindex', '-1');
        this.containerEl = this.renderer.createElement('div');
        this.renderer.addClass(this.containerEl, 'isx-table-virtual-scroll');
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

                setTimeout(() => that.readyStream.next());
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

            dataStream
                .pipe(
                    takeUntil(this._onDestroy),
                    switchMap((data) => {
                        that.cacheData = data;
                        that.renderer.setStyle(that.fakeScrollEl, 'height', that.processScrollHeight() + 'px');
                        return that.readyStream.pipe(take(1));
                    }),
                    takeUntil(this._onDestroy),
                )
                .subscribe(data => {
                    that.preventScrollBarStream.next();
                    that.syncHiddenScroll();
                    that.syncVisibleScroll();
                });

            oldObserveRenderChanges.bind(this)();

            setTimeout(() => this.renderRows());
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
                tap((ev: WheelEvent) => {
                    let deltaY = ev.deltaY;
                    let rowHeight = this.processRowHeight();
                    this.setIndex(this.index + Math.sign(deltaY) * Math.max(Math.abs(deltaY), rowHeight) / rowHeight);
                }),
                takeUntil(this.unsubscribe),
                switchMap(() => {
                    return this.readyStream.pipe(takeUntil(timer(300)))
                }),
                takeUntil(this.unsubscribe),
            )
            .subscribe(() => {
                this.preventScrollBarStream.next();
                this.syncVisibleScroll();
            });

        fromEvent(window, 'keydown')
            .pipe(
                filter((ev: KeyboardEvent) => findParentWithClasses(document.activeElement, 'mat-table') == this.tableEl.nativeElement),
                takeUntil(this.unsubscribe),
                switchMap((ev: KeyboardEvent) => {
                    if(ev.key == 'PageDown' || ev.key == 'PageUp') {
                        ev.preventDefault();
                        let rowHeight = this.processRowHeight();
                        let containerHeight = this.computeTableRealHeight();
                        let sign = (ev.key == 'PageDown' ? 1 : -1);
                        this.setIndex(this.index + containerHeight / rowHeight * sign);

                        return this.readyStream;
                    }

                    return EMPTY;
                }),
                takeUntil(this.unsubscribe),
            )
            .subscribe((ev: KeyboardEvent) => {
                this.preventScrollBarStream.next();
                this.syncHiddenScroll();
                this.syncVisibleScroll();
                this.tableEl.nativeElement.focus();
            })


        let oldScrollTop = 0;
        this.preventScrollBarStream
            .pipe(
                takeUntil(this.unsubscribe),
                debounceTime(300),
                startWith(null as object),
                switchMap(() => fromEvent(this.fakeContainerScrollEl, 'scroll').pipe(takeUntil(this.preventScrollBarStream))),
                takeUntil(this.unsubscribe),
                switchMap(() => {
                    let rowHeight = this.processRowHeight();
                    let index = this.fakeContainerScrollEl.scrollTop / rowHeight;
                    index = Math.ceil(index);

                    this.tableEl.nativeElement.scrollTop += (index - this.index) * rowHeight * 0.2 || (this.fakeContainerScrollEl.scrollTop - oldScrollTop);
                    oldScrollTop = this.fakeContainerScrollEl.scrollTop;

                    if(this.index != index) {
                        this.setIndex(index);
                        return this.readyStream.pipe(takeUntil(this.preventScrollBarStream));
                    } else {
                        return EMPTY;
                    }
                }),
                takeUntil(this.unsubscribe),
                debounceTime(100),
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

        this.readyStream
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                let interval = this.processStartAndEnd();
                [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row')).forEach((el, i) => el.dataset[this.datasetIndex] = interval.start + i);
            })
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    scrollIntoView(data: T) {
        let rowHeight = this.processRowHeight();
        let containerHeight = this.computeTableRealHeight();

        this.setIndex(Math.min(this.cacheData.indexOf(data), Math.floor(this.cacheData.length - containerHeight / rowHeight + 1)));

        this.readyStream
            .pipe(take(1), takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.preventScrollBarStream.next();
                this.syncHiddenScroll();
                this.syncVisibleScroll();
                this.tableEl.nativeElement.focus();
            });
    }

    elementByData(data: T) {
        return [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row'))[this.cacheData.indexOf(data) - this.processStartAndEnd().start];
    }

    private processRowHeight() {
        let elRows = [...this.containerEl.getElementsByClassName('mat-row')];
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
        let amount = this.computeTableRealHeight() / rowHeight;
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
        this.fakeContainerScrollEl.scrollTop = (this.processStartAndEnd().start + [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row') && el.dataset[this.datasetIndex] != 'null').findIndex(el => el.getBoundingClientRect().top >= this.processHeaderHeight())) * this.processRowHeight();
    }

    private syncHiddenScroll() {
        let rowHeight = this.processRowHeight();
        this.tableEl.nativeElement.scrollTop = [...this.tableEl.nativeElement.children].filter(el => el.classList.contains('mat-row')).findIndex(el => el.dataset[this.datasetIndex] == this.index) * rowHeight;
    }

    private setIndex(index) {
        if (index < 0) {
            index = 0;
        }

        let rowHeight = this.processRowHeight();
        let containerHeight = this.computeTableRealHeight();
        if (index > this.cacheData.length - containerHeight / rowHeight) {
            index = this.cacheData.length - containerHeight / rowHeight + 1;
        }

        if(this.index != index) {
            this.index = Math.floor(index);
            this.indexChanged.emit(this.index);
        }

        if (this.tableEl.nativeElement.scrollTop == 0 && this.processStartAndEnd().start > 0) {
            this.tableEl.nativeElement.scrollTop += this.processRowHeight();
        }
        if (this.tableEl.nativeElement.scrollTop + this.tableEl.nativeElement.clientHeight > this.tableEl.nativeElement.scrollHeight - 1 && this.processStartAndEnd().end < this.cacheData.length - 1) {
            this.tableEl.nativeElement.scrollTop -= this.processRowHeight();
        }

        this.renderRowsStream.next();
    }
}
