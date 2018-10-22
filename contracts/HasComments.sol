pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/IKernel.sol";
import "@aragon/os/contracts/kernel/KernelConstants.sol";
import "./AragonComments.sol";


contract HasComments {

    event SetAragonComments(address indexed entity);

    AragonComments private aragonComments;

    function getAragonCommentsApp() public returns (AragonComments) {
        return aragonComments;
    }

    function acl() external view returns (address) {
        return kernel().acl();
    }    

    function setAragonComments(address _aragonComments) public {
        aragonComments = AragonComments(_aragonComments);
        emit SetAragonComments(msg.sender);
    }    
         

    function postComment(string comment) public;
    function kernel() public view returns (IKernel);

}