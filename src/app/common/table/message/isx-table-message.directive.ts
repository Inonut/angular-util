import {Directive, ElementRef, Host, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {MatTable} from "@angular/material/table";
import {BehaviorSubject, combineLatest, isObservable, Observable, of, Subject} from "rxjs";
import {isDataSource} from "@angular/cdk/collections";

@Directive({
    selector: `[isx-table-message]`,
    exportAs: 'isxTableMessage',
    host: {
        'class': 'isx-table-message'
    }
})
export class IsxTableMessageDirective {

    private messageDiv: Element;

    @Input('isx-table-message')
    set message(text: string) {
        if (this.messageDiv) {
            this.messageDiv.innerHTML = text;
        }
    }

    @Input() spinnerStream = new BehaviorSubject<boolean>(false);

    constructor(@Host() private host: MatTable<any>,
                private el: ElementRef,
                private renderer: Renderer2) {

        this.messageDiv = this.renderer.createElement('div');
        this.renderer.addClass(this.messageDiv, 'isx-message-placeholder');
        this.renderer.addClass(this.messageDiv, 'hidden');
        this.renderer.appendChild(this.el.nativeElement, this.messageDiv);

        let that = this;
        let oldObserveRenderChanges = this.host['_observeRenderChanges'];
        this.host['_observeRenderChanges'] = function () {

            if (!this.dataSource) {
                return;
            }

            // @ts-ignore
            let dataStream: Observable<T[] | ReadonlyArray<T>> | undefined;

            if (isDataSource(this.dataSource)) {
                dataStream = this.dataSource.connect(this);
            } else if (isObservable(this.dataSource)) {
                dataStream = this.dataSource;
            } else if (Array.isArray(this.dataSource)) {
                dataStream = of(this.dataSource);
            }

            combineLatest([dataStream, that.spinnerStream])
                .pipe(takeUntil(this._onDestroy))
                .subscribe(([data, spinner]) => {
                    if ((data == null || data.length == 0) && !spinner) {
                        that.renderer.removeClass(that.messageDiv, 'hidden');
                    } else {
                        that.renderer.addClass(that.messageDiv, 'hidden');
                    }
                });

            oldObserveRenderChanges.bind(this)();
        }
    }
}
