import { Injectable } from "@angular/core";
import contract from "truffle-contract";
import { Subject } from "rxjs";
declare let require: any;
const Web3 = require("web3");
const leftPad = require('left-pad');
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

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== "undefined") {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log("No web3? You should consider trying MetaMask!");

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync =
        Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:7545")
      );
      // this.web3 = new Web3(window.web3.currentProvider);
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

        this.web3.eth.getBalance(accs[0]).then((balance) => {
          console.log('Balance', balance)
          this.balance = balance
        });

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });

  }

  public getKeccak256(value){
   return  this.web3.utils.keccak256(value)
  }

  public getAbiEnoceded(string1,string2){
    return this.web3.eth.abi.encodeParameters (string1,string2)
  }

  public T_keccak256(...args){
    args = args.map(arg => {
        if(typeof arg === 'string'){
            if(arg.substring(0,2) === '0x'){
                return arg.slice(2)
            }else {
                return this.web3.fromAscii(arg).slice(2)
            }
        }
        if(typeof arg === 'number'){
            return leftPad((arg).toString(16),64,0)
    
        }else {
            return ''
        }
    })
    const argsstring = args.join('');
    return this.web3.sha3(argsstring, { encoding: 'hex'});
  }
}
