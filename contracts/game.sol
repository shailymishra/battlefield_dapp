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
event PlayerEvent(address addressOfPlayer, bytes32[100] choiceHash, uint8 serialNo);

event consoleEvent(string consolevalue);
event uintconsoleEvent(uint8 consolevalue);
event bytesConsoleEvent(bytes consolevalue);
event bytes32ConsoleEvent(bytes32 consolevalue);

event revealTitle(bool isTileRevealed);

	constructor() public {
	}

    function register() public    {
        if (player1.addressOfPlayer == address(0)){
            player1.addressOfPlayer = msg.sender;
            player1.serialNo = 1;
            emit consoleEvent('Player1 is set');
            emit PlayerEvent(player1.addressOfPlayer, player1.choiceHash, player1.serialNo);
        }
        else if (player2.addressOfPlayer == address(0)){
             player2.addressOfPlayer = msg.sender;
             player2.serialNo = 2;
             emit consoleEvent('Player2 is set');
             emit PlayerEvent(player2.addressOfPlayer, player2.choiceHash, player2.serialNo);
        }
    }

    function setShips(bytes32[100] memory choiceHash) public {
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
            emit consoleEvent('Msg Sender is Player 1');
            if( keccak256(abi.encodePacked(randomKey,value)) == player1.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit revealTitle(true);
            }else{
                emit revealTitle(false);
            }
        }
        else if (msg.sender == player2.addressOfPlayer){
            emit consoleEvent('Msg Sender is player2');
            if( keccak256(abi.encodePacked(randomKey,value)) == player1.choiceHash[pos] ){
                player1.choice[pos] = value;
                emit revealTitle(true);
            }else{
                emit revealTitle(false);
            }
        }
    }

    

}
