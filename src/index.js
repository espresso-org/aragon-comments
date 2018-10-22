import React from 'react'
import styled from 'styled-components'
import contract from './contrat'
import { Button } from '@aragon/ui'
import aclContract from './acl-contract'
import { keccak256 } from 'js-sha3'

const COMMENT_ROLE = `0x${keccak256('COMMENT_ROLE')}`
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'


export class CommentThread extends React.Component {

    state = { test: '', currentComment: '', comments: [], isActivated: true }
    contract

    constructor(props) {
        super(props)
        this.init()
        window.comments = this
    }

    async init() {
        await wait(500)

        if (this.props.aragonApp) {
            await this.initializeContract()
            
            this.props.aragonApp.events()
                .filter(e => e.event === 'SetAragonComments')
                .subscribe(e => this.initializeContract())
        }
    }

    initializeContract = async () => {
        console.log('Initialize contract')
        const savedContractAddr = await observableToPromise(this.props.aragonApp.call('getAragonCommentsApp'))
        if (savedContractAddr !== EMPTY_ADDRESS) {
            this.contract = this.props.aragonApp.external(savedContractAddr, contract.abi)

            this.contract.events().subscribe(event => {
                this.updateThread()
            })

            this.updateThread()

            this.setState({ isActivated: true })
        }
        else {
            this.setState({ isActivated: false })
            this.contractAddress = await this.getAragonCommentsAddress()
        }
    }

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

    updateThread = async () => {
        const commentsCount = await observableToPromise(this.contract.commentsCount())

        let comments = []
        
        for (let i = 0; i < commentsCount; i++)
            comments.push(await observableToPromise(this.contract.comments(i)))

        this.setState( { comments })
    }

    activateComments = () => {
        this.props.aragonApp.setAragonComments(this.contractAddress)
    }

    postComment = async () => {
        this.props.aragonApp.postComment(this.state.currentComment).subscribe(console.log)
        this.setState({ currentComment: '' })
    }

    render() {
        return (
            <Main>
                { this.state.isActivated ? 
                    <div>
                        {this.state.comments.map((comment, i) => 
                            <Comment>{comment.message}</Comment>
                        )}
                        <br /><br />
                        <InputBox 
                            type="text" 
                            value={this.state.currentComment} 
                            onChange={e => this.setState({ currentComment: e.target.value })} 
                        />
                        <Button onClick={this.postComment}>Send</Button>
                    </div>
                    :                
                    <div style={{ textAlign: 'center' }}>
                        Comments are not active
                        <Button onClick={this.activateComments}>Activate Comments</Button>
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
    margin-left: 10px;  
`

const Comment = styled.div`
    background: white;
    border-radius: 4px;
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 8px;
`

const InputBox = styled.input`
    width: 236px;
    height: 43px;
    border: none;
`