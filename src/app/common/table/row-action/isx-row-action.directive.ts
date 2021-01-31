import {
    AfterContentInit,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {CdkPortal, CdkPortalOutlet} from '@angular/cdk/portal';
import {debounceTime, takeUntil, tap} from 'rxjs/operators';
import {MatSort} from "@angular/material/sort";
import {MatTable} from "@angular/material/table";

@Directive({
    selector: `[isx-row-action]`,
    exportAs: 'isxRowAction',
    host: {
        'class': 'isx-row-action'
    }
})
export class IsxRowActionDirective implements AfterContentInit, OnDestroy {
    @ContentChild(CdkPortal, {static: true}) cdkPortal: CdkPortal;
    @Input() allowMouseFollow = true;
    @Input() offset = 30;
    private unsubscribe = new Subject();

    constructor(private _viewContainerRef: ViewContainerRef,
                private ngZone: NgZone,
                private el: ElementRef,
                private changeDetectorRef: ChangeDetectorRef,
                private renderer: Renderer2,
                @Optional() private matSort: MatSort,
                @Optional() private matTable: MatTable<any>,
                private componentFactoryResolver: ComponentFactoryResolver,) {
    }


    ngAfterContentInit(): void {
        let portal = new CdkPortalOutlet(this.componentFactoryResolver, this._viewContainerRef);
        let viewRef = portal.attachTemplatePortal(this.cdkPortal);
        this.renderer.appendChild(this.el.nativeElement, viewRef.rootNodes[0]);

        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.el.nativeElement, 'mouseenter')
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((event: MouseEvent) => {
                    if (this.allowMouseFollow) {
                        let offsetX = 0;
                        // @ts-ignore
                        if (event.clientX + viewRef.rootNodes[viewRef.rootNodes.length - 1].clientWidth + this.offset > this.matTable._elementRef.nativeElement.getBoundingClientRect().x + this.matTable._elementRef.nativeElement.clientWidth) {
                            // @ts-ignore
                            offsetX = event.layerX - viewRef.rootNodes[viewRef.rootNodes.length - 1].clientWidth - this.offset;
                        } else {
                            // @ts-ignore
                            offsetX = event.layerX + this.offset;
                        }
                        this.el.nativeElement.style.setProperty('--row-actions-translate-x', `${offsetX}px`);
                    }
                });
        });

        this.matSort && this.matSort.sortChange
            .pipe(
                takeUntil(this.unsubscribe),
                tap(() => viewRef.rootNodes[0].classList.add('hidden')),
                debounceTime(10)
            )
            .subscribe(() => {
                this.renderer.appendChild(this.el.nativeElement, viewRef.rootNodes[0]);
                viewRef.rootNodes[0].classList.remove('hidden');
            });

        viewRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}
