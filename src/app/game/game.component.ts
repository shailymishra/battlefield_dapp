import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { AppDialog } from "./dialog/app-dialog.component";
import { Web3Service } from "../util/web3.service";
import { MatSnackBar } from "@angular/material";
import { BehaviorSubject } from "rxjs";
import { AuthMockService } from "../auth/auth.mock.service";
import { ActivatedRoute, Router } from "@angular/router";
import { GameMockService, Request } from "./game.mock.service";
import { switchMap } from "rxjs/operators";
import { MessageService } from '../util/message/message.service';

declare let require: any;
const game_artifacts = require("../../../build/contracts/Game.json");

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"]
})
export class GameComponent implements OnInit {
  rowHeight = "10px";
  noOfColumns = 10;
  noOfRows = 10;
  color = "green";
  defaultcolor = "lightblue";
  hitTileColor = "red";
  missTileColor = "yellow";

  myMap: Tile[] = [];

  myMapConvertedDataStructure = [];
  myMapHashed = [];

  oppoentMap: Tile[] = [];

  lockingMyShip = false;
  bothShipLocked = false;
  myTurn = false;

  randomHashKeys = [];

  status = "";
  gameContract: any;
  deployedGameContract: any;

  playerNo;
  hitTile;
  loggedInUser;
  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private matSnackBar: MatSnackBar,
    private authService: AuthMockService,
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameMockService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = +params.get("id");
          return this.gameService.getRequestById(id);
        })
      )
      .subscribe((data: any) => {
        if (data) {
          this.startTimer();
        } else {
          this.router.navigate(["dashboard"]);
        }
      });

    this.authService.getCurrentUserSubject.subscribe(
      user => (this.loggedInUser = user)
    );

    this.initializeGrid();
    setTimeout(() => {
      this.setShips();
    });

    this.web3Service
      .artifactsToContract(game_artifacts)
      .then(GameContractAbstraction => {
        this.gameContract = GameContractAbstraction;
        // this.setChoiceToNetwork();
        this.gameContract.deployed().then(deployed => {
          this.deployedGameContract = deployed;

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

          this.deployedGameContract.bytes32ArrayConsoleEvent((err, result) => {
            if (err) {
              return console.error(err);
            }
            const address = result.args.who;
            if (this.loggedInUser.blockchainAccount == address) {
              console.log(
                "bytes32ArrayConsoleEvent.log ",
                result.args.consolevalue
              );
            }
          });

          this.deployedGameContract.bothHaveLockedChoiceEvent((err, result) => {
            if (err) {
              return console.error(err);
            }
            this.bothShipLocked = result.args.value;
            this.deployedGameContract
              .whoAmI({ from: this.loggedInUser.blockchainAccount })
              .then(value => {
                console.log("value", value);
                this.playerNo = value;
                if (this.playerNo == 1) {
                  this.myTurn = true;
                }
              });
            // now can play
            // tell first whose turn it is
            // and then would the frontend maintain it or the blockchain would maintain it
            //
          });

          // If other player has hit, then you have to reveal it
          this.deployedGameContract.hitTileEvent((err, result) => {
            if (err) {
              return console.error(err);
            }
            const hitAddress = result.args.hitAddress;
            const tileNumber = result.args.tileNumber;
            if (hitAddress == this.loggedInUser.blockchainAccount) {
              this.revealTile(tileNumber);
            }
          });

          // when you have revealed - is it a miss or hit
          // and it is revealed to the other blockchain address
          this.deployedGameContract.revealTitleEvent((err, result) => {
            if (err) {
              return console.error(err);
            }
            const revealToAddress = result.args.revealToAddress;
            const isHit = result.args.isHit;
            const value = result.args.value;
            if (
              revealToAddress == this.loggedInUser.blockchainAccount &&
              isHit
            ) {
              const tile = this.oppoentMap[this.hitTile];
              console.log("value", value);
              if (value == 1) {
                tile.color = this.hitTileColor;
              } else {
                tile.color = this.missTileColor;
              }
            }
          });
        });
      });
  }

  timeLeft: number = 300;
  interval;

  ships = [];

  currentShipSetting;

  setShipOfSize(size, id) {
    console.log("size", size);
    console.log("id", id);
    let shipIndex = this.ships.findIndex(ship => ship.id == id);
    if (shipIndex == -1) {
      this.ships.push({ id, tiles: [],destroyed :0 });
      shipIndex = this.ships.findIndex(ship => ship.id == id);
    }
    this.currentShipSetting = this.ships[shipIndex];
  }

  doneShip(){
    this.currentShipSetting = null;
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  initializeGrid() {
    let row = 0;
    while (row < this.noOfRows) {
      let col = 0;
      while (col < this.noOfColumns) {
        const name = "";
        this.myMap.push(
          this.createATitle(row, col, name, 1, 1, this.defaultcolor)
        );
        this.oppoentMap.push(
          this.createATitle(row, col, name, 1, 1, this.defaultcolor)
        );
        col++;
      }
      row++;
    }
  }

  createATitle(rowId, columnId, text, cols, rows, color) {
    return { rowId, columnId, text, cols, rows, color };
  }

  onClickSetShip(event, tile) {
    if (this.currentShipSetting) {
      const tileIndex = this.myMap.findIndex(findTile => findTile == tile);
      if (tile.color == this.color) {
        tile.color = this.defaultcolor;
        const index = this.currentShipSetting.tiles.findIndex(findTile => findTile == tileIndex)
        console.log('index to remove', index)
        this.currentShipSetting.tiles.slice(index)
      } else {
        tile.color = this.color;
        this.currentShipSetting.tiles.push(tileIndex)
      }
    }else{
      this.messageService.showErrorMessage('Click on the button to set ships');
    }
  }

  onClickHitShip(event, tile) {
    const tileIndex = this.oppoentMap.findIndex(findTile => findTile == tile);
    this.hitTile = tileIndex;
    this.hit(tileIndex);
  }

  setShips() {
    const setShipMessage = {
      title: "Set Ships",
      content:
        "You have to set 5 ships. A Carrier of size 5. \n A Battleship of size 4. \n A Cruisier of size 3. Submarine of size 3. Destroyer of size 2. You can place ship vertically or horizontally"
    };
    // this.openDialog(setShipMessage);
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(AppDialog, {
      width: "250px",
      data
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log("The dialog was closed");
    });
  }

  lockChoice() {
    console.log('lockChoice  ', this.ships)
    this.lockingMyShip = true;
    this.randomlyGenerateKeysForEachTile();
    this.myMap.forEach((tileObject, tileIndex) => {
      const value = tileObject.color != this.defaultcolor ? 1 : 0;
      this.myMapConvertedDataStructure.push(value);
      this.myMapHashed.push(
        this.web3Service.getHashValue(this.randomHashKeys[tileIndex], value)
      );
    });
    this.sendChoiceToContract();
  }

  randomlyGenerateKeysForEachTile() {
    const upperLimit = 100;
    for (let i = 0; i < 100; i++) {
      const randomvalue = Math.floor(Math.random() * upperLimit) + 1;
      this.randomHashKeys.push(randomvalue);
    }
  }

  revealTile(position) {
    const tile = this.myMap[position];
    console.log('my map', this.myMap[position].color)
    const value = this.myMap[position].color != this.defaultcolor ? 1 : 0;

    const findShipIndex = this.ships.findIndex(ship=>{
      const tiles = ship.tiles
      const id = ship.id
      const findTileIndex = ship.tiles.findIndex(tile=>tile==position)
      return (findTileIndex == -1) ? false : true
    })

    console.log('value of the tile', value)
    console.log('findShipIndex', findShipIndex)
    console.log('ship is', this.ships[findShipIndex] )
    const ship = this.ships[findShipIndex]
    console.log('')
    if(value == 1){
      ship.destroyed +=1 
    }

    this.deployedGameContract
      .revealTile(position, this.randomHashKeys[position], value, {
        from: this.loggedInUser.blockchainAccount
      })
      .then(value => {

        if(value == 1){
          if(ship.destroyed < 5){
            tile.color = this.hitTileColor;
          }else{
            console.log('Ship is destroyedddd')
            // Set all tile of that ship as gone. i.e. lightblue
            ship.tiles.map(positionvalue =>{
              this.myMap[positionvalue].color = this.defaultcolor
            })
            this.messageService.showSuccessMessage('Your Ship has sunk');
          }
        }else{
          tile.color = this.missTileColor;
        }

        this.myTurn = true;
      });
  }

  hit(hitTile) {
    // get the index of that tile
    // if player 1 hits then player 2 should reveal
    // Basically a game -
    this.deployedGameContract
      .hitTile(hitTile, { from: this.loggedInUser.blockchainAccount })
      .then(result => {
        this.myTurn = false;
      });
  }

  async sendChoiceToContract() {
    try {
      this.deployedGameContract
        .setShips(this.myMapHashed, {
          from: this.loggedInUser.blockchainAccount
        })
        .then(value => {});
    } catch (e) {
      console.log(e);
    }
  }
}

export interface Tile {
  rowId: number;
  columnId: number;
  color: string;
  cols: number;
  rows: number;
  text: string;
}
