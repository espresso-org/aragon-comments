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
    min-width: 32px;
    max-width: 32px;    
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
    position: relative;

    :after, :before {
      right: 100%;
      top: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
    }

    :after {
      border-color: rgba(255, 255, 255, 0);
      border-right-color: #ffffff;
      border-width: 4px;
      margin-top: -4px;
    }
    
    :before {
      border-color: rgba(194, 225, 245, 0);
      border-right-color: #c2e1f5;
      border-width: 5px;
      margin-top: -5px;
    }
`
