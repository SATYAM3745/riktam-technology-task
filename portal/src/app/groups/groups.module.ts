import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './groups-routing.module';
import { LayoutComponent } from './layout.component';
import { GroupsComponent } from './list.component';
import { AddEditGroupComponent } from './add-edit.component';
import {MatSelectModule} from '@angular/material/select';
import { GroupChatComponent } from './group-chat.component';
import { FormsModule } from '@angular/forms';
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UsersRoutingModule,
        MatSelectModule,
        FormsModule
    ],
    declarations: [
        LayoutComponent,
        GroupsComponent,
        AddEditGroupComponent,
        GroupChatComponent
    ]
})
export class GroupsModule { }