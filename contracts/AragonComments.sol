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

    mapping (address => mapping (bytes32 => Comment[])) public comments; // app => threadName => comments

    function initialize() onlyInit public {
        initialized();
    }

    function postComment(string _comment, address _author) 
        public 
        auth("COMMENT_ROLE")
    {
        postComment(_comment, _author, "");
    }

    function postComment(string _comment, address _author, string _threadName) public {
        comments[msg.sender][keccak256(_threadName)].push(Comment({
            author: _author,
            date: now,
            message: _comment
        }));
        emit NewComment(msg.sender, 42, _comment);
    }    

    /*
     * TODO: Uncomment when bug https://github.com/aragon/aragon.js/issues/186 is fixed.
    function getComment(address _app, uint256 _index) external returns (address author, uint256 date, string message) {
        return getComment(_app, _index, "");
    }*/

    function getComment(address _app, uint256 _index, string _threadName) public view returns (address author, uint256 date, string message) {
        Comment storage comment = comments[_app][keccak256(_threadName)][_index];

        author = comment.author;
        date = comment.date;
        message = comment.message;        
    }    

    /*
     * TODO: Uncomment when bug https://github.com/aragon/aragon.js/issues/186 is fixed.
    function commentsCount(address _app) external view returns (uint256) {
        return commentsCount(_app, "");
    }*/

    
    function commentsCount(address _app, string _threadName) public view returns (uint256) {
        return comments[_app][keccak256(_threadName)].length;
    }


}