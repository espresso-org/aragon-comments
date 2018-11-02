import React from 'react'
import styled from 'styled-components'
import Blockies from 'react-blockies'

export const Comment = ({ author, message, date }) =>
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
