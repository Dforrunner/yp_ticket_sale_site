import React, { forwardRef } from 'react';
import QRCode from 'qrcode.react';

export default function PrintTicket() {
  return forwardRef(({ ticketVal, orderFormData, eventData }, ref) => (
    <div ref={ref}>
      <h1 className='text-3xl text-center my-10'>Digital Ticket</h1>

      <div className='flex flex-col justify-center items-center'>
        <div className='w-1/2'>
          <QRCode value={ticketVal} includeMargin={true} size={400} />
        </div>

        <div className='w-1/2 mt-8'>
          <h2 className='font-semibold text-2xl'>Buyer:</h2>
          <p>
            <b>Name:</b> {orderFormData.firstname} {orderFormData.lastname}
          </p>
          <br />

          <h2 className='font-semibold text-2xl'>Order Info:</h2>
          <p>
            <b>Title:</b> {orderFormData.product}
          </p>
          <p>
            <b>Quantity:</b> {orderFormData.qty}
          </p>
          <p>
            <b>Purchase Price:</b> ${orderFormData.price}
          </p>
          {orderFormData.tipAmount > 0 && (
            <p>
              <b>Donation Amount:</b> ${orderFormData.tipAmount} - {'Thank you! :)'}
            </p>
          )}
          <p>
            <b>Total:</b> {orderFormData.total}
          </p>

          <br />
          <h2 className='font-semibold text-2xl'>Event Info:</h2>
          <p>
            <b>Event Date:</b> {eventData.date_time}
          </p>
          <p>
            <b>Location:</b> {eventData.venue}
          </p>
        </div>
      </div>
    </div>
  ));
}
