import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccountService, AlertService } from '@app/_services';
import { group } from '@angular/animations';

@Component({ templateUrl: 'group-chat.component.html' })
export class GroupChatComponent implements OnInit {
    userId:string=""
    group:any;
    message:string=""
    messages:any
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { 
        this.messages=[]
    }

    ngOnInit() {
        this.route.params.subscribe(group=>{
            this.group=group;
        });
        console.log(this.group)
       this.accountService.getMessages(this.group.roomId).subscribe(data=>{
        this.messages=data;
       })
            }
    sendMessage(){
        let userId;
        this.accountService.user.subscribe(user=>{
            userId=user?._id;
        })
        let message={
            message:this.message,
            roomId:this.group.roomId,
            senderId:userId
        }
        this.accountService.sendMessage(message).pipe()
        .
        subscribe((data)=>{
            console.log(data)
            this.message=""
        })
    }
    
}