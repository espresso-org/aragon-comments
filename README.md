# Aragon Comments

`Aragon Comments` offers an easy way for developers to integrate discussion threads to their [Aragon]() app. 

## Install

```bash
npm install --save @espresso-org/aragon-comments
```

## Usage

1. Import and inherit the `HasComments` solidity smart contract.

```javascript
import "@espresso-org/aragon-comments/contracts/HasComments.sol";

contract MyApp is HasComments, AragonApp {
    ...
}
```

2. Add the `postComment` function to your smart contract. This function lets you write custom validation logic on the author and message content before posting a comment to a discussion thread.

```javascript
contract MyApp is HasComments, AragonApp {

    function postComment(string comment, string threadName) public {
        aragonComments.postComment(comment, msg.sender, threadName);
    }  

}
```

3. Import and add the `CommentThread` react component to your javascript frontend.

```javascript
import { CommentThread } from '@espresso-org/aragon-comments'

class App extends React.Component {
  render () {
    return (
      <div>
      ...
        <CommentThread 
            aragonApp={this.props.app} 
            thread="my-comment-thread" 
        />
      </div>
    )
  }
}
```

4. Make sure to install the `Aragon Comments` app

```bash
aragon dao install <dao address> aragon-comments
```


