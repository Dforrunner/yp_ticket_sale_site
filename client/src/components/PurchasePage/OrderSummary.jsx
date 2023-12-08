import { calcTotal } from '../../utils/calcTotal';
import PosterImage from './PosterImage';

export default function OrderSummary({
  orderQty,
  productData,
  tip,
  setTip,
  removeTip,
  setRemoveTip,
  message,
  completed,
  children,
}) {
  const total = calcTotal(orderQty, productData.price, tip);

  return (
    <div className='md:h-screen relative top-0'>
      <div className='h-full w-full md:w-[30%] md:border-l-2 md:fixed md:top-0 md:right-0'>
        <div className='hidden md:inline w-full'>
          <PosterImage />
        </div>

        <div className='md:hidden w-full h-[0.25px] bg-gray-500 my-8 ' />

        <div className='flex flex-col justify-between md:h-[75%] p-3'>
          <div className='px-5'>
            <h2 className='font-semibold'>Order Summary</h2>

            <div className='flex justify-between text-gray-600 p-2 mt-1'>
              <p>
                {orderQty} ticket{orderQty > 1 && 's'} x ${productData.price}
              </p>
              <p>${orderQty * productData.price}</p>
            </div>

            {tip > 0 && (
              <div
                className='flex justify-between text-gray-600 p-2 mt-1'
                onMouseOver={() => setRemoveTip(true)}
                onMouseLeave={() => setRemoveTip(false)}
              >
                <p>
                  {removeTip && (
                    <span
                      className='text-gray-400 cursor-pointer mx-1'
                      onClick={() => {
                        setTip('');
                        setRemoveTip(false);
                      }}
                    >
                      x
                    </span>
                  )}
                  Tip - Thank you!
                </p>
                <p>${tip}</p>
              </div>
            )}

            {completed && (
              <div className='flex justify-between text-gray-600 p-2 mt-1'>
                <p>You Paid</p>
                <p>(${total})</p>
              </div>
            )}

            <div className='w-full h-[0.25px] bg-gray-400 mt-5 ' />
            <div className='flex justify-between font-semibold p-4'>
              <p>Total</p>
              <p>${completed ? 0 : total}</p>
            </div>
          </div>

          <div>
            {/*{tabIndex === 1 &&*/}
            {/*<p className='text-sm p-7'>*/}
            {/*    By clicking "Pay Now", I accept the Terms of Service and have read the Privacy Policy.*/}
            {/*</p>*/}
            {/*}*/}

            <p className='text-gradient-500 text-center'>{message}</p>

            <div className='absolute w-full bottom-0'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
