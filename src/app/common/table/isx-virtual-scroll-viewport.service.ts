import {Injectable} from '@angular/core';
import {CdkVirtualScrollViewport, VirtualScrollStrategy} from '@angular/cdk/scrolling';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

@Injectable()
export class TableVirtualScrollStrategy implements VirtualScrollStrategy {

  static BUFFER_SIZE = 20;
  scrolledIndexChange: Observable<number>;
  start: number;
  end: number;
  private rowHeight = 20;
  private indexChange = new Subject<number>();
  private viewport: CdkVirtualScrollViewport;

  constructor() {
    this.scrolledIndexChange = this.indexChange.asObservable().pipe(distinctUntilChanged());
  }

  public attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.onDataLengthChanged();
    this.updateContent();
  }

  public detach(): void {
    this.indexChange.complete();
    this.viewport = null;
  }

  public onContentScrolled(): void {
    this.updateContent();
  }

  public onDataLengthChanged(): void {
    if (this.viewport) {
      this.viewport.setTotalContentSize(this.viewport.getDataLength() * this.rowHeight);
    }
  }

  public onContentRendered(): void {
    // no-op
  }

  public onRenderedOffsetChanged(): void {
    // no-op
  }

  public scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this.viewport) {
      this.viewport.scrollToOffset(index * this.rowHeight, behavior);
    }
  }

  public setScrollHeight(rowHeight: number) {
    this.rowHeight = rowHeight;
    this.updateContent();
  }

  updateContent(silent = false) {
    if (this.viewport) {
      this.viewport.checkViewportSize();

      const newIndex = Math.max(0, Math.round(this.viewport.measureScrollOffset() / this.rowHeight) - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
      this.viewport.setRenderedContentOffset(this.rowHeight * newIndex);
      const scrolledIndex = Math.round(this.viewport.measureScrollOffset() / this.rowHeight);

      const range = Math.ceil(this.viewport.getViewportSize() / this.rowHeight) + TableVirtualScrollStrategy.BUFFER_SIZE / 2;
      this.start = Math.max(0, scrolledIndex - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
      this.end = Math.min(this.viewport.getDataLength(), scrolledIndex + range);

      !silent && this.indexChange.next(scrolledIndex);
    }
  }
}
