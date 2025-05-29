import React from 'react'
import { Message, Placeholder } from 'rsuite';

const styles = {
    background: '#000',
    padding: 20,
    position: 'relative'
  };




function CostemMessage({type,message}) {

    const getMessageContent = () => {
       return ( <Message  type={type} bordered showIcon>
        <strong>{type}!</strong> {message}
      </Message>)
      };

  return (
    <div style={styles} >
    {getMessageContent}
    </div>
  )
}

export default CostemMessage;