pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract AragonComments is AragonApp {

    bytes32 constant public COMMENT_ROLE = keccak256("COMMENT_ROLE");

    event NewComment(address indexed entity, uint t, string message);

    struct Comment {
        address author;
        uint256 date;
        string message;
    }

    mapping (address => Comment[]) public comments;

    function initialize() onlyInit public {
        initialized();
    }

    function postComment(string _comment, address _author) public {
        comments[msg.sender].push(Comment({
            author: _author,
            date: now,
            message: _comment
        }));
        emit NewComment(msg.sender, 42, _comment);
    }

    function commentsCount(address _app) external view returns (uint256) {
        return comments[_app].length;
    }


}