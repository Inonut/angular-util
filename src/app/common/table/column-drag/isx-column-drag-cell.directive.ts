import {
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2
} from '@angular/core';
import {merge, Subject} from 'rxjs';
import {IsxColumnDragDirective} from './isx-column-drag.directive';
import { MatColumnDef } from '@angular/material/table';
import {filter, takeUntil} from 'rxjs/operators';

@Directive({
    selector: `[isx-column-drag-cell]`,
    exportAs: 'isxColumnDragCell',
})
export class IsxColumnDragCellDirective implements OnInit, OnDestroy {
    name: string;
    protected unsubscribe = new Subject();

    constructor(@Optional() protected isxColumnDragDirective: IsxColumnDragDirective,
                @Optional() public matColumnDef: MatColumnDef,
                public el: ElementRef,
                public renderer: Renderer2,
                protected ngZone: NgZone) {
    }

    @Input('isx-column-drag-cell')
    set columnName(name: string) {
        this.name = name || this.matColumnDef.name;
    }

    ngOnInit(): void {
        this.isxColumnDragDirective.add(this);

        this.ngZone.runOutsideAngular(() => {
            merge(this.isxColumnDragDirective.leftDragStream, this.isxColumnDragDirective.rightDragStream)
                .pipe(
                    takeUntil(this.unsubscribe),
                    filter(({name, event}) => name == this.name)
                )
                .subscribe(({event}) => {
                    this.renderer.addClass(this.el.nativeElement, "isx-drag-column");
                    this.moveTo(event.deltaX);
                });

            this.isxColumnDragDirective.dropStream
                .pipe(
                    takeUntil(this.unsubscribe),
                    filter(({name, event}) => name == this.name)
                )
                .subscribe(({event}) => this.renderer.removeClass(this.el.nativeElement, "isx-drag-column"));
        });

        this.moveTo(0);
    }

    ngOnDestroy(): void {
        this.isxColumnDragDirective.remove(this);
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    moveTo(distance: number, fromCurrentPos = false) {
        let origin = 0;
        if (fromCurrentPos) {
            origin = this.offset;
        }

        this.renderer.setStyle(this.el.nativeElement, "transform", `translateX(${origin + distance}px)`);
    }

    get offset(): number {
        return parseInt(this.el.nativeElement.style.transform.replace('translateX(', '')) || 0;
    }

}
