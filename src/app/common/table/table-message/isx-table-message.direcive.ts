import {Directive, ElementRef, Host, Input, OnInit, Renderer2} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {MatTable} from "@angular/material/table";
import {UnsubscribeCapableComponent} from "../../../../support/component/unsubscribe-capable.component";
import {IsxTableDataSource} from "../isx-table-data-source.model";
import {LoadingSpinnerModel} from "../../../../domain/model/loading-spinner.model";
import {combineLatest} from "rxjs";

@Directive({
    selector: `[isx-table-message]`,
    exportAs: 'isxTableMessage',
    host: {
        'class': 'isx-table-message'
    }
})
export class IsxTableMessageDirecive extends UnsubscribeCapableComponent implements OnInit {

    private messageDiv: Element;

    @Input('isx-table-message')
    set message(text: string) {
        if(this.messageDiv) {
            this.messageDiv.innerHTML = text;
        }
    }

    constructor(@Host() private host: MatTable<any>,
                private el: ElementRef,
                private loadingSpinnerModel: LoadingSpinnerModel,
                private renderer: Renderer2) {
        super();

        this.messageDiv = this.renderer.createElement('div');
        this.renderer.addClass(this.messageDiv, 'isx-message-placeholder');
        this.renderer.addClass(this.messageDiv, 'hidden');
        this.renderer.appendChild(this.el.nativeElement, this.messageDiv);
    }

    ngOnInit(): void {
        combineLatest([(this.host.dataSource as IsxTableDataSource<any>).connect(), this.loadingSpinnerModel.loadingEvent])
            .pipe(
                takeUntil(this.unsubscribed)
            )
            .subscribe(([data, spinner]) => {
                if((data == null || data.length == 0) && !spinner) {
                    this.renderer.removeClass(this.messageDiv, 'hidden');
                } else {
                    this.renderer.addClass(this.messageDiv, 'hidden');
                }
            })
    }
}
