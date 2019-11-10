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

event TestEvent(address who);   // declaring event
event PlayerEvent(address addressOfPlayer, bytes32[] choiceHash, uint8 serialNo);

event consoleEvent(string consolevalue);
event uintconsoleEvent(uint8 consolevalue);
event bytesConsoleEvent(bytes consolevalue);
event bytes32ConsoleEvent(bytes32 consolevalue);

	constructor() public {
        // player1.serialNo = 1;
        player2.serialNo = 2;
        // player1.addressOfPlayer = msg.sender;
        player2.addressOfPlayer = 0xA8658699A8B0885690259554a541a30356A24dba;
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
    }

    function setShips(bytes32[100] memory choiceHash) public {

        emit TestEvent(msg.sender); // logging event

        if (msg.sender == player1.addressOfPlayer){
            player1.choiceHash = choiceHash;
            player1.serialNo = 10;
        }
        else if (msg.sender == player2.addressOfPlayer){
            player2.choiceHash = choiceHash;
        }
    }



    function getLength() public view  returns (uint) {
      return player1.choiceHash.length;
    }

    // Taking randomKey as number, but can change to string
    // Should use event emit?
    function revealTile(uint8 pos, uint8 randomKey, uint8 value) public {
        if (msg.sender == player1.addressOfPlayer){
            emit consoleEvent('Msg Sender is player1');
            emit bytesConsoleEvent(abi.encodePacked(randomKey,value));
            emit bytes32ConsoleEvent(player1.choiceHash[pos]);
            if( keccak256(abi.encodePacked(randomKey,value)) == player1.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit uintconsoleEvent(player1.choice[pos]);
            }
        }
        else if (msg.sender == player2.addressOfPlayer){
            emit consoleEvent('Msg Sender is player2');
            if( keccak256(abi.encodePacked(randomKey,value)) == player1.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit uintconsoleEvent(player2.choice[pos]);
            }
        }
    }

}
