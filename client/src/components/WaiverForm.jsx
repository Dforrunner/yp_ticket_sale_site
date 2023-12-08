import { Button, Drawer, TextField } from '@mui/material';
import React, { useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const conditions = {
  'AGREEMENT TO FOLLOW DIRECTIONS': `I agree to observe and obey all posted rules and
warnings, and further agree to follow any oral instructions or directions given by Young
Professionals of St. Louis, or the employees, representatives or agents of Young Professionals
of St. Louis.`,
  'ASSUMPTION OF THE RISKS AND RELEASE': `I assume full responsibility for personal
injury to myself and (if applicable) my family members, and further release and discharge Young
Professionals of St. Louis for injury, loss or damage arising out of my or my family's use of or
presence upon the facilities of Young Professionals of St. Louis, whether caused by the fault of
myself, my family, Young Professionals of St. Louis or other third parties.`,
  INDEMNIFICATION: `I agree to indemnify and defend Young Professionals of St. Louis
against all claims, causes of action, damages, judgments, costs or expenses, including attorney
fees and other litigation costs, which may in any way arise from my or my family's use of or
presence upon the facilities of Young Professionals of St. Louis.`,
  FEES: `I agree to pay for all damages to the facilities of Young Professionals of St. Louis
caused by any negligent, reckless, or willful actions by me or my family.`,
  'APPLICABLE LAW': `Any legal or equitable claim that may arise from participation in the
above shall be resolved under Missouri law.`,
  'NO DURESS': `I agree and acknowledge that I am under no pressure or duress to sign this
Agreement and that I have been given a reasonable opportunity to review it before signing. I
further agree and acknowledge that I am free to have my own legal counsel review this
Agreement if I so desire. I further agree and acknowledge that Young Professionals of St. Louis
has offered to refund any fees I have paid to use its facilities if I choose not to sign this
Agreement.`,
  ENFORCEABILITY: `The invalidity or unenforceability of any provision of this Agreement,
whether standing alone or as applied to a particular occurrence or circumstance, shall not affect
the validity or enforceability of any other provision of this Agreement or of any other applications
of such provision, as the case may be, and such invalid or unenforceable provision shall be
deemed not to be a part of this Agreement.`,
};

let eName = '';
let eRelation = '';
let eNum = '';
let signature;

const WaiverForm = ({
  fullname,
  disabled,
  productName,
  handleData = () => {},
  waiverErr,
  setWaiverErr,
}) => {
  const [openWaiverDrawer, setOpenWaiverDrawer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eNameErr, setENameErr] = useState(false);
  const [eNumErr, setENumErr] = useState(false);
  const [sigErr, setSigErr] = useState(false);
  const [waiverSuccess, setWaiverSuccess] = useState(false);
  const signaturePadWidth = window.innerWidth > 640 ? 600 : 300;

  const handleSubmit = () => {
    setSubmitted(true);

    !eName ? setENameErr(true) : setENameErr(false);
    !eNum ? setENumErr(true) : setENumErr(false);
    !signature || (signature && signature.isEmpty()) ? setSigErr(true) : setSigErr(false);

    if (!eNameErr && !eNumErr && !sigErr && eName && eNum && !signature.isEmpty()) {
      handleData({ eName, eRelation, eNum, signature: signature.toDataURL() });
      setWaiverErr(false);
      setOpenWaiverDrawer(false);
      setWaiverSuccess(true);
    }
  };

  const CustomInput = ({ name, err, ...rest }) => (
    <TextField
      {...rest}
      error={err}
      name={name}
      size='small'
      variant='standard'
      style={{
        width: '200px',
        backgroundColor: 'white',
        borderRadius: '5px',
        marginLeft: '5px',
      }}
    />
  );

  return (
    <>
      <h2 className='text-2xl'>Waiver</h2>
      <p className='text-black text-sm text-gray-800 py-6 px-2'>
        Please read and complete the waiver prior to the event.
      </p>

      <div>
        <Button
          disabled={disabled}
          variant='contained'
          color={waiverSuccess ? 'success' : 'primary'}
          onClick={() => setOpenWaiverDrawer(true)}
        >
          Read & Complete Waiver
        </Button>

        {waiverErr && <p className='text-red-500'>Please read and complete the waiver</p>}
      </div>

      <Drawer anchor={'bottom'} open={openWaiverDrawer} onClose={() => setOpenWaiverDrawer(false)}>
        <div className='h-[90vh] p-10 md:p-20'>
          <div className='flex flex-row justify-between h-[30px]'>
            <h1 className='font-bold md:text-2xl'>RELEASE OF LIABILITY</h1>
            <Button variant='outlined' onClick={() => setOpenWaiverDrawer(false)}>
              Close
            </Button>
          </div>

          <p className='mt-6'>
            In exchange for participation in the activities of {productName} organized by Young
            Professionals of St. Louis, and/or use of the property, facilities and services of Young
            Professionals of St. Louis, I, <b>{fullname}</b>, agree for myself and (if applicable)
            for the members of my family, to the following:
          </p>

          {Object.keys(conditions).map((val, index) => (
            <p className='mt-6' key={val + index}>
              <b>
                {index + 1}. {val}.
              </b>{' '}
              {conditions[val]}
            </p>
          ))}

          <div className='mt-6'>
            <b>EMERGENCY CONTACT.</b> In case of an emergency, please call
            <CustomInput
              name='e-contact-name'
              err={eNameErr && submitted}
              defaultValue={eName}
              onChange={(e) => (eName = e.target.value)}
            />
            Relationship:
            <CustomInput
              name='e-contact-relation'
              defaultValue={eRelation}
              onChange={(e) => (eRelation = e.target.value)}
            />
            at
            <CustomInput
              name='e-contact-number'
              err={eNumErr && submitted}
              defaultValue={eNum}
              onChange={(e) => (eNum = e.target.value)}
            />
            <div className='mt-6'>
              <b>Signature</b> Please sign in the box below:
              <div
                style={{
                  width: signaturePadWidth,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: sigErr ? '2px solid red' : 'none',
                }}
              >
                <SignatureCanvas
                  penColor='black'
                  canvasProps={{ width: signaturePadWidth, height: 200, className: 'sigCanvas' }}
                  ref={(ref) => (signature = ref)}
                />

                <Button
                  onClick={() => {
                    if (signature) signature.clear();
                  }}
                  variant='outlined'
                  className='float-right'
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className='mt-6 h-[200px]'>
              {eNameErr || eNumErr || sigErr ? (
                <p className='text-red-500 '>
                  Missing required data. Complete lines highlighted in red.
                </p>
              ) : (
                ''
              )}
              <Button variant='contained' type='button' onClick={() => handleSubmit()}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default WaiverForm;
