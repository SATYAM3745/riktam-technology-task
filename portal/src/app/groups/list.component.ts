import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { Router } from '@angular/router';

@Component({ templateUrl: 'list.component.html' })
export class GroupsComponent implements OnInit {
  groups?: any[];
  userId?: string;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.accountService.user.subscribe((userSubject) => {
      if (userSubject != null) {
        this.userId = userSubject?._id;
        this.getAllGroups(this.userId);
      }
    });
  }
  getAllGroups(userId: any) {
    this.accountService
      .getAllGroups(userId)
      .pipe(first())
      .subscribe((groups) => {
        console.log(groups);
        this.groups = groups.data;
      });
  }

  deleteGroup(roomId: string) {
    this.accountService
      .deleteGroup(roomId)
      .pipe(first())
      .subscribe((x) => {
        console.log(x);
        this.getAllGroups(this.userId);
      });
  }
  openChat(group: any) {
    this.router.navigate(['/groups','groupchat',group])
  }
}
