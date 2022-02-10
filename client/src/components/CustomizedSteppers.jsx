import * as React from 'react';
import {styled} from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import StepConnector, {stepConnectorClasses} from '@mui/material/StepConnector';

const QontoConnector = styled(StepConnector)(({theme}) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',

    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#1183dc',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#1183dc',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#868686',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')(({theme, ownerState}) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#868686',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
        color: '#1183dc',
    }),
    '& .QontoStepIcon-completedIcon': {
        color: '#1183dc',
        zIndex: 1,
        fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
}));

function QontoStepIcon(props) {
    const {active, completed, className} = props;

    return (
        <QontoStepIconRoot ownerState={{active}} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon"/>
            ) : (
                <div className="QontoStepIcon-circle"/>
            )}
        </QontoStepIconRoot>
    );
}


const CustomizedSteppers = ({activeStep = 0, handleChangeIndex, labels, highestCompletedTab}) => {
    return (
        <Stack sx={{width: '100%'}} spacing={4}>
            <Stepper
                alternativeLabel
                activeStep={activeStep}
                connector={<QontoConnector/>}>
                {labels.map((label, index) => (
                    <Step
                        key={label}
                        onClick={() =>
                            (index < activeStep || index <= highestCompletedTab) && handleChangeIndex(index)
                        }>
                        <StepLabel StepIconComponent={QontoStepIcon}>
                            <span className='text-black'>{label}</span>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Stack>
    );
}

export default CustomizedSteppers;
