import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { GroupsComponent } from './list.component';
import { AddEditGroupComponent } from './add-edit.component';
import { GroupChatComponent } from './group-chat.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: GroupsComponent,
      },{
            path: 'groupchat',
            component: GroupChatComponent,
          },
      { path: 'add', component: AddEditGroupComponent },
      { path: 'edit/:id', component: AddEditGroupComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
