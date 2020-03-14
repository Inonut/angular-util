import {Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Optional, Renderer2} from '@angular/core';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {MatColumnDef} from '@angular/material/table';
import {IsxColumnResizeDirective} from './isx-column-resize.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: `[isxColumnResizeCell]`,
  exportAs: 'isxColumnResizeCell',
})
export class IsxColumnResizeCellDirective implements OnInit, OnDestroy {
  name: string;
  private unsubscribe = new Subject();

  constructor(@Optional() protected isxColumnResizeDirective: IsxColumnResizeDirective,
              @Optional() public matColumnDef: MatColumnDef,
              public el: ElementRef,
              public renderer: Renderer2,
              protected ngZone: NgZone) {
  }

  @Input('isx-column-resize-cell')
  set columnName(name: string) {
    this.name = name || this.matColumnDef.name;
  }

  ngOnInit(): void {

    this.isxColumnResizeDirective.resizeStream
      .pipe(
        takeUntil(this.unsubscribe),
        filter(({name, size}) => name == this.name)
      )
      .subscribe(({size}) => {
        this.renderer.addClass(this.el.nativeElement, 'isx-resize-column');
        this.resize(size);
      });

    this.isxColumnResizeDirective.endResizeStream
      .pipe(
        takeUntil(this.unsubscribe),
        filter(({name, event}) => name == this.name)
      )
      .subscribe(({event}) => this.renderer.removeClass(this.el.nativeElement, 'isx-resize-column'));
  }

  resize(size: number) {
    this.renderer.setStyle(this.el.nativeElement, 'width', `${size}px`);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
