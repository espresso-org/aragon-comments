import React from 'react'
import styled from 'styled-components'
import contract from './contrat'
import { Button } from '@aragon/ui'
import aclContract from './acl-contract'
import { keccak256 } from 'js-sha3'
import PropTypes from 'prop-types'
import { Comment } from './components/comment'
import { LoadingRing } from './components/loading-ring'

const COMMENT_ROLE = `0x${keccak256('COMMENT_ROLE')}`
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

export class CommentThread extends React.Component {
    static defaultProps = {
      thread: ''
    }

    state = { 
      currentComment: '', 
      comments: [], 
      isEnabled: true,
      isLoading: true
    }

    contract

    constructor(props) {
      super(props)
      this.init()
      window.comments = this
    }

    async init() {

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

        const events = this.contract.events()

        events.subscribe(event => {
          console.log('event', event)
          this.setState({ currentComment: '' })
          this.updateThread()
        })

        events
          .filter(e => e.event === 'NewComment')
          .filter(e => e.returnValues.app === this.hasCommentsAppAddress)
          .filter(e => e.returnValues.threadName === this.props.thread)
          .subscribe(e => {
            if (e.returnValues.message === this.state.currentComment) {
              this.setState({ currentComment: '' })
            }

            this.updateThread()
          })

        this.setState({ isEnabled: true, isLoading: false })
      } else {
        this.setState({ isEnabled: false, isLoading: false })
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

      this.setState({ comments, isLoading: false })
    }

    activateComments = () => {
      this.props.aragonApp.setAragonComments(this.contractAddress)
    }

    postComment = async () => {
      this.props.aragonApp.postComment(this.state.currentComment, this.props.thread).subscribe(console.log)
      //      this.setState({ currentComment: '' })
    }

    render() {
      return (
        <Main {...this.props}>
          { this.state.isLoading &&
              <LoadingRing spin={true} />
          }
          { this.state.isEnabled
            ? <div>
              {this.state.comments.map((comment, i) =>
                <Comment {...comment} />
              )}
              <br /><br />
              <InputContainer>
                <InputBox
                  type='text'
                  value={this.state.currentComment}
                  onChange={e => this.setState({ currentComment: e.target.value })}
                  placeholder='Enter a comment'
                />
                <SendButton onClick={this.postComment}>Send</SendButton>
              </InputContainer>
            </div>
            : <div style={{ textAlign: 'center' }}>
                Comments are not enabled <br />
              <Button onClick={this.activateComments}>Enable Comments</Button>
            </div>
          }
        </Main>
      )
    }
}

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
`

const InputContainer = styled.div`
  display: flex;
`

const InputBox = styled.input`
    outline: none;
    flex-grow: 100;
    width: 236px;
    height: 43px;
    border: none;
    padding-left: 6px;
`

const SendButton = styled(Button).attrs({ mode: 'strong' })`
  width: 62px;
  min-width: 62px;
  max-width: 62px;
  height: 41px;
`
