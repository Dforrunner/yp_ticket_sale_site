import React, {forwardRef, useRef, useState} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import {FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField} from "@mui/material";
import SliderTabs from "./SliderTabs";
import {useLocation, Navigate} from 'react-router-dom'
import Loader from "./Loader";
import QRCode from 'qrcode.react';
import {useReactToPrint} from "react-to-print";
import InputField from "./InputField";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const TipBtn = ({amount, setTip}) =>
    <button type='button'
            className='bg-gray-500 rounded px-5 md:px-8 py-3'
            onClick={() => setTip(amount)}
    >${amount}</button>


const Checkout = ({
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
                      setTip
                  }) => {

    const [emailErr, setEmailErr] = useState(false);
    const [qtyErr, setQtyErr] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLoading) return;

        const extraTicketUsers = [];

        e.target.querySelectorAll('[name="additionalTickets[]"]').forEach(i => {
            extraTicketUsers.push(i.value)
        })

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
            total: (orderQty * price) + Number(tip ? tip : 0),
            price
        }


        if (formData.email !== formData.emailConfirm)
            return setEmailErr(true);

        if (orderQty < 1)
            return setQtyErr(true);

        setIsLoading(true)

        handleCheckout(formData)
    }


    return (

        <form onSubmit={handleSubmit}
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
                            marginRight: 10
                        }}
                        InputProps={{
                            readOnly: true,
                        }}
                        name='product'
                        label="Product Name"
                        value={product_name}/>

                    <FormControl
                        style={{
                            width: '20%',
                            color: 'black'
                        }}
                    >
                        <InputLabel id="demo-simple-select-label">QTY*</InputLabel>
                        <Select
                            required
                            type='number'
                            label="QTY"
                            name='qty'
                            MenuProps={{
                                style: {
                                    maxHeight: 400,
                                }
                            }}
                            value={orderQty}
                            error={qtyErr}
                            defaultValue={1}
                            onChange={(e) => {
                                const q = e.target.value;

                                q >= 1 && setQtyErr(false);

                                q > available_qty
                                    ? setOrderQty(available_qty)
                                    : setOrderQty(Math.ceil(Number(q)))
                            }}
                        >
                            {available_qty > 0 &&
                            [...Array(available_qty)].map((_, i) =>
                                <MenuItem value={i + 1} key={`qtyListItem${i}`}>{i + 1}</MenuItem>
                            )
                            }
                        </Select>
                    </FormControl>
                </div>

                {product_summary && <p className='text-black text-sm text-gray-600 py-6 px-2'>
                    {product_summary}
                </p>}
            </div>

            <div className='mt-6'>
                <h2 className='text-2xl'>Contact information</h2>
                <div className='flex flex-wrap mt-2'>
                    <InputField
                        required
                        label="First Name"
                        name='firstname'
                    />
                    <InputField
                        required
                        label="Last Name"
                        name='lastname'
                    />
                    <InputField
                        required
                        type='email'
                        label="Email"
                        name='email'
                    />
                    <InputField
                        required
                        error={emailErr}
                        type='email'
                        name='emailConfirm'
                        label="Confirm Email"
                    />

                    {orderQty > 1 && (

                        <div className='w-full'>
                            <div className='w-full h-[0.25px] bg-gray-400 my-5 '/>
                            <h2 className='text-base text-gray-800 pb-2'>Additional information required</h2>

                            <div className='flex flex-wrap'>
                                {
                                    [...Array(orderQty - 1)].map((_, i) => (
                                        <InputField
                                            required
                                            key={`ticker#${2 + i}`}
                                            label={`Full name for ticket ${2 + i}`}
                                            name='additionalTickets[]'
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {request_tip &&
            <div className='mt-6'>
                <h2 className='text-2xl pb-2'>Donation</h2>

                {tip_summary &&
                <p className='text-black text-sm text-gray-800 py-6 px-2'>
                    {tip_summary}
                </p>
                }

                <div className='flex justify-center items-center'>
                    <div className='flex justify-evenly items-center w-full'>
                        <TipBtn amount={5} setTip={setTip}/>
                        <TipBtn amount={10} setTip={setTip}/>
                        <TipBtn amount={15} setTip={setTip}/>
                        <TipBtn amount={20} setTip={setTip}/>
                    </div>
                </div>


                <div className='flex flex-row justify-between mt-5'>

                    <FormControl fullWidth sx={{m: 1}}>
                        <InputLabel
                            htmlFor="outlined-adornment-amount">{`${tip ? 'Tip' : 'Custom'} Amount`}</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-amount"
                            value={tip}
                            onChange={e => {
                                const tipAmount = e.target.value > 0 && e.target.value < 1
                                    ? 1
                                    : e.target.value
                                setTip(tipAmount)
                            }}
                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                            label={`${tip ? 'Tip' : 'Custom'} Amount`}
                            type='number'
                            name='tipAmount'
                        />
                    </FormControl>

                </div>
            </div>
            }
        </form>


    )
}

const Payment = ({clientSecret, ...rest}) => {
    return (
        <div className='flex justify-center mt-10'>
            <div className='md:w-[90%] min-h-[300px]'>
                <h2 className='text-2xl mb-6'>Payment Information</h2>
                <Elements
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe'
                        }
                    }}
                    stripe={stripePromise}
                >
                    <CheckoutForm clientSecret={clientSecret} {...rest}/>
                </Elements>
            </div>
        </div>
    )
}

