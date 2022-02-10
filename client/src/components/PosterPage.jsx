import Logo from "./Logo";
import {CountdownTimer, GlitterRainBg} from "./index";
import {useEffect, useState} from "react";
import Footer from "./Footer";
import ScrollLink from "./ScrollLink";

const PosterPage = () => {
    const [details, setDetails] = useState({});
    const [soldOut, setSoldOut] = useState(false)

    useEffect(() => {
        fetch('/details')
            .then(res => res.json())
            .then(details => {
                console.log(details);
                setDetails(details);

                if (details.available_qty <= 0)
                    setSoldOut(true)
            })
    }, [])

    return (
        <div>
            <div className='px-5 pt-5 flex flex-col justify-center items-center h-full'>
                <Logo/>
                <GlitterRainBg/>

                <div className='z-10'>
                    <div className='text-center mt-20'>
                        <h1 className='w-full md:w-[600px] text-white text-3xl md:text-5xl font-quintessential'> {details.title} </h1>
                        <h2 className='font-comforter text-7xl md:text-9xl -mt-3 text-gold'>{details.subtitle}</h2>
                    </div>

                    <div className='text-center mt-20'>
                        <p className='text-white text-2xl md:text-3xl'>{details.date_time}</p>
                        <p className='text-white text-base'>{details.venue}</p>
                    </div>

                    <div className='text-center mt-20'>
                        <p className='text-white text-2xl md:text-3xl'>{details.dj_name}</p>
                        <p className='text-white text-base'>{details.dj_ig}</p>
                    </div>

                    {!soldOut &&
                    <div className='w-full mt-20'>

                        <div className='flex flex-col w-full justify-center items-center mx-2 -mr-20'>
                            {details.on_sale &&
                            <div className='text-white px-5 py-2 m-5 text-2xl
                                            bg-red-500 rounded-full -mt-8'>
                                ON SALE!
                            </div>}

                            <div className='text-white'>
                                <span className='text-4xl'>
                                    ${details.price}
                                </span>
                                <span className='text-3xl line-through text-[#808080] ml-2'>
                                    ${details.next_price}
                                </span>
                            </div>
                            <div className='text-[#FE2042] p-3'>
                                <span>SALE ENDS IN </span>
                                <CountdownTimer expireDate={details.sale_exp}/>
                            </div>

                        </div>
                    </div>
                    }

                    <div className='flex justify-center mt-10 mb-20'>
                        {soldOut
                            ? <div className='text-center'>
                                <h2 className='text-4xl text-red-400'>Sold Out</h2>
                                <p className='text-gray-400'>We will have more events! </p>
                                <a href={details.yp_link} className='text-blue-300 cursor-pointer'>Check out the
                                    Facebook group events tab for the latest events</a>
                            </div>

                            : <ScrollLink
                                to='ticket-purchase'
                                state={details}
                                className='my-5 p-3 rounded-[3%] w-64 cursor-pointer bg-gold text-2xl
                                 text-white text-center font-semibold'
                            >Buy Tickets
                            </ScrollLink>
                        }


                    </div>
                </div>


            </div>
            <Footer/>
        </div>
    )
}

export default PosterPage;