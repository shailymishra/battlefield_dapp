import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { AppDialog } from "./dialog/app-dialog.component";
import { Web3Service } from "../util/web3.service";
import { MatSnackBar } from "@angular/material";
import { BehaviorSubject } from 'rxjs';

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

  myMap: Tile[] = [];

  myMapConvertedDataStructure = [];
  myMapHashed = [];

  oppoentMap: Tile[] = [];

  lockShipSetting = false;

  accounts: string[];

  randomHashKeys = [];

  model = {
    amount: 5,
    receiver: "",
    balance: 0,
    account: ""
  };

  status = "";
  gameContract: any;
  deployedGameContract: any;

  private _revealTileBehaviorSubject = new BehaviorSubject(0);

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private matSnackBar: MatSnackBar
  ) {

    this._revealTileBehaviorSubject.subscribe(value=>{
      console.log('Reveal Tile Subscribe', value);
  

    })

  }

  ngOnInit() {
    this.initializeGrid();
    setTimeout(() => {
      this.setShips();
    });

    this.watchAccount();
    this.web3Service
      .artifactsToContract(game_artifacts)
      .then(GameContractAbstraction => {
        this.gameContract = GameContractAbstraction;
        // this.setChoiceToNetwork();
        this.gameContract.deployed().then(deployed => {
          this.deployedGameContract = deployed;

          this.deployedGameContract
            .register({ from: this.model.account })
            .then(param => {
              // console.log('Registered')
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
    console.log("onclick", tile);
    tile.color = "red";
    if (tile.color == this.color) {
      tile.color = this.defaultcolor;
    } else {
      tile.color = this.color;
    }
  }

  onClickHitShip(event, tile) {
    console.log("onclick", tile);
    const tileIndex = this.myMap.findIndex(findTile => findTile == tile)
    this.sendRevealRequest(tileIndex)
  }

  setShips() {
    const setShipMessage = {
      title: "Set Ships",
      content:
        "You have to set 5 ships. A Carrier of size 5. \n A Battleship of size 4. \n A Cruisier of size 3. Submarine of size 3. Destroyer of size 2. You can place ship vertically or horizontally"
    };
    this.openDialog(setShipMessage);
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

  watchAccount() {
    console.log("Watch Account Method is called...");
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      console.log("Model Account is", this.model.account);
    });
  }

  lockChoice() {
    this.lockShipSetting = true;
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
    console.log(
      "Calling Reveal Key from FE at position   ",
      position,
      "  Random Hash Key is  ",
      this.randomHashKeys[position]
    );
    this.deployedGameContract
      .revealTile(position, this.randomHashKeys[position], 1, {
        from: this.model.account
      })
      .then(value => {});
    this.deployedGameContract.revealTitle((err, result) => {
      if (err) {
        return console.error(err);
      }
      const tile = this.myMap[position];
      if (result.args.isTileRevealed) {
        tile.color = this.hitTileColor;
      }
    });
  }

  hit(hitTile) {
    // get the index of that tile
    // if player 1 hits then player 2 should reveal
    // Basically a game - 
    const index = this.myMap.findIndex(tile => hitTile == tile);
    console.log("Index", index);
  }

  async sendChoiceToContract() {
    console.log("sendChoiceToContract is called");
    try {
      this.deployedGameContract
        .setShips(this.myMapHashed, { from: this.model.account })
        .then(value => {
          console.log("Ship is set");
        });
    } catch (e) {
      console.log(e);
    }
  }

  sendRevealRequest(position){
    console.log('Sending reveal request')
    this._revealTileBehaviorSubject.next(position);
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
