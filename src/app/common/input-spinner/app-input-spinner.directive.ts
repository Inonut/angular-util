import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {insertAfter} from '../utilities';

@Directive({
    selector: '[appInputSpinner]'
})
export class AppInputSpinnerDirective implements AfterViewInit, OnDestroy {

    @Input() left = -30;
    @Input() top = -4;
    @Input() showStream = new Subject();
    private unsubscribed = new Subject();
    private spennerEl: Element;

    constructor(private renderer: Renderer2,
                private el: ElementRef) {
    }

    ngAfterViewInit() {

        this.spennerEl = this.renderer.createElement('div') as Element;
        this.spennerEl.setAttribute('class', 'lds-spinner hidden');
        this.spennerEl.setAttribute('style', `left: ${this.left}px; top: ${this.top}px`);
        this.spennerEl.innerHTML = `<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>`;

        insertAfter(this.spennerEl, this.el.nativeElement);

        this.showStream
            .pipe(takeUntil(this.unsubscribed))
            .subscribe((toggle) => {
                if (!toggle) {
                    this.spennerEl.classList.add('hidden');
                } else {
                    this.spennerEl.classList.remove('hidden');
                }
            });
    }

    public ngOnDestroy(): void {
        this.unsubscribed.next();
        this.unsubscribed.complete();
    }
}
