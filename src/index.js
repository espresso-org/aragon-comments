import React from 'react'
import styled from 'styled-components'
import contract from './contrat'
import { Button } from '@aragon/ui'
import aclContract from './acl-contract'
import { keccak256 } from 'js-sha3'
import PropTypes from 'prop-types'
import Blockies from 'react-blockies'

const COMMENT_ROLE = `0x${keccak256('COMMENT_ROLE')}`
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

export class CommentThread extends React.Component {
    static propTypes = {
      aragonApp: PropTypes.object,
      thread: PropTypes.string
    }

    static defaultProps = {
      thread: ''
    }

    state = { currentComment: '', comments: [], isActivated: true }
    contract

    constructor(props) {
      super(props)
      this.init()
      window.comments = this
    }

    async init() {
      await wait(500)

      if (this.props.aragonApp) {
        this.hasCommentsAppAddress = await this.getContractAddress()
        await this.initializeContract()

        this.props.aragonApp.events()
          .filter(e => e.event === 'SetAragonComments')
          .subscribe(e => this.initializeContract())
      }
    }

    initializeContract = async () => {
      const savedContractAddr = await observableToPromise(this.props.aragonApp.call('aragonComments'))
      if (savedContractAddr !== EMPTY_ADDRESS) {
        this.contract = this.props.aragonApp.external(savedContractAddr, contract.abi)

        this.contract.events().subscribe(event => {
          this.updateThread()
        })

        this.updateThread()

        this.setState({ isActivated: true })
      } else {
        this.setState({ isActivated: false })
        this.contractAddress = await this.getAragonCommentsAddress()
      }
    }

    /**
     * Get AragonComments contract address from ACL events
     */
    async getAragonCommentsAddress() {
      let aclAddr = await observableToPromise(this.props.aragonApp.call('acl'))
      let acl = this.props.aragonApp.external(aclAddr, aclContract.abi)

      return observableToPromise(
        acl.events()
          .filter(e => e.returnValues.role === COMMENT_ROLE)
          .map(e => e.returnValues.app)
          .first()
      )
    }

    async getContractAddress() {
      return observableToPromise(this.props.aragonApp.call('contractAddress'))
    }

    updateThread = async () => {
      const commentsCount = await observableToPromise(this.contract.commentsCount(this.hasCommentsAppAddress, this.props.thread))

      let comments = []

      for (let i = 0; i < commentsCount; i++) {
        comments.push(await observableToPromise(this.contract.getComment(this.hasCommentsAppAddress, i, this.props.thread)))
      }

      this.setState({ comments })
    }

    activateComments = () => {
      this.props.aragonApp.setAragonComments(this.contractAddress)
    }

    postComment = async () => {
      this.props.aragonApp.postComment(this.state.currentComment, this.props.thread).subscribe(console.log)
      this.setState({ currentComment: '' })
    }

    render() {
      return (
        <Main>
          { this.state.isActivated
            ? <div>
              {this.state.comments.map((comment, i) =>
                <Comment {...comment} />
              )}
              <br /><br />
              <InputBox
                type='text'
                value={this.state.currentComment}
                onChange={e => this.setState({ currentComment: e.target.value })}
              />
              <Button onClick={this.postComment}>Send</Button>
            </div>
            : <div style={{ textAlign: 'center' }}>
                        Comments are not active
              <Button onClick={this.activateComments}>Activate Comments</Button>
            </div>
          }
        </Main>
      )
    }
}

const Comment = ({ author, message, date }) =>
  <CommentMain>
    <Author>
      <Blockies
        seed={author}
        size={10}
        scale={3}
        color='#dfe'
        bgColor='#ffe'
        spotColor='#abc'
      />
    </Author>
    <Bubble>
      {message}
    </Bubble>
  </CommentMain>

function observableToPromise(observable) {
  return new Promise(resolve => {
    observable.subscribe(resolve)
  })
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms))
}

const Main = styled.div`
    width: 320px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;  
    margin-left: 10px;  
`

const CommentMain = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`

const Author = styled.div`
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: white;    
    margin-right: 6px;
`

const Bubble = styled.div`
    background: white;
    border-radius: 4px;
    border: 1px solid #eee;
    padding: 10px;
    width: auto;
    flex-grow: 100;
`

const InputBox = styled.input`
    width: 236px;
    height: 43px;
    border: none;
`
