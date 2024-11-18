import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonSearchbar } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';
import { MasterListDetails } from '../../models/master-list-details';

@Component({
   selector: 'app-search-multi-dropdown',
   templateUrl: './search-multi-dropdown.page.html',
   styleUrls: ['./search-multi-dropdown.page.scss'],
})
export class SearchMultiDropdownPage implements OnInit, OnChanges {

   @Input() title: string = "Search";
   @Input() showHeaderLabel: boolean = true;
   @Input() showBoldHeader: boolean = false;
   @Input() optionLabel: string = 'description';
   @Input() showCode: boolean = false;
   @Input() searchDropdownList: SearchDropdownList[] = [];
   @Input() masterDropdownList: MasterListDetails[] = [];
   @Output() onActionComplete: EventEmitter<SearchDropdownList[]> = new EventEmitter();
   tempDropdownList: SearchDropdownList[] = [];
   @Input() selectedIds: number[] = [];
   selected: SearchDropdownList[] = [];
   selectAll: boolean = false;

   oldSelectedIds: number[] = [];

   @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;

   constructor() { }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
      if (changes.masterDropdownList) {
         await this.bindFromMasterList();
      }
      if (changes.selectedIds || changes.searchDropdownList) {
         this.searchDropdownList.forEach(r => {
            r.checked = false;
         })
         this.selected = null;
         this.oldSelectedIds = [];

         if (this.selectedIds) {
            this.selected = this.searchDropdownList.filter(r => this.selectedIds.includes(r.id));
            this.selected.forEach(r => {
               r.checked = true;
            })
            this.oldSelectedIds = this.selectedIds;
         }
      }
   }

   ngOnInit() {
      
   }

   bindFromMasterList() {
      this.searchDropdownList = [];
      if (this.masterDropdownList && this.masterDropdownList.length > 0) {
         this.masterDropdownList.forEach(r => {
            this.searchDropdownList.push({
               id: r.id,
               code: r.code,
               description: r.description
            })
         })
      }
   }

   searchText: string = '';
   async onKeyDown(event) {
      if (event.keyCode === 13) {
         this.searchItem();
      }
   }

   searchItem() {
      this.startIndex = 0;
      this.tempDropdownList = []
      this.assignToTemp(this.startIndex, this.size);
   }

   resetFilter() {
      this.searchText = "";
      this.startIndex = 0;
      this.tempDropdownList = [];
      this.assignToTemp(this.startIndex, this.size);
   }

   toggleSelectAll(event) {
      this.selected
      if (this.selectAll) {
         this.searchDropdownList.forEach(r => {
            r.checked = true;
         })
         this.selected = [...this.searchDropdownList];
      } else {
         this.searchDropdownList.forEach(r => {
            r.checked = false;
         })
         this.selected = [];
      }
   }

   itemChecked(event, object: SearchDropdownList) {
      if (event.detail.checked) {
         if (this.selected?.findIndex(r => r.id === object.id) > -1) {
            // already in
         } else {
            if (this.selectAll) {
               this.selected = [...this.searchDropdownList];
            } else {
               this.selected?.push(object);
            }
         }
      } else {
         this.selected?.splice(this.selected?.findIndex(r => r.id === object.id), 1);
      }
   }

   clearSelected() {
      this.selected = [];
      this.searchDropdownList.forEach(r => r.checked = false);
   }

   isModalOpen: boolean = false;
   showModal() {
      this.startIndex = 0;
      this.assignToTemp(this.startIndex, this.size);
      this.isModalOpen = true;
   }

   hideModal(object: SearchDropdownList[]) {
      this.searchText = "";
      this.tempDropdownList = [];
      this.onActionComplete.emit(object);
      this.isModalOpen = false;
   }

   // Cancel
   cancel() {
      // Dismiss modal
      this.hideModal(this.searchDropdownList.filter(r => this.oldSelectedIds.includes(r.id)));
   }

   apply() {
      if (this.selectAll) {
         this.hideModal(this.searchDropdownList);
      } else {
         this.hideModal(this.searchDropdownList.filter(r => r.checked));
      }
   }

   startIndex: number = 0;
   readonly size: number = 20;
   onIonInfinite(event) {
      this.startIndex += this.size;
      if (this.searchDropdownList && this.startIndex <= this.searchDropdownList.length) {
         this.assignToTemp(this.startIndex, this.size);
      }
      setTimeout(() => {
         (event as InfiniteScrollCustomEvent).target.complete();
      }, 500);
   }

   assignToTemp(startIndex: number, size: number) {
      if (this.searchText && this.searchText.length > 0) {
         this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.filter(r => r.code.toLowerCase().includes(this.searchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.searchText.toLowerCase()) || r.description?.toLowerCase().includes(this.searchText.toLowerCase())).slice(this.startIndex, startIndex + size)];
      } else {
         this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.slice(startIndex, startIndex + size)];
      }
   }

}
