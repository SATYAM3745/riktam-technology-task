import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { User } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditGroupComponent implements OnInit {
    form!: FormGroup;
    user: User;
    users?:User[]
    group:any
    title!: string;
    loading = true;
    submitting = false;
    submitted = false;
    id?:string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { 
        this.user=new User();
    }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        // form with validation rules
        this.form = this.formBuilder.group({
            groupName: ['', Validators.required],
            participants:[]
        });
        this.getAll();
        this.title = 'Create Group';
        if (this.id) {
            // edit mode
            this.title = 'Edit Group';
            this.loading = false;
                this.getGroupById(this.id)
        }
    }
    getAll(){
        this.accountService.getAll()
        .pipe(first())
        .subscribe(users =>{
            this.users = users.data
            console.log(this.users);
            this.loading = false;
        });
    }

   getGroupById(id:string){
        this.accountService.getGroupById(id)
        .pipe(first()).
        subscribe(group=>{
            this.group=group.data;
            console.log(this.group)

            this.form.setControl('groupName',this.group.groupName)
        this.loading = false;
        })  
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();
        let group=this.form.value;
        let userId;
        this.accountService.user.subscribe(user=>{
            userId=user?._id;
        })
        group['creatorId']=userId;
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        console.log(group)
       if(this.id){
        group['Id']=this.user._id;
        this.accountService.updateUser(group)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('group saved', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/groups');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
       }
       else{
        this.accountService.createGroup(group)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('User created', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/users');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
       }
        
    }
}