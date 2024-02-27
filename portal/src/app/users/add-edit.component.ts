import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { User } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    user: User;
    title!: string;
    loading = false;
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
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            userId: ['', Validators.required],
            // password only required in add mode
            password: ['', [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])]],
            role:['',Validators.required]
        });

        this.title = 'Add User';
        if (this.id) {
            // edit mode
            this.title = 'Edit User';
            this.loading = true;
                this.getUserById(this.id)
        }
    }
   getUserById(id:string){
        this.accountService.getById(id)
        .pipe(first()).
        subscribe(user=>{
            console.log(user.data)
            this.user=user.data;
            this.form.patchValue(user.data);
                    this.loading = false;
        })  
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();
        let user=this.form.value;
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
       if(this.id){
        user['Id']=this.user._id;
        this.accountService.updateUser(user)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('User saved', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/users');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
       }
       else{
        this.accountService.createUser(user)
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