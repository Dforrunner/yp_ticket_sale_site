import { TextField } from '@mui/material';
import React from 'react';

const InputField = ({ style, ...rest }) => (
  <div className='p-1 rounded w-full md:w-1/2'>
    <TextField
      {...rest}
      style={{
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '5px',
        ...style,
      }}
    />
  </div>
);

export default InputField;
