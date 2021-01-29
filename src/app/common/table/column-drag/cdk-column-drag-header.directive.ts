import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {CdkColumnDragCellDirective} from './cdk-column-drag-cell.directive';

@Directive({
    selector: `[cdk-column-drag-header]`,
    exportAs: 'cdkColumnDragHeader',
})
export class CdkColumnDragHeaderDirective extends CdkColumnDragCellDirective implements OnInit, OnDestroy {

    private hammerEl: HammerManager;

    @Input('cdk-column-drag-header')
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
            this.hammerEl.on("panstart", (event) => this.columnDragDirective.startDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panleft", (event) => this.columnDragDirective.leftDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panright", (event) => this.columnDragDirective.rightDragStream.next({
                event,
                name: this.name
            }));
            this.hammerEl.on("panend", (event) => this.columnDragDirective.dropStream.next({
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
