import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Subject} from 'rxjs';
import {SelectionModel} from '../model/selection.model';

export class IsxTableDataSource<T> extends MatTableDataSource<T> {
  firstLineUp = new Subject();
  private isLineSelected = false;
  private lastElement: T;
  private selectionModel = new SelectionModel<T>(true);

  constructor(initialData?: T[]) {
    super(initialData);

    const oldSortData = this.sortData;
    this.sortData = (data: T[], sort: MatSort): T[] => {
      this.sortedData = oldSortData(data, sort);
      return this.sortedData;
    };

    let __sortData = this.sortData;
    Object.defineProperty(this, 'sortData', {
      get() {
        return __sortData;
      },
      set(sortData: any) {
        __sortData = (data: T[], sort: MatSort): T[] => {
          this.sortedData = sortData(data, sort);
          return this.sortedData;
        };
      },
    });
  }

  private _filteredData = [];

  get filteredData() {
    if (this._filteredData.length) {
      return this._filteredData;
    } else {
      return this.data;
    }
  }

  set filteredData(val: T[]) {
    this._filteredData = val;
  }

  private _sortedData = [];

  get sortedData() {
    if (this._sortedData.length) {
      return this._sortedData;
    } else {
      return this.data;
    }
  }

  set sortedData(val: T[]) {
    this._sortedData = val;
  }

  get isSelectedAll() {
    if (this.filteredData.length == 0) {
      return false;
    }

    return this.selectionModel.selected.length == this.filteredData.length && !this.isLineSelected;
  }

  get isSelectedPartial() {
    return this.selectionModel.selected.length != this.filteredData.length && this.selectionModel.selected.length > 0 && !this.isLineSelected;
  }

  get isData() {
    return this.filteredData && this.filteredData && this.filteredData.length != 0;
  }

  get lastSelected() {
    return this.lastElement;
  }

  withSelectionModel(selectionModel: SelectionModel<T>): IsxTableDataSource<T> {
    this.selectionModel = selectionModel;
    return this;
  }

  selectLine(item: T) {
    this.selectionModel.toggleSelect([item]);
    this.isLineSelected = true;
    this.lastElement = item;
  }

  toggleAllCheck(checked: boolean) {
    if (checked) {
      this.selectionModel.select([...this.filteredData]);
    } else {
      this.selectionModel.clear();
    }
    this.isLineSelected = false;
  }

  toggleCheck(item: T) {
    if (this.isLineSelected) {
      this.selectionModel.toggleSelect([item]);
    } else {
      this.selectionModel.toggle(item);
    }
    this.isLineSelected = false;
    this.lastElement = item;
  }

  selectFirstElement() {
    this.selectLine(this.sortedData[0]);
  }

  selectPrevElement() {
    const index = this.sortedData.indexOf(this.lastElement);
    if (index == -1) {
      this.selectLine(this.sortedData[0]);
    } else {
      if (index == 0) {
        this.firstLineUp.next();
      } else {
        this.selectLine(this.sortedData[index - 1]);
      }
    }
  }

  selectNextElement() {
    const index = this.sortedData.indexOf(this.lastElement);
    if (index == -1) {
      this.selectLine(this.sortedData[0]);
    } else {
      if (index != this.sortedData.length - 1) {
        this.selectLine(this.sortedData[index + 1]);
      }
    }
  }

  isSelectedCheck(row: T) {
    return this.selectionModel.isSelected(row) && !this.isLineSelected;
  }

  isSelectedLine(row: T) {
    return this.selectionModel.isSelected(row) && this.isLineSelected;
  }
}
