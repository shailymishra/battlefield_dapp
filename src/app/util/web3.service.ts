import { Injectable } from "@angular/core";
import contract from "truffle-contract";
import { Subject } from "rxjs";
declare let require: any;
const Web3 = require("web3");
declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;
  public balance;

  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener("load", event => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        this.web3 = new Web3(window.ethereum);
      } catch (error) {
        // User denied account access...
        console.error("Denied Account Access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Acccounts always exposed
      this.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync =
        Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:7545")
      );
    }
    this.refreshAccounts();
    // setInterval(() => this.refreshAccounts(), 10);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }
  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log("Refreshing accounts", accs);
      if (err != null) {
        console.warn("There was an error fetching your accounts.");
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      if (
        !this.accounts ||
        this.accounts.length !== accs.length ||
        this.accounts[0] !== accs[0]
      ) {
        console.log("Observed new accounts");

        this.web3.eth.getBalance(accs[0]).then(balance => {
          console.log("Balance", balance);
          this.balance = balance;
        });

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }

  public getHashValue(randomKey, value) {
    return this.web3.utils.soliditySha3(
      { type: "uint8", value: randomKey },
      { type: "uint8", value: value }
    );
  }
}
