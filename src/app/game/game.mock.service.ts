import { Injectable } from "@angular/core";
import { urls } from "../shared/constant";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthMockService } from '../auth/auth.mock.service';
@Injectable({
  providedIn: 'root'
})

export class GameMockService {
  urls;
  private requestApiUrl ;
  loggedInUser;
  constructor(private http: HttpClient, private authService : AuthMockService) {
    this.urls = urls;
    this.requestApiUrl =`${this.urls.JSON_SERVER}/requests`;
    this.authService.getCurrentUserSubject.subscribe(
      user => (this.loggedInUser = user)
    );


  }
  getAllRequests(): Observable<any> {
    console.log("getAllRequest");
    return this.http.get<Request[]>(this.requestApiUrl).pipe(
      map((res: Request[]) => {
        return res;
      })
    );
  }

  getRequestById(id: number): Observable<any> {
    console.log('get Reqeust By id')
    return this.http.get<Request>(`${this.requestApiUrl}/${id}`);
  }

  getPendingRequest(email:String):Observable<any>{
    return this.http.get<Request[]>(this.requestApiUrl).pipe(
      map((res: Request[]) => {
        // Even can filter it when time is over an hour
        // or even if a player is already playing a game
        // there can even be deadlocks
        const filterres = res.filter(request => (request.requestee==this.loggedInUser.email && request.status == "pending"));
        return filterres;
      })
    );
  }

  getAcceptRequest(email:String):Observable<any>{
    return this.http.get<Request[]>(this.requestApiUrl).pipe(
      map((res: Request[]) => {
        // Even can filter it when time is over an hour
        // or even if a player is already playing a game
        // there can even be deadlocks
        const filterres = res.filter(request => (request.requester==this.loggedInUser.email && request.status == "accepted"));
        return filterres;
      })
    );
  }

  add(request: Request): Observable<any> {
    console.log('add Request',request);
    request.id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    return this.http.post<Request[]>(this.requestApiUrl,request).pipe(
      map((res: any) => {
        console.log('Add successs', res)
        const successObj = {
          successCode: "default_ed_creation_success",
          details: res
        };
        return successObj;
      })
    );
  }

  update(request: Request): Observable<any> {
    console.log('update Request');
    return this.http.put<Request>(`${this.requestApiUrl}/${request.id}`, request).pipe(
      map((res: any) => {
        const successObj = { successCode: 'default_ed_updation_success', details: res };
        return successObj;
      })
    )
  }

  delete(id: number): Observable<any> {
    console.log('delete Request');
    return this.http.delete(`${this.requestApiUrl}/${id}`).pipe(
      map((res: any) => {
        const successObj = { successCode: 'default_ed_deletion_success', details: res };
        return successObj;
      })
    )
  }


}

export interface Request {
  status?: string;
  id?: number;
  requestTime?: any;
  requester?: string;
  requesterBlockchainAddress?: string;
  requesteeBlockchainAddress?: string;
  requestee?: string;
}
