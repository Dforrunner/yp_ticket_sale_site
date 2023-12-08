import React, { useState } from 'react';
import InputField from '../InputField';
import WaiverForm from '../WaiverForm';

import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import TipBtn from './TipBtn';
import { calcTotal } from '../../utils/calcTotal';

export default function Checkout({
  index,
  activeStep,
  handleCheckout,
  product_name,
  price,
  tip_summary,
  product_summary,
  available_qty,
  request_tip,
  isLoading,
  setIsLoading,
  setOrderQty,
  orderQty,
  tip,
  setTip,
}) {
  const [emailErr, setEmailErr] = useState(false);
  const [qtyErr, setQtyErr] = useState(false);
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [waiverData, setWaiverData] = useState('');
  const [waiverErr, setWaiverErr] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!waiverData) {
      setWaiverErr(true);
      return;
    }
    setWaiverErr(false);

    if (isLoading) return;

    const extraTicketUsers = [];

    e.target.querySelectorAll('[name="additionalTickets[]"]').forEach((i) => {
      extraTicketUsers.push(i.value);
    });

    const getVal = (name) => e.target[name].value;

    const formData = {
      product: getVal('product'),
      qty: Number(getVal('qty')),
      firstname: getVal('firstname'),
      lastname: getVal('lastname'),
      email: getVal('email'),
      emailConfirm: getVal('emailConfirm'),
      tipAmount: Number(getVal('tipAmount')),
      additionalTickets: extraTicketUsers,
      total: calcTotal(orderQty, price, tip),
      songReq: getVal('songRequest'),
      waiverData,
      price,
    };

    if (formData.email !== formData.emailConfirm) return setEmailErr(true);

    if (orderQty < 1) return setQtyErr(true);

    setIsLoading(true);

    handleCheckout(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${index !== activeStep ? 'hidden' : ''}`}
      id='order-form'
    >
      <div className='mt-6'>
        <h2 className='text-2xl'>Order</h2>
        <div className='flex flex-row justify-between mt-5'>
          <TextField
            style={{
              width: '80%',
              color: 'black',
              marginRight: 10,
            }}
            InputProps={{
              readOnly: true,
            }}
            name='product'
            label='Product Name'
            value={`${product_name} - tickets`}
          />

          <FormControl
            style={{
              width: '20%',
              color: 'black',
            }}
          >
            <InputLabel id='demo-simple-select-label'>QTY*</InputLabel>
            <Select
              required
              type='number'
              label='QTY'
              name='qty'
              MenuProps={{
                style: {
                  maxHeight: 400,
                },
              }}
              value={orderQty}
              error={qtyErr}
              defaultValue={1}
              onChange={(e) => {
                const q = e.target.value;

                q >= 1 && setQtyErr(false);

                q > available_qty ? setOrderQty(available_qty) : setOrderQty(Math.ceil(Number(q)));
              }}
            >
              {available_qty > 0 &&
                [...Array(available_qty)].map((_, i) => (
                  <MenuItem value={i + 1} key={`qtyListItem${i}`}>
                    {i + 1}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>

        {product_summary && (
          <p className='text-black text-sm text-gray-600 py-6 px-2'>{product_summary}</p>
        )}
      </div>

      <div className='mt-6'>
        <h2 className='text-2xl'>Contact information</h2>
        <div className='flex flex-wrap mt-2'>
          <InputField
            required
            label='First Name'
            name='firstname'
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputField
            required
            label='Last Name'
            name='lastname'
            onChange={(e) => setLastName(e.target.value)}
          />
          <InputField required type='email' label='Email' name='email' />
          <InputField
            required
            error={emailErr}
            type='email'
            name='emailConfirm'
            label='Confirm Email'
          />

          {orderQty > 1 && (
            <div className='w-full'>
              <div className='w-full h-[0.25px] bg-gray-400 my-5 ' />
              <h2 className='text-base text-gray-800 pb-2'>Additional information required</h2>

              <div className='flex flex-wrap'>
                {[...Array(orderQty - 1)].map((_, i) => (
                  <InputField
                    required
                    key={`ticker#${2 + i}`}
                    label={`Full name for ticket ${2 + i}`}
                    name='additionalTickets[]'
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='mt-6'>
        <WaiverForm
          fullname={`${firstname} ${lastname}`}
          productName={product_name}
          disabled={!firstname.length || !lastname.length}
          handleData={(data) => setWaiverData(data)}
          waiverErr={waiverErr}
          setWaiverErr={setWaiverErr}
        />
      </div>

      <div className='w-full mt-6'>
        <h2 className='text-2xl'>Song Request</h2>
        <p className='text-black text-sm text-gray-800 py-6 px-2'>List any song requests below.</p>
        <InputField type='text' label='Song Request (song 1, song 2, etc.)' name='songRequest' />
      </div>

      {request_tip && (
        <div className='mt-6'>
          <h2 className='text-2xl pb-2'>Donation</h2>

          {tip_summary && (
            <p className='text-black text-sm text-gray-800 py-6 px-2'>{tip_summary}</p>
          )}

          <div className='flex justify-center items-center'>
            <div className='flex justify-evenly items-center w-full'>
              <TipBtn amount={5} setTip={setTip} />
              <TipBtn amount={10} setTip={setTip} />
              <TipBtn amount={15} setTip={setTip} />
              <TipBtn amount={20} setTip={setTip} />
            </div>
          </div>

          <div className='flex flex-row justify-between mt-5'>
            <FormControl fullWidth sx={{ m: 1 }}>
              <InputLabel htmlFor='outlined-adornment-amount'>{`${
                tip ? 'Tip' : 'Custom'
              } Amount`}</InputLabel>
              <OutlinedInput
                id='outlined-adornment-amount'
                value={tip}
                onChange={(e) => {
                  const tipAmount = e.target.value > 0 && e.target.value < 1 ? 1 : e.target.value;
                  setTip(tipAmount);
                }}
                startAdornment={<InputAdornment position='start'>$</InputAdornment>}
                label={`${tip ? 'Tip' : 'Custom'} Amount`}
                type='number'
                name='tipAmount'
              />
            </FormControl>
          </div>
        </div>
      )}
    </form>
  );
}
