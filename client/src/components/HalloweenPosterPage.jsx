import { CountdownTimer } from './index';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import ScrollLink from './ScrollLink';
import FullMoon from './FullMoon';
import { flyingBats, removeBats } from './lib/flyingBats';

const HalloweenPosterPage = () => {
  const [details, setDetails] = useState({
    venue: 'The Real Ones',
    date_time: 'October 30th, 2021',
    dj_name: 'DJ Moonlight',
    dj_ig: '@djmoonlight',
    price: '40',
    next_price: '50',
    sale_exp: 'October 30, 2025 00:00:00',
    on_sale: true,
    available_qty: 100,
    yp_link: 'https://www.facebook.com/groups/youngprosSTL/events',
  });
  const [soldOut, setSoldOut] = useState(false);

  useEffect(() => {
    flyingBats(7);
    fetch('/api/details')
      .then((res) => res.json())
      .then((details) => {
        setDetails(details);

        if (details.available_qty <= 0) setSoldOut(true);
      })
      .catch();

    return () => {
      removeBats();
    };
  }, []);

  return (
    <div className='w-full'>
      <div className='px-5 flex flex-col justify-center items-center h-full'>
        <div className='h-[500px]'>
          <div className='clouds'>
            <div className='clouds-1' />
            <div className='clouds-2' />
            <div className='clouds-3' />
          </div>
        </div>

        <FullMoon />

        <div className='z-10 '>
          <div className='text-center md:mt-[500px] mt-[55px] min-h-[180px]'>
            <p className='text-[#C65000] font-creepster text-3xl md:text-5xl'>
              {details.date_time}
            </p>
            <p className='text-[#C65000] text-2xl  text-base'>{details.venue}</p>
          </div>

          <div className='text-center mt-20'>
            <p className='text-[#C65000] text-2xl md:text-3xl'>{details.dj_name}</p>
            <p className='text-[#C65000] text-base'>{details.dj_ig}</p>
          </div>

          {!soldOut && (
            <div className='w-full mt-20'>
              <div className='flex flex-col w-full justify-center items-center mx-2 -mr-20'>
                {details.on_sale && (
                  <div
                    className='text-white font-mystery-quest px-5 py-2 m-5 text-2xl bg-red-500 rounded-full -mt-10'
                  >
                    ON SALE!
                  </div>
                )}

                <div className='text-white font-mystery-quest'>
                  <span className='text-4xl'>${details.price}</span>
                  <span className='text-3xl line-through text-[#808080] ml-2'>
                    ${details.next_price}
                  </span>
                </div>
                <div className='text-[#FE2042] font-mystery-quest  p-3 text-center'>
                  <span>SALE ENDS IN </span>
                  <CountdownTimer expireDate={details.sale_exp} />
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-center mt-10 mb-[200px]'>
            {soldOut ? (
              <div className='text-center'>
                <h2 className='text-4xl text-red-400'>Sold Out</h2>
                <p className='text-gray-400'>We will have more events! </p>
                <a href={details.yp_link} className='text-blue-300 cursor-pointer'>
                  Check out the Facebook group events tab for the latest events
                </a>
              </div>
            ) : (
              <ScrollLink
                to='ticket-purchase'
                state={details}
                className='p-3 rounded-[3%] w-64 cursor-pointer bg-[#C65000] hover:bg-[#570101FF] text-3xl text-white text-center font-creepster'
              >
                Buy Tickets
              </ScrollLink>
            )}
          </div>
        </div>
      </div>
            
      <Footer />
    </div>
  );
};

export default HalloweenPosterPage;
