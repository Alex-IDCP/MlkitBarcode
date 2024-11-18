import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AlertController, InfiniteScrollCustomEvent, IonSearchbar } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';
import { MasterListDetails } from '../../models/master-list-details';
import { ToastService } from 'src/app/services/toast/toast.service';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-search-dropdown',
   templateUrl: './search-dropdown.page.html',
   styleUrls: ['./search-dropdown.page.scss'],
})
export class SearchDropdownPage implements OnInit, OnChanges {

   @Input() title: string = "Search";
   @Input() optionLabel: string = "description";
   @Input() optionValue: string = "id";
   @Input() searchDropdownList: SearchDropdownList[] = [];
   @Input() masterDropdownList: MasterListDetails[] = [];
   @Input() emptyMessage: string = "No results found";
   @Input() disabled: boolean = false;
   @Output() onActionComplete: EventEmitter<SearchDropdownList> = new EventEmitter();
   tempDropdownList: SearchDropdownList[] = [];
   @Input() selectedId: number;
   @Input() selectedCode: string;
   @Input() showCamera: boolean = false;
   @Input() inputReadOnly: boolean = true;
   selected: SearchDropdownList;

   @ViewChild("searchBar", { static: false }) searchBar: IonSearchbar;

   constructor(
      private toastService: ToastService,
      private alertController: AlertController
   ) { }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
      if (!changes.disabled) {
         this.selected = null;
      }

      if (changes.masterDropdownList) {
         await this.bindFromMasterList();
         if (this.optionValue === "id") {
            if (this.selectedId !== null) {
               this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
            }
         }
         if (this.optionValue === "code") {
            if (this.selectedCode !== null) {
               this.selected = this.searchDropdownList?.find(r => r.code === this.selectedCode);
            }
         }
      }

      if (changes.selectedId || changes.selectedCode) {
         if (this.optionValue === "id") {
            if (this.selectedId !== null) {
               this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
            }
         }
         if (this.optionValue === "code") {
            if (this.selectedCode !== null) {
               this.selected = this.searchDropdownList?.find(r => r.code === this.selectedCode);
            }
         }
      }

      if (changes.searchDropdownList) {
         if (this.optionValue === "id") {
            if (this.selectedId !== null) {
               this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
            }
         }
         if (this.optionValue === "code") {
            if (this.selectedCode !== null) {
               this.selected = this.searchDropdownList?.find(r => r.code === this.selectedCode);
            }
         }
      }
   }

   ngOnInit() {
      
   }

   manuallyTrigger() {
      if (this.optionValue === "id") {
         if (this.selectedId !== null) {
            this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
         }
      }
      if (this.optionValue === "code") {
         if (this.selectedCode !== null) {
            this.selected = this.searchDropdownList?.find(r => r.code === this.selectedCode);
         }
      }
   }

   setScanInputFocus() {
      if (!this.inputReadOnly) {
         if (this.scanInput && this.scanInput.nativeElement) {
            this.scanInput.nativeElement.focus();
         }
      }
   }

   setFocus() {
      this.searchBar.setFocus();
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

   searchText: string = "";
   async onKeyDown(event) {
      if (event.keyCode === 13) {
         await this.searchItem();
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

   chooseThis(object: SearchDropdownList) {
      if (this.selected && this.selected.id === object.id) {
         this.hideModal(this.selected, false);
      } else {
         this.selected = object;
         this.hideModal(object, true);
      }
   }

   clearSelected() {
      this.selected = null;
   }

   isModalOpen: boolean = false;
   showModal() {
      this.startIndex = 0;
      this.tempDropdownList = [];
      this.assignToTemp(this.startIndex, this.size);
      this.isModalOpen = true;
   }

   hideModal(object: SearchDropdownList, triggerOutput: boolean = false) {
      this.searchText = "";
      this.tempDropdownList = [];
      if (triggerOutput) {
         this.onActionComplete.emit(object);
      }
      this.isModalOpen = false;
   }

   // Cancel
   apply() {
      // Dismiss modal
      this.hideModal(null);
   }

   // Clear
   clear() {
      this.hideModal(null, true);
   }

   assignToTemp(startIndex: number, size: number) {
      if (this.searchText && this.searchText.length > 0) {
         this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.filter(r => r.code?.toLowerCase().includes(this.searchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.searchText.toLowerCase()) || r.description?.toLowerCase().includes(this.searchText.toLowerCase())).slice(this.startIndex, startIndex + size)];
         if (this.tempDropdownList && this.tempDropdownList.length === 1) {
            this.chooseThis(this.tempDropdownList[0]);
         }
      } else {
         this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.slice(startIndex, startIndex + size)];
      }
      console.log("🚀 ~ SearchDropdownPage ~ assignToTemp ~ this.tempDropdownList:", this.tempDropdownList)
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

   /* #region camera scanner */

   searchValue: string;
   @Input() clearSearchValue: boolean = true;

   @Output() onScanCompleted = new EventEmitter<any>();
   @Output() onCameraStatusChanged = new EventEmitter<boolean>();
   @Output() onDoneScanning = new EventEmitter<string>();

   async startScanning() {
      const allowed = await this.checkPermission();
      if (allowed) {
         // this.scanActive = true;
         this.onCameraStatusChanged.emit(true);
         const result = await BarcodeScanner.startScan();
         /*if (result.hasContent) {
            let value = result.content;
            if (!this.clearSearchValue) {
               this.searchValue = value;
            }
            // this.scanActive = false;
            await this.onCameraStatusChanged.emit(false);
            await this.onDoneScanning.emit(value);
         }*/
      }
   }

   async checkPermission() {
      return new Promise(async (resolve) => {
         const status = await BarcodeScanner.checkPermissions();
         if (status.camera === "granted") {
            resolve(true);
         } else if (status.camera === "denied") {
            const alert = await this.alertController.create({
               header: "No permission",
               message: "Please allow camera access in your setting",
               buttons: [
                  {
                     text: "Open Settings",
                     handler: () => {
                        BarcodeScanner.openSettings();
                        resolve(false);
                     },
                  },
                  {
                     text: "No",
                     role: "cancel",
                  },
               ],
            });
            await alert.present();
         } else {
            resolve(false);
         }
      });
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged.emit(false);
   }

   /* #region if user use scan */

   async onScanInputKeyDown(e: any, key: string) {
      if (e.keyCode === 13) {
         this.onScanCompleted.emit(key);
         if (this.clearSearchValue) {
            this.searchValue = "";
         }
         e.preventDefault();
      }
   }

   onBlur(e: any, key: string) {
      this.onScanCompleted.emit(key);
      if (this.clearSearchValue) {
         this.searchValue = "";
      }
      e.preventDefault();
   }

   @ViewChild("scanInput", { static: false }) scanInput: ElementRef;
   showKeyboard(event) {
      event.preventDefault();
      setTimeout(async () => {
         this.scanInput.nativeElement.focus();
         await Keyboard.show();
      }, 100);
   }

   /* #endregion */

}
