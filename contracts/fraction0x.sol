pragma solidity ^0.4.24;
import './StandardToken.sol';
import './Ownable.sol';


contract fraction0x is StandardToken, Ownable
{
    
  string public constant name = "Solar91";
  string public constant symbol = "Solar91";
  uint32 public constant decimals = 18;    
  uint256 public totalReleased;
  
  uint256 public totalSupply = uint256(1000000000).mul(1 ether); //Total fraction0x Tokens
   
  mapping(address=>mapping(address=>bool)) public approveByOwner;
  
  address public saleContract;
  
  
  event ApproveToTransfer(address _seller, address _buyer);
  event disApproveToTransfer(address _seller, address _buyer);
  event SaleContractActivation(address saleContract, uint256 tokensForSale);




  constructor(address _newOwner) public 
  {
    require(_newOwner != address(0));
    totalReleased = 0; 
    owner = _newOwner;
      
  }


  function activateSaleContract(address _saleContract) public onlyOwner //transfer sale tokens to crowdsale contract
  
  {
    require(_saleContract != address(0));
    saleContract = _saleContract;
    balances[saleContract] = balances[saleContract].add(totalSupply);
    totalReleased = totalReleased.add(totalSupply);
    require(totalReleased <= totalSupply);
    
    emit Transfer(address(this), saleContract, totalSupply);
    emit SaleContractActivation(saleContract, totalSupply);
  }
  
  
  //this function will approve by owner to transfer
  
  function approveTransfer(address _seller, address _buyer) public onlyOwner  returns (bool) {
    approveByOwner[_seller][_buyer] = true;
    emit ApproveToTransfer(_seller,_buyer);
    return true;
  }
  
  function disApproveTransfer(address _seller, address _buyer) public onlyOwner  returns (bool) {
    if(approveByOwner[_seller][_buyer]==true)
    {
      approveByOwner[_seller][_buyer] = false;
      emit disApproveToTransfer(_seller,_buyer);
      return true; 
    }
  }

 
  function transfer(address _to, uint256 _value) public  returns (bool) {
    require(approveByOwner[msg.sender][_to]==true);
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public  returns (bool) {
    require(approveByOwner[_from][_to]==true);
    return super.transferFrom(_from, _to, _value);
    
  }

  function approve(address _spender, uint256 _value) public  returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint _addedValue) public  returns (bool success) {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(address _spender, uint _subtractedValue) public  returns (bool success) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }

  function saleTransfer(address _to, uint256 _value) public returns (bool) {
   
    require(saleContract != address(0));
    require(msg.sender == saleContract);
    return super.transfer(_to, _value);
  }


}
  



