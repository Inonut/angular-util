import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {IsxColumnResizeCellDirective} from './isx-column-resize-cell.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: `[isxColumnResizeHeader]`,
  exportAs: 'isxColumnResizeHeader',
})
export class IsxColumnResizeHeaderDirective extends IsxColumnResizeCellDirective implements OnInit, OnDestroy {

  private hammerEl: HammerManager;

  @Input('isx-column-resize-header')
  set columnName(name: string) {
    this.name = name || this.matColumnDef.name;
  }

  ngOnInit(): void {
    super.ngOnInit();

    const resizeEl = this.renderer.createElement('div');
    this.renderer.addClass(resizeEl, 'resize-column-icon');
    this.renderer.appendChild(this.el.nativeElement, resizeEl);

    this.ngZone.runOutsideAngular(() => {
      this.hammerEl = new Hammer(resizeEl);
      let initsize = 0;
      this.hammerEl.on('panstart', (event) => initsize = this.el.nativeElement.clientWidth);
      this.hammerEl.on('panleft', (event) => this.isxColumnResizeDirective.resizeStream.next({
        size: initsize + event.deltaX,
        name: this.name
      }));
      this.hammerEl.on('panright', (event) => this.isxColumnResizeDirective.resizeStream.next({
        size: initsize + event.deltaX,
        name: this.name
      }));
      this.hammerEl.on('panend', (event) => this.isxColumnResizeDirective.endResizeStream.next({
        size: initsize + event.deltaX,
        name: this.name
      }));
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.hammerEl.off('panstart');
    this.hammerEl.off('panleft');
    this.hammerEl.off('panright');
    this.hammerEl.off('panend');
  }
}
