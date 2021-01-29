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
import {CdkColumnDragDirective} from './cdk-column-drag.directive';
import { MatColumnDef } from '@angular/material/table';
import {filter, takeUntil} from 'rxjs/operators';

@Directive({
    selector: `[cdk-column-drag-cell]`,
    exportAs: 'cdkColumnDragCell',
})
export class CdkColumnDragCellDirective implements OnInit, OnDestroy {
    name: string;
    protected unsubscribe = new Subject();

    constructor(@Optional() protected columnDragDirective: CdkColumnDragDirective,
                @Optional() public matColumnDef: MatColumnDef,
                public el: ElementRef,
                public renderer: Renderer2,
                protected ngZone: NgZone) {
    }

    @Input('cdk-column-drag-cell')
    set columnName(name: string) {
        this.name = name || this.matColumnDef.name;
    }

    ngOnInit(): void {
        this.columnDragDirective.add(this);

        this.ngZone.runOutsideAngular(() => {
            merge(this.columnDragDirective.leftDragStream, this.columnDragDirective.rightDragStream)
                .pipe(
                    takeUntil(this.unsubscribe),
                    filter(({name, event}) => name == this.name)
                )
                .subscribe(({event}) => {
                    this.renderer.addClass(this.el.nativeElement, "cdk-drag-column");
                    this.moveTo(event.deltaX);
                });

            this.columnDragDirective.dropStream
                .pipe(
                    takeUntil(this.unsubscribe),
                    filter(({name, event}) => name == this.name)
                )
                .subscribe(({event}) => this.renderer.removeClass(this.el.nativeElement, "cdk-drag-column"));
        });

        this.moveTo(0);
    }

    ngOnDestroy(): void {
        this.columnDragDirective.remove(this);
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
