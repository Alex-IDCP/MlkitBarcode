import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'approvals',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'managements',
        loadChildren: () => import('../managements/pages/management/management.module').then(m => m.ManagementPageModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('../transactions/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('../reports/pages/reports/reports.module').then(m => m.ReportsPageModule)
      },
      {
        path: 'cards',
        loadChildren: () => import('../secure/cards/cards.module').then(m => m.CardsPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
