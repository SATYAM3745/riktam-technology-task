import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { io }from 'socket.io-client';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User | null>;
    public user: Observable<User | null>;
    private socket = io('http://localhost:4001');
     

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
        this.user = this.userSubject.asObservable();
    }

    public get userValue() {
        return this.userSubject.value;
    }

    login(userId: string, password: string) {
        return this.http.post<any>(`http://localhost:4001/api/login`, { userId, password })
            .pipe(map(user => {
                console.log(user.user);
                localStorage.setItem('user', JSON.stringify(user.user));
                this.userSubject.next(user.user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/users/register`, user);
    }

    getAll() {
        return this.http.get<any>('http://localhost:4001/api/getUserList');
    }

    getById(id: string) {
        return this.http.get<any>(`http://localhost:4001/api/userById`,{
            headers:{
                id:id
            }
        });
    }

    createUser( params: any) {
        return this.http.post(`http://localhost:4001/api/createUser`, params)
            .pipe(map(x => {
                return x;
            }));
    }
    updateUser( params: any) {
        return this.http.patch(`http://localhost:4001/api/updateUserInfo`, params)
            .pipe(map(x => {
                return x;
            }));
    }


    delete(userId: string) {
        console.log(userId)
        return this.http.delete(`http://localhost:4001/api/deleteUser`,{
            headers:{
                id:userId
            }
        })
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (userId == this.userValue?._id) {
                    this.logout();
                }
                return x;
            }));
    }
    createGroup(group:any){
        return this.http.post(`http://localhost:4001/api/createGroup`, group)
            .pipe(map(x => {
                return x;
            }));
    }
    getAllGroups(userId:string) {
        return this.http.get<any>(`http://localhost:4001/api/getGroupListForUser/${userId}`);
    }
    deleteGroup(roomId:string){
        return this.http.delete(`http://localhost:4001/api/deleteGroup/${roomId}`)
            .pipe(map(x => {
                return x;
            }));
    }
    getGroupById(groupId:string){
        return this.http.get<any>(`http://localhost:4001/api/getGroupList/${groupId}`);
    }
    sendMessage(message:any){
        return this.http.post(`http://localhost:4001/api/sendMessage`, message)
        .pipe(map(x => {
            return x;
        }));
        
    }
   getMessages(roomId:string){
            this.socket.on('connection', (data:any) => {              
            });
            this.socket.emit('joinRoom',roomId,(value:any)=>{
                console.log(value)
            })
            let observable = new Observable<{ user: String, message: String }>(observer => {
                this.socket.on('messageHistory', (data) => {
                    console.log(data)
                  observer.next(data);
                });
                return () => { this.socket.disconnect(); };  
              });
              return observable;
        }
      }