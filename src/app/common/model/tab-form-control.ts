import {FormControl} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';
import {moveItemInArray} from '@angular/cdk/drag-drop';

export class TabFormControl<T> extends FormControl {
  private tabListStream = new BehaviorSubject<T[]>([]);
  private tabListObservable = this.tabListStream.asObservable();

  get selected(): T {
    return this.value;
  }

  get selectedIndex(): number {
    return this.tabListStream.value.indexOf(this.value);
  }

  get list(): Observable<T[]> {
    return this.tabListObservable;
  }

  get size(): number {
    return this.tabListStream.value.length;
  }

  setTabs(...tabs: T[]) {
    this.tabListStream.next(tabs);
  }

  addTabs(...tabs: T[]) {
    this.tabListStream.next(this.tabListStream.value.concat(tabs));
  }

  removeTabs(...tabs: T[]) {
    this.tabListStream.next(this.tabListStream.value.filter(tab => !tabs.includes(tab)));
  }

  selectTab(tab: T) {
    if (!this.isSelected(tab)) {
      this.patchValue(tab);
    }
  }

  selectTabByIndex(index: number) {
    if (this.tabListStream.value[index] == null) {
      this.selectFirstTab();
    } else if (!this.isSelected(this.tabListStream.value[index])) {
      this.patchValue(this.tabListStream.value[index]);
    }
  }

  selectFirstTab() {
    if (this.tabListStream.value[0] != null && !this.isSelected(this.tabListStream.value[0])) {
      this.patchValue(this.tabListStream.value[0]);
    }
  }

  isSelected(tab: T): boolean {
    return this.value == tab;
  }

  indexOf(tab: T): number {
    return this.tabListStream.value.indexOf(tab);
  }

  tabAt(index: number): T {
    return this.tabListStream.value[index];
  }

  move(previousIndex: number, currentIndex: number | any) {
    moveItemInArray(this.tabListStream.value, previousIndex, currentIndex);
    this.tabListStream.next(this.tabListStream.value);
  }
}
