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
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {CdkPortal, CdkPortalOutlet} from '@angular/cdk/portal';
import {takeUntil} from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: `[isxRowAction]`,
  exportAs: 'isxRowAction',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    class: 'isx-row-action'
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
              private componentFactoryResolver: ComponentFactoryResolver) {
  }


  ngAfterContentInit(): void {
    const portal = new CdkPortalOutlet(this.componentFactoryResolver, this._viewContainerRef);
    const viewRef = portal.attachTemplatePortal(this.cdkPortal);
    this.renderer.appendChild(this.el.nativeElement, viewRef.rootNodes[0]);

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.el.nativeElement, 'mouseenter')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event: MouseEvent) => {
          if (this.allowMouseFollow) {
            let offsetX = 0;
            if (event.clientX + viewRef.rootNodes[0].clientWidth + this.offset > window.innerWidth) {
              // @ts-ignore
              offsetX = event.layerX - viewRef.rootNodes[0].clientWidth - this.offset;
            } else {
              // @ts-ignore
              offsetX = event.layerX + this.offset;
            }
            this.el.nativeElement.style.setProperty('--row-actions-translate-x', `${offsetX}px`);
          }
        });
    });

    viewRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
