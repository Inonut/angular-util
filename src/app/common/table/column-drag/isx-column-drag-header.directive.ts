import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';

@Directive({
    selector: `[isx-column-drag-header]`,
    exportAs: 'isxColumnDragHeader',
})
export class IsxColumnDragHeaderDirective extends IsxColumnDragCellDirective implements OnInit, OnDestroy {

    private hammerEl: HammerManager;

    @Input('isx-column-drag-header')
    set columnName(name: string) {
        this.name = name || this.matColumnDef.name;
    }

    ngOnInit(): void {
        super.ngOnInit();

        let dragContainer = this.renderer.createElement("div");
        this.renderer.addClass(dragContainer, "drag-column-container");
        this.renderer.appendChild(this.el.nativeElement, dragContainer);
        this.renderer.appendChild(dragContainer, this.el.nativeElement.firstChild);

        this.ngZone.runOutsideAngular(() => {
            this.hammerEl = new Hammer(dragContainer);
            this.hammerEl.on("panstart", (event) => this.isxColumnDragDirective.startDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panleft", (event) => this.isxColumnDragDirective.leftDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panright", (event) => this.isxColumnDragDirective.rightDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panend", (event) => this.isxColumnDragDirective.dropStream.next({
                event,
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
}
