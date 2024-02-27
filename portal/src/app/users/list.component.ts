import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { Router } from '@angular/router';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    users?: any[];

    constructor(private accountService: AccountService,
        private router: Router,) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users =>{
                console.log(users) 
                this.users = users.data});
    }
    getAll(){
        this.accountService.getAll()
        .pipe(first())
        .subscribe(users =>{
            console.log(users) 
            this.users = users.data});
    }

    deleteUser(id: string) {
        this.accountService.delete(id)
            .pipe(first())
            .subscribe((x) =>{
             console.log(x)
                this.getAll()
            });
    }
}