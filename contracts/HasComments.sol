pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/IKernel.sol";
import "@aragon/os/contracts/kernel/KernelConstants.sol";
import "./AragonComments.sol";


contract HasComments {

    event SetAragonComments(address indexed entity);

    AragonComments public aragonComments;

    function acl() external view returns (address) {
        return kernel().acl();
    }    

    function setAragonComments(address _aragonComments) public {
        aragonComments = AragonComments(_aragonComments);
        emit SetAragonComments(msg.sender);
    }

    function contractAddress() external view returns (address) {
        return this;
    }
         
    /*
    function postComment(string comment) public {
        aragonComments.postComment(comment, msg.sender);
    }*/

    
    function postComment(string comment, string threadName) public {
        aragonComments.postComment(comment, msg.sender);
    }

    function kernel() public view returns (IKernel);

}