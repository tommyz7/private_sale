pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';


contract PrivateSale is Pausable {
    using SafeMath for uint256;

    ERC20 public token;
    uint256 public rate = 1000;

    function PrivateSale(address _token) public {
        token = ERC20(_token);
    }

    function setToken(address _tokenAddr) public onlyOwner {
        token = ERC20(_tokenAddr);
    }

    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    function transferToken(address _to, uint256 _value) public onlyOwner {
        token.transfer(_to, _value);
    }

    function () public payable whenNotPaused {
        require(token != address(0));
        require(msg.value > 0);

        uint256 amount = msg.value.mul(rate);
        uint256 currentBal = token.balanceOf(this);
        if (currentBal >= amount) {
            owner.transfer(msg.value);
            token.transfer(msg.sender, amount);
        } else {
            uint256 value = currentBal.div(rate);
            owner.transfer(value);
            token.transfer(msg.sender, currentBal);
            msg.sender.transfer(msg.value.sub(value));
        }
    }
}
