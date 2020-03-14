import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  DoCheck,
  IterableDiffers,
  NgZone,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {CdkVirtualForOf, CdkVirtualForOfContext} from '@angular/cdk/scrolling';
import {CollectionViewer, ListRange} from '@angular/cdk/collections';
import {Observable, Subject} from 'rxjs';
import {IsxVirtualScrollViewportComponent} from './isx-virtual-scroll-viewport.component';
import {takeUntil} from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[isxVirtualFor]',
})
export class IsxVirtualForDirective<T> implements CollectionViewer, DoCheck, OnDestroy, AfterViewInit {
  viewChange: Observable<ListRange>;
  private unsubscribe = new Subject();
  private virtualForDirective: CdkVirtualForOf<T>;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private _viewContainerRef: ViewContainerRef,
              private _template: TemplateRef<CdkVirtualForOfContext<T>>,
              private _differs: IterableDiffers,
              @Optional() private viewScroll: IsxVirtualScrollViewportComponent<T>,
              protected ngZone: NgZone) {
  }

  ngAfterViewInit(): void {
    this.virtualForDirective = new CdkVirtualForOf<T>(this._viewContainerRef, this._template, this._differs, this.viewScroll.viewPort, this.ngZone);

    this.viewScroll.resetDataSourceStream
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((source) => {
        this.virtualForDirective.cdkVirtualForOf = source;
      });

  }

  ngDoCheck(): void {
    this.virtualForDirective && this.virtualForDirective.ngDoCheck();
  }

  ngOnDestroy(): void {
    this.virtualForDirective && this.virtualForDirective.ngOnDestroy();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