const PostImg = () =>
    <div className='w-full truncate'>
        <img src={'/images/poster.png'} alt='Poster' className='w-full'/>
    </div>


const OrderSummary = ({
                          orderQty,
                          productData,
                          tip,
                          setTip,
                          removeTip,
                          setRemoveTip,
                          message,
                          tabIndex,
                          completed,
                          children
                      }) => {

    const total = (orderQty * productData.price) + Number(tip ? tip : 0)

    return (
        <div className='md:h-screen relative top-0'>
            <div className='h-full w-full md:w-[30%] md:border-l-2 md:fixed md:top-0 md:right-0'>

                <div className='hidden md:inline w-full'>
                    <PostImg/>
                </div>

                <div className='md:hidden w-full h-[0.25px] bg-gray-500 my-8 '/>

                <div className='flex flex-col justify-between md:h-[75%] p-3'>
                    <div className='px-5'>
                        <h2 className='font-semibold'>Order Summary</h2>

                        <div className='flex justify-between text-gray-600 p-2 mt-1'>
                            <p>{orderQty} ticket{orderQty > 1 && 's'} x ${productData.price}</p>
                            <p>${orderQty * productData.price}</p>
                        </div>

                        {tip > 0 &&
                        <div className='flex justify-between text-gray-600 p-2 mt-1'
                             onMouseOver={() => setRemoveTip(true)}
                             onMouseLeave={() => setRemoveTip(false)}
                        >

                            <p>
                                {removeTip &&
                                <span className='text-gray-400 cursor-pointer mx-1' onClick={() => {
                                    setTip('');
                                    setRemoveTip(false);
                                }}>x</span>
                                }
                                Tip - Thank you!
                            </p>
                            <p>${tip}</p>
                        </div>
                        }

                        {completed &&
                        <div className='flex justify-between text-gray-600 p-2 mt-1'>
                            <p>You Paid</p>
                            <p>(${total})</p>
                        </div>
                        }

                        <div className='w-full h-[0.25px] bg-gray-400 mt-5 '/>
                        <div className='flex justify-between font-semibold p-4'>
                            <p>Total</p>
                            <p>${completed ? 0 : total}</p>
                        </div>
                    </div>

                    <div>
                        {tabIndex === 1 &&
                        <p className='text-sm p-7'>
                            By clicking "Pay Now", I accept the Terms of Service and have read the Privacy Policy.
                        </p>
                        }

                        <p className='text-gradient-500 text-center'>{message}</p>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SubmitBtn = ({
                       isLoading,
                       text,
                       targetFormId,
                       disabled = false
                   }) =>
    <div className='flex justify-center items-center bg-[#3071BB]
        hover:bg-[#3584DF] w-[90%] h-[50px] text-white m-5 rounded'>
        {isLoading
            ? <Loader/>
            : <button
                disabled={disabled}
                className='w-full h-full cursor-pointer'
                form={targetFormId}
                type='submit'
            >
                {text}
            </button>}
    </div>

const PrintTicket = forwardRef(({ticketVal, orderFormData, eventData}, ref) =>
    <div ref={ref}>
        <h1 className='text-3xl text-center my-10'>Digital Ticket</h1>

        <div className='flex'>
            <div className='w-1/2'>
                <QRCode
                    value={ticketVal}
                    includeMargin={true}
                    size={400}
                />
            </div>

            <div className='w-1/2 mt-8'>

                <h2 className='font-semibold text-2xl'>Buyer:</h2>
                <p><b>Name:</b> {orderFormData.firstname} {orderFormData.lastname}</p>
                <br/>

                <h2 className='font-semibold text-2xl'>Order Info:</h2>
                <p><b>Title:</b> {orderFormData.product}</p>
                <p><b>Quantity:</b> {orderFormData.qty}</p>
                <p><b>Purchase Price:</b> ${orderFormData.price}</p>
                {orderFormData.tipAmount > 0 &&
                <p><b>Donation Amount:</b> ${orderFormData.tipAmount} - Thank you! :)</p>
                }
                <p><b>Total:</b> {orderFormData.total}</p>

                <br/>
                <h2 className='font-semibold text-2xl'>Event Info:</h2>
                <p><b>Event Date:</b> {eventData.date_time}</p>
                <p><b>Location:</b> {eventData.venue}</p>
            </div>
        </div>

    </div>
)

const PrintTicketBtn = ({handlePrint}) =>
    <div className='flex justify-center items-center bg-[#3071BB]
        hover:bg-[#3584DF] w-[90%] h-[50px] text-white m-5 rounded'>

        <button
            className='w-full h-full cursor-pointer'
            type='button'
            onClick={handlePrint}
        >
            Print Ticket
        </button>
    </div>

const Ticket = ({ticketVal, activeStep, index, handlePrint, componentRef, ...rest}) => {

    return (
        <div className={`w-full ${activeStep !== index ? 'hidden' : 'inline'}`}>

            <h2 className='text-2xl mt-5'>Your Ticket: </h2>

            <div className='flex justify-center items-center'>
                {!ticketVal
                    ? <p>Ticket hasn't been generated yet.</p>
                    : <QRCode
                        value={ticketVal}
                        includeMargin={true}
                        size={350}
                    />
                }
            </div>

            <div className='hidden'>
                <PrintTicket
                    ticketVal={ticketVal}
                    {...rest}
                    ref={componentRef}
                />
            </div>

            {ticketVal &&
            <p className='text-gray-600'>
                Thank you for purchasing a ticket!
                Your ticket has been emailed to you.
                You can also screen shoot the QR code and use that to check-in.
            </p>
            }

        </div>
    )
}


const PurchasePage = () => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });


    const [clientSecret, setClientSecret] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const [highestCompletedTab, setHighestCompletedTab] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    const [ticketVal, setTicketVal] = useState('');
    const [orderQty, setOrderQty] = useState(1);
    const [tip, setTip] = useState('');
    const [removeTip, setRemoveTip] = useState(false);
    const [message, setMessage] = useState('');
    const [paymentBtnText, setPaymentBtnText] = useState('Pay Now');
    const [completed, setCompleted] = useState(false);
    const [orderFormData, setOrderFormData] = useState({});

    const location = useLocation()
    let productData = location.state

    if (!productData || !productData.title || !productData.price)
        return (<Navigate to='/'/>)

    const handleChangeIndex = (index) => {
        if (index > highestCompletedTab) setHighestCompletedTab(index);
        window.scrollTo({top: 0, behavior: 'smooth'});
        setTabIndex(index);
    }


    const handleCheckout = (orderDetails) => {
        setOrderFormData(orderDetails)
        // Create PaymentIntent as soon as the page loads
        fetch("/create-payment-intent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(orderDetails),
        })
            .then(res => res.json())
            .then(data => {
                const cS = data.clientSecret;
                setClientSecret(cS);
                setIsLoading(false);
                handleChangeIndex(1);
            });
    }

    const handlePaymentSuccess = (data) =>
        fetch('/payment-success', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...data, userData: orderFormData, eventData: productData}),
        })
            .then(res => res.json())
            .then(({ticket}) => setTicketVal(ticket))
            .catch(err => console.log(err))

    return (
        <div className='text-black md:flex md:justify-center md:items-center min-h-screen bg-white'>
            <div className='md:hidden'>
                <PostImg/>
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

                            {clientSecret ?
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
                                : <div className='p-5 text-center'><h2> Please place order first.</h2></div>
                            }

                            {completed
                                ? <Ticket
                                    index={2}
                                    activeStep={tabIndex}
                                    ticketVal={ticketVal}
                                    orderFormData={orderFormData}
                                    eventData={productData}
                                    componentRef={componentRef}
                                />
                                : <div className='p-5 text-center'><h2>Ticket hasn't been generated yet. Please complete
                                    previous step first.</h2></div>}
                        </SliderTabs>

                    </div>


                    <OrderSummary tip={tip}
                                  setTip={setTip}
                                  removeTip={removeTip}
                                  setRemoveTip={setRemoveTip}
                                  orderQty={orderQty}
                                  productData={productData}
                                  message={message}
                                  tabIndex={tabIndex}
                                  completed={completed}
                    >
                        {(tabIndex === 0 || !clientSecret) &&

                        <SubmitBtn
                            isLoading={isLoading}
                            targetFormId='order-form'
                            text='Checkout'
                        />
                        }

                        {(tabIndex === 1 && clientSecret) &&
                        <SubmitBtn
                            isLoading={isLoading}
                            targetFormId='payment-form'
                            text={paymentBtnText}
                            disabled={isLoading}
                            onClick={() => completed && handleChangeIndex(2)}
                        />}

                        {(tabIndex === 2 && completed) &&
                        <PrintTicketBtn handlePrint={handlePrint}/>
                        }

                    </OrderSummary>
                </div>


                {/*<Footer/>*/}
            </div>
        </div>
    )
}

export default PurchasePage;