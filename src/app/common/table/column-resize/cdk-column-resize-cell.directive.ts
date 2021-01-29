import {Directive, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, Optional, Renderer2} from '@angular/core';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import { MatColumnDef } from '@angular/material/table';
import {CdkColumnResizeDirective} from './cdk-column-resize.directive';

@Directive({
    selector: `[cdk-column-resize-cell]`,
    exportAs: 'cdkColumnResizeCell',
})
export class CdkColumnResizeCellDirective implements OnInit, OnDestroy {
    name: string;
    private unsubscribe = new Subject();

    constructor(@Optional() protected columnResizeDirective: CdkColumnResizeDirective,
                @Optional() public matColumnDef: MatColumnDef,
                public el: ElementRef,
                public renderer: Renderer2,
                protected ngZone: NgZone) {
    }

    @Input('cdk-column-resize-cell')
    set columnName(name: string) {
        this.name = name || this.matColumnDef.name;
    }

    ngOnInit(): void {

        this.columnResizeDirective.resizeStream
            .pipe(
                takeUntil(this.unsubscribe),
                filter(({name, size}) => name == this.name)
            )
            .subscribe(({size}) => {
                this.renderer.addClass(this.el.nativeElement, "cdk-resize-column");
                this.resize(size);
            });

        this.columnResizeDirective.endResizeStream
            .pipe(
                takeUntil(this.unsubscribe),
                filter(({name, event}) => name == this.name)
            )
            .subscribe(({event}) => this.renderer.removeClass(this.el.nativeElement, "cdk-resize-column"));
    }

    resize(size: number) {
        this.renderer.setStyle(this.el.nativeElement, 'width', `${size}px`);
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
