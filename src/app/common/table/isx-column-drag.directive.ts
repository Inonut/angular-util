import {Directive, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';
import {takeUntil} from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: `[isxColumnDrag]`,
  exportAs: 'isxColumnDrag',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    class: 'isx-table-drag-and-drop'
  }
})
export class IsxColumnDragDirective implements OnInit, OnDestroy {
  leftDragStream = new Subject();
  rightDragStream = new Subject();
  startDragStream = new Subject();
  dropStream = new Subject();
  @Output() dropColumn = new EventEmitter();
  private unsubscribe = new Subject();
  private columnsCache: { [name: string]: Array<IsxColumnDragCellDirective> } = {};
  private newOrder = [];
  private currentOrder = [];
  private added = 0;

  constructor(private ngZone: NgZone) {
  }

  @Input()
  set isxColumnDrag(val: string[]) {
    this.currentOrder = val;
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.leftDragStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {
          if (this.newOrder.indexOf(name) != 0) {
            const colName = this.newOrder[this.newOrder.indexOf(name) - 1];

            if (this.columnsCache[colName] && -event.deltaX > this.processColumnWidth(colName) / 2 + this.added) {
              this.columnsCache[colName].forEach(directive => directive.moveTo(this.processColumnWidth(name), true));
              this.swap(this.newOrder.indexOf(name), this.newOrder.indexOf(name) - 1);
              this.added += this.processColumnWidth(colName);
            }
          }
        });

      this.rightDragStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {
          if (this.newOrder.indexOf(name) != this.newOrder.length - 1) {
            const colName = this.newOrder[this.newOrder.indexOf(name) + 1];

            if (this.columnsCache[colName] && event.deltaX > this.processColumnWidth(colName) / 2 - this.added) {
              this.columnsCache[colName].forEach(directive => directive.moveTo(-this.processColumnWidth(name), true));
              this.swap(this.newOrder.indexOf(name), this.newOrder.indexOf(name) + 1);
              this.added -= this.processColumnWidth(colName);
            }
          }
        });

      this.startDragStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => this.newOrder = this.currentOrder.slice());

      this.dropStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {

          this.columnsCache[name].forEach(directive => directive.moveTo(-this.added));
          this.added = 0;

          setTimeout(() => this.dropColumn.emit(this.newOrder));
        });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  add(directive: IsxColumnDragCellDirective) {
    this.columnsCache[directive.name] = this.columnsCache[directive.name] || [];
    this.columnsCache[directive.name].push(directive);
  }

  remove(directive: IsxColumnDragCellDirective) {
    this.columnsCache[directive.name] = this.columnsCache[directive.name] || [];
    this.columnsCache[directive.name].splice(this.columnsCache[directive.name].indexOf(directive), 1);

    if (this.columnsCache[directive.name].length == 0) {
      delete this.columnsCache[directive.name];
    }
  }

  private processColumnWidth(name: string) {
    if (name == null || this.columnsCache[name][0] == null) {
      return null;
    }
    return this.columnsCache[name][0].el.nativeElement.clientWidth;
  }

  private swap(index1, index2) {
    [this.newOrder[index1], this.newOrder[index2]] = [this.newOrder[index2], this.newOrder[index1]];
  }
}
