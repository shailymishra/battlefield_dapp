pragma solidity ^0.5.0;

contract Game {

    struct Player{
        address payable addressOfPlayer;
        uint8 serialNo;
        bytes32[100] choiceHash;
        uint8[100] choice;
        uint8 bet;
    }

    Player public player1;
    Player public player2;

    bool bothHaveLockedChoices = false;
    uint8 countForLockingChoice = 0;
    uint8 public turnVariable;

event bothHaveLockedChoiceEvent(bool value);
event hitTileEvent(uint tileNumber, address hitAddress);

event TestEvent(address who);   // declaring event
event PlayerEvent(address addressOfPlayer, bytes32[100] choiceHash, uint8 serialNo);

event consoleEvent(string consolevalue);
event uintconsoleEvent(uint8 consolevalue);
event bytesConsoleEvent(bytes consolevalue);
event bytes32ConsoleEvent(bytes32 consolevalue);
event bytes32ArrayConsoleEvent(bytes32[100] consolevalue,address who);

event revealTitleEvent(uint8 value ,  address revealToAddress,bool isHit);

	constructor() public {
	}

    function register() public    {
        if (player1.addressOfPlayer == address(0)){
            player1.addressOfPlayer = msg.sender;
            player1.serialNo = 1;
        }
        else if (player2.addressOfPlayer == address(0)){
             player2.addressOfPlayer = msg.sender;
             player2.serialNo = 2;
        }
        // Both have to register and then only play
        countForLockingChoice = 0;
    }

    function setShips(bytes32[100] memory choiceHash) public {
        if (msg.sender == player1.addressOfPlayer ){
            player1.choiceHash = choiceHash;
            countForLockingChoice += 1;
        }
        else if (msg.sender == player2.addressOfPlayer){
            player2.choiceHash = choiceHash;
            countForLockingChoice += 1;
        }
        if(countForLockingChoice == 2){
            bothHaveLockedChoices = true;
            turnVariable = 1;
            emit bothHaveLockedChoiceEvent(true);
        }

    }

    function whoAmI() public view returns (uint8){
        if (player1.addressOfPlayer == msg.sender){
            return 1;
        }
        else if (player2.addressOfPlayer == msg.sender){
            return 2;
        }

    }

    function getLength() public view  returns (uint) {
      return player1.choiceHash.length;
    }

    function hitTile(uint tileNumber) public  {
        if (player1.addressOfPlayer == msg.sender && turnVariable==1) {
            emit hitTileEvent(tileNumber,player2.addressOfPlayer);
        }
        else if (player2.addressOfPlayer == msg.sender && turnVariable == 2) {
            emit hitTileEvent(tileNumber,player1.addressOfPlayer);
        }
    }

    // Taking randomKey as number, but can change to string
    // Should use event emit?
    function revealTile(uint8 pos, uint8 randomKey, uint8 value) public {
        if (msg.sender == player1.addressOfPlayer){
            if( keccak256(abi.encodePacked(randomKey,value)) == player1.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit revealTitleEvent(value, player2.addressOfPlayer, true);
            }else{
                emit revealTitleEvent(value, player2.addressOfPlayer, false);
            }
            turnVariable = 1;
        }
        else if (msg.sender == player2.addressOfPlayer){
            if( keccak256(abi.encodePacked(randomKey,value)) == player2.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit revealTitleEvent(value, player1.addressOfPlayer, true);
            }else{
                emit revealTitleEvent(value, player1.addressOfPlayer, true);
            }
            turnVariable = 2;
        }
    }

    

}
