import { Component, OnInit } from "@angular/core";
import { AuthMockService } from "../auth/auth.mock.service";
import { GameMockService } from "../game/game.mock.service";
import { Request } from "../game/game.mock.service";
import { interval } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Web3Service } from '../util/web3.service';
import { Router } from '@angular/router';
const game_artifacts = require("../../../build/contracts/Game.json");

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  playeerdisplayedColumns: string[] = ["firstName", "Send Request"];
  requestdisplayedColumns: string[] = ["requester", "Accept Request", "Decline Request"];
  loggedInUser;
  public requestDataSource = new MatTableDataSource();
  public dataSource = new MatTableDataSource();
  sub:any;
  gameContract: any;
  deployedGameContract: any;
  constructor(
    private authService: AuthMockService,
    private gameService: GameMockService,
    private web3Service : Web3Service,
    private router : Router
  ) {}

  ngOnInit() {

    this.authService.getCurrentUserSubject.subscribe(
      user => (this.loggedInUser = user)
    );


    this.sub = interval(10000)
    .subscribe((val) => {
      this.gameService.getPendingRequest(this.loggedInUser.email).subscribe((res)=>{
        // this.requestDataSource = res;
        this.requestDataSource.connect().next(res);
      });
      this.gameService.getAcceptRequest(this.loggedInUser.email).subscribe((request)=>{
        if(request.length){
          console.log('Call the contract and register for game')
          this.callTheContractAndRegisterForGame(request[0].id);
          request[0].status = 'finished';
          this.gameService.update(request[0]).subscribe(res=>{
            console.log('Finished request');
            console.log('res', res)
          })
        }

      });
     });

    this.authService.getAllUsers().subscribe(users => {
      console.log("Users", users);
      const userIndex = users.findIndex(
        user => user.email == this.loggedInUser.email
      );
      console.log("userIndex", userIndex);
      users.splice(userIndex, 1);
      this.dataSource.data = users;
    });
  }

  sendRequest(player) {
    console.log("player", player);
    const request: Request = {};
    request.requestTime = Date.now();
    request.requester = this.loggedInUser.email;
    request.requestee = player.email;
    request.status = "pending";
    request.requesterBlockchainAddress = this.loggedInUser.blockchainAccount;
    this.gameService.add(request).subscribe(sucessObj => {console.log('success obj', sucessObj)});
  }

  acceptRequest(request:Request){
    console.log('Accept Request',request)
    request.status = "accepted";
    request.requesteeBlockchainAddress = this.loggedInUser.blockchainAccount;
    this.gameService.update(request).subscribe(sucessObj =>{
      console.log('Success Obj', sucessObj)
      const getIndex = this.requestDataSource.data.findIndex((data : Request) => data.id == request.id);
      console.log('getIndex', getIndex)
      this.dataSource.data.slice(getIndex);
      console.log('ACCEPT REQUEST : Call the contract and register for game')
      this.callTheContractAndRegisterForGame(request.id);
    });
  }

  callTheContractAndRegisterForGame(id){
    this.web3Service
    .artifactsToContract(game_artifacts)
    .then(GameContractAbstraction => {
      this.gameContract = GameContractAbstraction;
      // this.setChoiceToNetwork();
      this.gameContract.deployed().then(deployed => {
        this.deployedGameContract = deployed;

        this.deployedGameContract
          .register({ from: this.loggedInUser.blockchainAccount })
          .then(param => {
            this.router.navigate(['game', id]);
          });

        this.deployedGameContract.TestEvent(function(err, result) {
          if (err) {
            return console.error(err);
          }
          console.log("Result of TestEvent ", result.args.who);
        });

        this.deployedGameContract.PlayerEvent((err, result) => {
          if (err) {
            return console.error(err);
          }
          console.log("PLayer Event Result addressOfPlayer  ", result.args);
        });

        this.deployedGameContract.consoleEvent((err, result) => {
          if (err) {
            return console.error(err);
          }
          console.log("COnsole.log ", result.args.consolevalue);
        });

        this.deployedGameContract.uintconsoleEvent((err, result) => {
          if (err) {
            return console.error(err);
          }
          console.log("uintconsoleEvent.log ", result.args.consolevalue);
        });

        this.deployedGameContract.bytesConsoleEvent((err, result) => {
          if (err) {
            return console.error(err);
          }
          console.log("bytesConsoleEvent.log ", result.args.consolevalue);
        });

        this.deployedGameContract.bytes32ConsoleEvent((err, result) => {
          if (err) {
            return console.error(err);
          }
          console.log("bytes32ConsoleEvent.log ", result.args.consolevalue);
        });
      });
    });
  }

  declineRequest(request:Request){
    console.log('Decline Request',request)
    request.status = "declined";
    this.gameService.update(request).subscribe(sucessObj =>{console.log('Success Obj', sucessObj)});
  }
}
