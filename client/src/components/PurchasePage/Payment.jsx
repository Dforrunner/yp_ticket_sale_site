import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

export default function Payment({ clientSecret, ...rest }) {
  return (
    <div className='flex justify-center mt-10'>
      <div className='md:w-[90%] min-h-[300px]'>
        <h2 className='text-2xl mb-6'>Payment Information</h2>
        <Elements
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
          stripe={stripePromise}
        >
          <CheckoutForm clientSecret={clientSecret} {...rest} />
        </Elements>
      </div>
    </div>
  );
}
