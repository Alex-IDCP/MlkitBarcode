export interface MenuHierarchy {
   moduleCode: string,
   label: string,
   icon: string,
   routerlink: string,
   tabindex: string,
   items: MenuHierarchySubModule[]
}

export interface MenuHierarchySubModule {
   moduleCode: string,
   subModuleCode: string,
   label: string,
   faicon: string[],
   items: MenuHierarchyApp[]
}

export interface MenuHierarchyApp {
   subModuleCode: string,
   label: string,
   faicon: string[],
   routerlink: string
}


