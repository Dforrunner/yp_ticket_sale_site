import React, {useEffect, useState} from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

const CheckoutForm = ({
                          clientSecret,
                          activeStep,
                          handlePaymentSuccess,
                          handleChangeIndex,
                          index,
                          setMessage,
                          setIsLoading,
                          setPaymentBtnText,
                          setCompleted,
                          completed
                      }) => {
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        if (!stripe || !clientSecret) return;

        if(activeStep < index) handleChangeIndex(activeStep+1);
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(completed) return handleChangeIndex(2);
        if (!stripe || !elements) return;


        setIsLoading(true);

        const {paymentIntent, error} = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });

        setIsLoading(false);

        //Clear data
        elements.getElement(PaymentElement).clear();

        if (error && (error.type === "card_error" || error.type === "validation_error")) {
            setMessage(error.message);
            return;
        }

        const sts = paymentIntent.status;
        if(sts && sts ===  "succeeded") {
            setMessage("Payment succeeded!");
            setPaymentBtnText('Completed');
            setCompleted(true);
            handlePaymentSuccess(paymentIntent)
                .then(_ => {
                    if(activeStep === index)
                        handleChangeIndex(activeStep+1)
                })
        }

    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
        </form>
    );
}


export default CheckoutForm;