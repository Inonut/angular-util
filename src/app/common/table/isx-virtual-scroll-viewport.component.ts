import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Inject,
  Input,
  IterableDiffers,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, merge, of, Subject, timer} from 'rxjs';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {debounceTime, filter, mapTo, startWith, switchMap, switchMapTo, take, takeUntil, tap} from 'rxjs/operators';
import {TableVirtualScrollStrategy} from './isx-virtual-scroll-viewport.service';
import {IsxTableDataSource} from './isx-table-data-source.model';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[isxVirtualScrollViewport]',
  exportAs: 'isxVirtualScrollViewport',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    class: 'isx-table-virtual-scroll-viewport'
  }
})
// tslint:disable-next-line:directive-class-suffix
export class IsxVirtualScrollViewportComponent<T> implements OnDestroy, AfterViewInit, OnInit, AfterContentInit, AfterContentChecked {
  resetDataSourceStream = new BehaviorSubject<IsxTableDataSource<T>>(null);
  scrollIntoViewStream = new Subject<T>();
  viewPort: CdkVirtualScrollViewport;
  scrolledDataSource = new MatTableDataSource<T>();
  @Input() pageSize = 100;
  @Output() fetchNextPage = new EventEmitter();
  @Output() viewPortScroll = new EventEmitter();
  private unsubscribe = new Subject();
  private resizeStream = new Subject();
  private contentCheckedStream = new Subject();
  private noMoreData = false;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private _viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private _differs: IterableDiffers,
              private renderer: Renderer2,
              private el: ElementRef,
              @Inject(VIRTUAL_SCROLL_STRATEGY) public readonly scrollStrategy: TableVirtualScrollStrategy,
              @Host() private host: MatTable<T>,
              protected ngZone: NgZone) {
  }

  @Input()
  set dataSource(source: IsxTableDataSource<T>) {
    this.host.dataSource = this.scrolledDataSource;
    this.resetDataSourceStream.next(source);
  }

  ngOnInit(): void {
    const portal = new CdkPortalOutlet(this.componentFactoryResolver, this._viewContainerRef);
    const cdkVirtualScrollViewport = new ComponentPortal(CdkVirtualScrollViewport);
    const cdkVirtualScrollViewportRef = portal.attachComponentPortal(cdkVirtualScrollViewport);
    this.renderer.appendChild(this.el.nativeElement, cdkVirtualScrollViewportRef.location.nativeElement);
    this.renderer.appendChild(cdkVirtualScrollViewportRef.instance._contentWrapper.nativeElement, this.host._rowOutlet.elementRef.nativeElement);

    const headerContainer = this.renderer.createElement('div');
    this.renderer.addClass(headerContainer, 'isx-table-header-container');
    this.renderer.insertBefore(this.el.nativeElement, headerContainer, cdkVirtualScrollViewportRef.location.nativeElement);
    const headerDivForCssFix = this.renderer.createElement('div');
    this.renderer.addClass(headerDivForCssFix, 'content-wrapper');
    this.renderer.appendChild(headerContainer, headerDivForCssFix);
    this.renderer.appendChild(headerDivForCssFix, this.host._headerRowOutlet.elementRef.nativeElement);

    // footer not tested
    const footerContainer = this.renderer.createElement('div');
    this.renderer.addClass(footerContainer, 'isx-table-footer-container');
    this.renderer.appendChild(this.el.nativeElement, footerContainer);
    const footerDivForCssFix = this.renderer.createElement('div');
    this.renderer.addClass(footerDivForCssFix, 'content-wrapper');
    this.renderer.appendChild(footerContainer, footerDivForCssFix);
    this.renderer.appendChild(footerDivForCssFix, this.host._footerRowOutlet.elementRef.nativeElement);


    this.viewPort = cdkVirtualScrollViewportRef.instance;
  }

  /*ngDoCheck() {
    console.log(performance.now());
  }*/

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const resizeStream = merge(fromEvent(window, 'resize'), this.resizeStream)
        .pipe(
          startWith(null as object),
          takeUntil(this.unsubscribe),
          tap(() => this.scrollStrategy.updateContent()),
          tap(() => this.updateOffsetScroll()),
          tap(() => this.updateContentSize())
        );

      const dataSource = this.resetDataSourceStream
        .pipe(
          filter(source => source != null),
          takeUntil(this.unsubscribe),
          switchMap(source => source.connect()),
          takeUntil(this.unsubscribe),
          tap(() => this.updateOffsetScroll()),
          tap(() => this.updateContentSize())
        );

      const scrolledDataSourceChanged = combineLatest([
        dataSource.pipe(tap(() => this.scrollStrategy.updateContent(true)), tap(() => this.noMoreData = false)),
        this.scrollStrategy.scrolledIndexChange.pipe(tap(() => this.viewPortScroll.emit())),
        resizeStream
      ]);

      scrolledDataSourceChanged
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, scrolledindex]) => {
          this.scrolledDataSource.data = data.slice(this.scrollStrategy.start, this.scrollStrategy.end);
        });

      this.scrollIntoViewStream
        .pipe(
          takeUntil(this.unsubscribe),
          switchMap((item) => {
            if (!this.scrolledDataSource.data.includes(item)) {
              this.viewPort.scrollToIndex(this.resetDataSourceStream.getValue().sortedData.indexOf(item) - 1, 'auto');
              return scrolledDataSourceChanged.pipe(take(1), switchMap(() => timer(100)), take(1), mapTo(item));
            } else {
              return of(item);
            }
          }),
          takeUntil(this.unsubscribe)
        )
        .subscribe((item) => {
          this.host._getRenderedRows(this.host._rowOutlet)[this.scrolledDataSource.data.indexOf(item)]
            .scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'nearest'});
        });

      fromEvent(this.viewPort.elementRef.nativeElement, 'scroll')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event) => {
          this.updateHeaderAndFooterScroll();
        });

      fromEvent(this.viewPort.elementRef.nativeElement, 'scroll')
        .pipe(
          takeUntil(this.unsubscribe),
          debounceTime(100),
          switchMapTo(of(null)),
          filter(() => !this.noMoreData && this.viewPort.elementRef.nativeElement.scrollTop && this.viewPort.elementRef.nativeElement.scrollTop + this.viewPort.elementRef.nativeElement.clientHeight == this.viewPort.elementRef.nativeElement.scrollHeight)
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.noMoreData = true;
            this.fetchNextPage.next(Math.ceil(this.scrollStrategy.end / this.pageSize) * this.pageSize);
          });
        });

      this.contentCheckedStream
        .pipe(
          takeUntil(this.unsubscribe),
          debounceTime(1),
          switchMapTo(of(null))
        )
        .subscribe(() => {
          this.updateContentSize();
        });
    });
  }

  ngAfterContentChecked(): void {
    this.contentCheckedStream.next();
  }

  updateHeaderAndFooterScroll() {
    this.el.nativeElement.style.setProperty('--table-translate-x', `${-this.viewPort.elementRef.nativeElement.scrollLeft}px`);
  }

  scrollIntoView(item: T) {
    this.scrollIntoViewStream.next(item);
  }

  scrollTop() {
    this.viewPort.scrollToIndex(0);
  }

  updateContent() {
    this.resizeStream.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private updateOffsetScroll() {
    let offset = 0;
    if (this.viewPort.getViewportSize() < this.viewPort.measureRenderedContentSize()) {
      offset = 7; // scroll width
    }
    this.el.nativeElement.style.setProperty('--table-offset-scroll', `${offset}px`);
  }

  private updateContentSize() {
    if (this.scrolledDataSource.data.length == 0 && this.host._headerRowOutlet.elementRef.nativeElement.nextElementSibling) {
      this.el.nativeElement.style.setProperty('--table-width', `${this.host._headerRowOutlet.elementRef.nativeElement.nextElementSibling.clientWidth - 7}px`);
    } else {
      this.el.nativeElement.style.removeProperty('--table-width');
    }
  }
}
