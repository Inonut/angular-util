import {Directive, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
    selector: `[cdkColumnResize]`,
    exportAs: 'cdkColumnResize',
    host: {
        'class': 'cdk-table-resize'
    }
})
export class CdkColumnResizeDirective implements OnInit, OnDestroy {
    resizeStream = new Subject();
    endResizeStream = new Subject();
    @Output() resize = new EventEmitter();
    private unsubscribe = new Subject();

    constructor(private ngZone: NgZone) {
    }

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this.endResizeStream
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((data) => {
                    this.resize.emit(data);
                });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
