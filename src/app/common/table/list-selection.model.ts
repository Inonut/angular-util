import {Subject} from 'rxjs';
import {IsxSelectionModel} from "./selection.model";

export class IsxListSelectionModel<T> extends IsxSelectionModel<T>{
    private _data: T[];
    firstLineUp = new Subject();
    private isLineSelected = false;
    private lastElement: T;

    set data(value: T[]) {
        this._data = value;
    }

    get isSelectedAll() {
        if (this._data.length == 0) {
            return false;
        }

        return this.selected.length == this._data.length && !this.isLineSelected;
    }

    get isSelectedPartial() {
        return this.selected.length != this._data.length && this.selected.length > 0 && !this.isLineSelected;
    }

    get isData() {
        return this._data && this._data && this._data.length != 0;
    }

    get lastSelected() {
        return this.lastElement;
    }

    selectLine(item: T) {
        this.toggleSelect([item]);
        this.isLineSelected = true;
        this.lastElement = item;
    }

    toggleAllCheck(checked: boolean) {
        if (checked) {
            this.select([...this._data]);
        } else {
            this.clear();
        }
        this.isLineSelected = false;
    }

    toggleCheck(item: T) {
        if (this.isLineSelected) {
            this.toggleSelect([item]);
        } else {
            this.toggle(item);
        }
        this.isLineSelected = false;
        this.lastElement = item;
    }

    selectFirstElement() {
        this.selectLine(this._data[0]);
    }

    selectPrevElement() {
        let index = this._data.indexOf(this.lastElement);
        if (index == -1) {
            this.selectLine(this._data[0]);
        } else {
            if (index == 0) {
                this.firstLineUp.next();
            } else {
                this.selectLine(this._data[index - 1]);
            }
        }
    }

    selectNextElement() {
        let index = this._data.indexOf(this.lastElement);
        if (index == -1) {
            this.selectLine(this._data[0]);
        } else {
            if (index != this._data.length - 1) {
                this.selectLine(this._data[index + 1]);
            }
        }
    }

    isSelectedCheck(row: T) {
        return this.isSelected(row) && !this.isLineSelected;
    }

    isSelectedLine(row: T) {
        return this.isSelected(row) && this.isLineSelected;
    }
}