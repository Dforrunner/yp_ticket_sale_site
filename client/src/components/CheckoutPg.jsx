import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import Footer from "./Footer";
import {TextField} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {useEffect, useState} from "react";

const stripePromise = loadStripe("pk_test_51KOpn6BRR1XWE4vwWeOgGvIsFANKoOnoN4o9PeDBXATtnx0CB5MYyF54XN89wBZLvnwn8O2NGFe9zDQfN9HvN59I00v4hWAIsJ");

const PurchasePage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [qty, setQty] = useState(1);

    const handleCheckout = () => {
        // Create PaymentIntent as soon as the page loads
        fetch("/create-payment-intent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({items: [{id: "xl-tshirt"}]}),
        })
            .then(res => res.json())
            .then(data => {
                setClientSecret(data.clientSecret)
            });
    }

    return (
        <div className='text-white w-full'>
            <div className='flex'>
                <div className='w-[70%]'>
                    <div className='p-20' id='PurchasePage'>
                        <h1 className='text-4xl'>Ticket Purchase</h1>

                        <div className='mt-6'>
                            <h2 className='text-2xl pb-2'>Order</h2>
                            <div className='h-[100px] bg-[#fff] w-[97%] rounded p-5'>
                                <Grid container spacing={2}>
                                    <Grid item xs={9}>
                                        <TextField
                                            style={{width: '100%', color: 'black'}}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            label="Product Name"
                                            defaultValue={'Young Professionals of Saint Louis 5K Ball'}
                                        />

                                    </Grid>
                                    <Grid item xs={1}>
                                        <div className='flex h-full  items-center'>
                                            <p className='text-[#404040] w-full text-center'>x</p>
                                        </div>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <TextField
                                            required
                                            type='number'
                                            label="QTY"
                                            value={qty}
                                            onChange={(e) => {setQty(e.target.value)}}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        </div>


                        <div className='mt-6'>
                            <h2 className='text-2xl pb-1'>Contact information</h2>
                            <div className='-ml-2'>
                                <Box
                                    component="form"
                                    sx={{
                                        '& .MuiTextField-root': {
                                            m: 1,
                                            width: '47%',
                                            backgroundColor: 'white',
                                            borderRadius: '5px'
                                        },
                                    }}
                                    noValidate
                                    autoComplete="off"
                                >
                                    <div>
                                        <TextField
                                            required
                                            label="First Name"
                                        />
                                        <TextField
                                            required
                                            label="Last Name"
                                        />

                                    </div>
                                    <div>
                                        <TextField
                                            required
                                            type='email'
                                            label="Email"
                                        />
                                        <TextField
                                            required
                                            type='email'
                                            label="Confirm Email"
                                        />
                                    </div>
                                </Box>
                            </div>
                        </div>


                        <div className='w-[97%] mt-10 drop-shadow'>
                            <h2 className='text-2xl text-white pb-2'>Payment Information</h2>

                            {clientSecret &&
                            <Elements options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    rules: {
                                        '.Label': {
                                            color: 'white'
                                        }
                                    }
                                }
                            }} stripe={stripePromise}>
                                <CheckoutForm clientSecret={clientSecret}/>
                            </Elements>
                            }

                            <p className='text-sm p-5 w-[80%]'>
                                By clicking "Pay Now", I accept the Terms of Service and have read the Privacy Policy.
                            </p>
                            {/*<button type='button' className='text-white py-2 px-5 rounded-[5%] bg-sky-500 border-solid hover:bg-[#453abd] hover:border-[#453abd] border-2 border-sky-500'>Buy</button>*/}
                        </div>
                    </div>

                </div>
                <div className='w-[30%] flex bg-[#fff]'>

                </div>
            </div>

            {/*<Footer/>*/}
        </div>
    )
}

export default PurchasePage;