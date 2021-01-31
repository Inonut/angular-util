import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {IsxColumnResizeCellDirective} from './isx-column-resize-cell.directive';

@Directive({
    selector: `[isx-column-resize-header]`,
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

        let resizeEl = this.renderer.createElement("div");
        this.renderer.addClass(resizeEl, "resize-column-icon");
        this.renderer.appendChild(this.el.nativeElement, resizeEl);

        this.ngZone.runOutsideAngular(() => {
            this.hammerEl = new Hammer(resizeEl);
            let initsize = 0;
            this.hammerEl.on("panstart", (event) => initsize = this.el.nativeElement.clientWidth);
            this.hammerEl.on("panleft", (event) => this.columnResizeDirective.resizeStream.next({
                size: this.getPanLeftSize(event.deltaX, initsize),
                name: this.name
            }));
            this.hammerEl.on("panright", (event) => this.columnResizeDirective.resizeStream.next({
                size: this.getPanRightSize(event.deltaX, initsize),
                name: this.name
            }));
            this.hammerEl.on("panend", (event) => this.columnResizeDirective.endResizeStream.next({
                size: this.getPanEndSize(event.deltaX, initsize),
                name: this.name
            }));
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.hammerEl.off("panstart");
        this.hammerEl.off("panleft");
        this.hammerEl.off("panright");
        this.hammerEl.off("panend");
    }

    getPanLeftSize(deltaX: number, initsize: number) {
        let computedStyle = window.getComputedStyle(this.el.nativeElement);
        let computedMinSize = computedStyle["minWidth"];
        let minsize;
        if (computedMinSize) {
            minsize = parseInt(computedMinSize);
        }

        return minsize ? Math.max(initsize + deltaX, minsize) : initsize + deltaX;
    }

    getPanRightSize(deltaX: number, initsize: number) {
        let computedStyle = window.getComputedStyle(this.el.nativeElement);
        let computedMaxSize = computedStyle["maxWidth"];
        let maxsize;
        if (computedMaxSize) {
            maxsize = parseInt(computedMaxSize);
        }

        return maxsize ? Math.min(initsize + deltaX, maxsize) : initsize + deltaX;
    }

    getPanEndSize(deltaX: number, initsize: number) {
        let computedStyle = window.getComputedStyle(this.el.nativeElement);
        //as minWidth and maxWidth are often dynamic, calculate this on event
        let computedMinSize = computedStyle["minWidth"];
        let computedMaxSize = computedStyle["maxWidth"];
        let minsize, maxsize;
        if (computedMinSize) {
            minsize = parseInt(computedMinSize);
        }
        if (computedMaxSize) {
            maxsize = parseInt(computedMaxSize);
        }

        return minsize ? Math.max(maxsize ? Math.min(maxsize, initsize + deltaX) : initsize + deltaX, minsize) : maxsize ? Math.min(maxsize, initsize + deltaX) : initsize + deltaX;
    }
}
