import React, { useRef, useState } from 'react';

import SliderTabs from '../SliderTabs';
import { useLocation, Navigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import PosterImage from './PosterImage';
import Checkout from './Checkout';
import Payment from './Payment';
import Ticket from './Ticket';
import OrderSummary from './OrderSummary';
import SubmitBtn from './SubmitBtn';
import PrintTicketBtn from './PrintTicketBtn';

export default function PurchasePage() {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [clientSecret, setClientSecret] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [highestCompletedTab, setHighestCompletedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketVal, setTicketVal] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [tip, setTip] = useState('');
  const [removeTip, setRemoveTip] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentBtnText, setPaymentBtnText] = useState('Pay Now');
  const [completed, setCompleted] = useState(false);
  const [orderFormData, setOrderFormData] = useState({});

  const location = useLocation();
  let productData = location.state;

  //if (!productData || !productData.title || !productData.price) return <Navigate to='/' />;

  const handleChangeIndex = (index) => {
    if (index > highestCompletedTab) setHighestCompletedTab(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTabIndex(index);
  };

  const handleCheckout = (orderDetails) => {
    setOrderFormData(orderDetails);
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderDetails),
    })
      .then((res) => res.json())
      .then((data) => {
        const cS = data.clientSecret;
        setClientSecret(cS);
        setIsLoading(false);
        handleChangeIndex(1);
      });
  };

  const handlePaymentSuccess = (data) =>
    fetch('/api/payment-success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userData: orderFormData, eventData: productData }),
    })
      .then((res) => res.json())
      .then(({ ticket }) => setTicketVal(ticket))
      .catch((err) => console.log(err));

  return (
    <div className={`text-black md:flex md:justify-center md:items-center bg-white min-h-full`}>
      <div className='md:hidden'>
        <PosterImage />
      </div>

      <div className='flex flex-row w-full'>
        <div className='w-full md:w-[70%] md:p-20' id='PurchasePage'>
          <div className='w-full p-4'>
            <h1 className='text-center p-1'>Ticket Purchase</h1>

            <SliderTabs
              value={tabIndex}
              highestCompletedTab={highestCompletedTab}
              handleChangeIndex={handleChangeIndex}
              labels={['Place Order', 'Payment', 'Get Ticket']}
            >
              <Checkout
                index={0}
                activeStep={tabIndex}
                handleCheckout={handleCheckout}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setOrderQty={setOrderQty}
                orderQty={orderQty}
                tip={tip}
                setTip={setTip}
                {...productData}
              />

              {clientSecret ? (
                <Payment
                  index={1}
                  clientSecret={clientSecret}
                  handleChangeIndex={handleChangeIndex}
                  activeStep={tabIndex}
                  handlePaymentSuccess={handlePaymentSuccess}
                  setMessage={setMessage}
                  setPaymentBtnText={setPaymentBtnText}
                  setCompleted={setCompleted}
                  setIsLoading={setIsLoading}
                  completed={completed}
                />
              ) : (
                <div className='p-5 text-center'>
                  <h2> Please place order first.</h2>
                </div>
              )}

              {completed ? (
                <Ticket
                  index={2}
                  activeStep={tabIndex}
                  ticketVal={ticketVal}
                  orderFormData={orderFormData}
                  eventData={productData}
                  componentRef={componentRef}
                />
              ) : (
                <div className='p-5 text-center'>
                  <h2>Ticket hasn't been generated yet. Please complete previous step first.</h2>
                </div>
              )}
            </SliderTabs>
          </div>

          <OrderSummary
            tip={tip}
            setTip={setTip}
            removeTip={removeTip}
            setRemoveTip={setRemoveTip}
            orderQty={orderQty}
            productData={productData}
            message={message}
            tabIndex={tabIndex}
            completed={completed}
          >
            {(tabIndex === 0 || !clientSecret) && (
              <SubmitBtn isLoading={isLoading} targetFormId='order-form' text='Checkout' />
            )}

            {tabIndex === 1 && clientSecret && (
              <SubmitBtn
                isLoading={isLoading}
                targetFormId='payment-form'
                text={paymentBtnText}
                disabled={isLoading}
                onClick={() => completed && handleChangeIndex(2)}
              />
            )}

            {tabIndex === 2 && completed && <PrintTicketBtn handlePrint={handlePrint} />}
          </OrderSummary>
        </div>

        {/*<Footer/>*/}
      </div>
    </div>
  );
}
