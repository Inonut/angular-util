import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input, OnDestroy,
  Output,
  QueryList
} from '@angular/core';
import {debounceTime, map, switchMap, takeUntil} from 'rxjs/operators';
import {DragDrop} from '@angular/cdk/drag-drop';
import {MatTab} from '@angular/material/tabs';
import {Observable, Subject} from 'rxjs';

@Directive({
  selector: '[appTabDrag]',
  exportAs: 'appTabDrag'
})
export class AppTabDragDirective implements AfterViewInit, OnDestroy {

  private unsubscribed = new Subject();

  @ContentChildren(forwardRef(() => MatTab)) _draggables: QueryList<MatTab>;

  @Input() firstFixedTabs = 0;

  @Output() dropTab = new EventEmitter();

  @HostBinding('class.app-tab-drag') tabDragClass = true;

  constructor(private dragDrop: DragDrop,
              private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    let draggableItemList = [];
    const dragList = this.dragDrop.createDropList(this.el.nativeElement.getElementsByClassName('mat-tab-labels').item(0))
      .withOrientation('horizontal');

    this._draggables.changes
      .pipe(
        takeUntil(this.unsubscribed),
        debounceTime(1),
        map(() => {
          const newDraggableItemList = [];
          const elems = this.el.nativeElement.getElementsByClassName('mat-tab-label');
          for (let index = 0; index < elems.length; index++) {
            const element = draggableItemList.find(el => el.data == elems.item(index));
            if (!element) {
              const drag = this.dragDrop.createDrag(elems.item(index));
              drag.lockAxis = 'x';
              drag.data = elems.item(index);
              if (index < this.firstFixedTabs) {
                drag.disabled = true;
                elems.item(index).classList.add('cdk-drag-disabled');
              }
              newDraggableItemList.push(drag);
            } else {
              newDraggableItemList.push(element);
            }
          }

          draggableItemList.filter(el => !newDraggableItemList.includes(el)).forEach(el => el.dispose());
          draggableItemList = newDraggableItemList;

          dragList.withItems(draggableItemList);
          return dragList;
        }),
        switchMap((dragList) => dragList.dropped)
      )
      .subscribe((event) => {
        if (event.currentIndex < this.firstFixedTabs) {
          event.currentIndex = this.firstFixedTabs;
        }
        this.dropTab.emit(event);
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribed.next();
    this.unsubscribed.complete();
  }
}
