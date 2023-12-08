import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import CustomizedSteppers from './CustomizedSteppers';

const SliderTabs = ({ children, value, handleChangeIndex, labels, highestCompletedTab }) => {
  const theme = useTheme();

  return (
    <Box>
      <CustomizedSteppers
        activeStep={value}
        labels={labels}
        handleChangeIndex={handleChangeIndex}
        highestCompletedTab={highestCompletedTab}
      />

      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {children}
      </SwipeableViews>
    </Box>
  );
};

export default SliderTabs;
