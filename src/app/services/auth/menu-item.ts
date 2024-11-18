
export interface MenuItem {
   title: string;
   url: string[];
   icon: string;
   tabindex: string;
   fragment: string;
}

export interface MenuItemRoot {
   moduleCode: string
   label: string
   icon: string
   routerLink: any
   tabindex: string
   fragment: string
   items: MenuInnerItem[]
 }
 
 export interface MenuInnerItem {
   moduleCode: string
   subModuleCode: string
   label: string
   icon?: string
   faicon: any
   items: MenuItemItem2[]
 }
 
 export interface MenuItemItem2 {
   subModuleCode: string
   label: string
   icon?: string
   faicon: any
   routerLink?: string
   title: string
   id: number
 }
 