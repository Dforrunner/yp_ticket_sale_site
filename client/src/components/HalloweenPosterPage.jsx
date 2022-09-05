import {CountdownTimer} from "./index";
import {useEffect, useState} from "react";
import Footer from "./Footer";
import ScrollLink from "./ScrollLink";
import FullMoon from "./FullMoon";

const bats = (numberOfBats = 1) => {

    for (let i = 0; i < numberOfBats; i++) {
        let r = Math.random,
            n = 0,
            d = document,
            w = window,
            i = d.createElement('img'),
            z = d.createElement('div'),
            zs = z.style,
            a = w.innerWidth * r(), b = w.innerHeight * r();
        z.classList.add('flying-bats')
        zs.position = "fixed";
        zs.left = 0;
        zs.top = 0;
        zs.opacity = 0;
        z.appendChild(i);
        i.src = 'data:image/gif;base64,R0lGODlhMAAwAJECAAAAAEJCQv///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAQACACwAAAAAMAAwAAACdpSPqcvtD6NcYNpbr4Z5ewV0UvhRohOe5UE+6cq0carCgpzQuM3ut16zvRBAH+/XKQ6PvaQyCFs+mbnWlEq0FrGi15XZJSmxP8OTRj4DyWY1lKdmV8fyLL3eXOPn6D3f6BcoOEhYaHiImKi4yNjo+AgZKTl5WAAAIfkECQEAAgAsAAAAADAAMAAAAnyUj6nL7Q+jdCDWicF9G1vdeWICao05ciUVpkrZIqjLwCdI16s+5wfck+F8JOBiR/zZZAJk0mAsDp/KIHRKvVqb2KxTu/Vdvt/nGFs2V5Bpta3tBcKp8m5WWL/z5PpbtH/0B/iyNGh4iJiouMjY6PgIGSk5SVlpeYmZqVkAACH5BAkBAAIALAAAAAAwADAAAAJhlI+py+0Po5y02ouz3rz7D4biSJbmiabq6gCs4B5AvM7GTKv4buby7vsAbT9gZ4h0JYmZpXO4YEKeVCk0QkVUlw+uYovE8ibgaVBSLm1Pa3W194rL5/S6/Y7P6/f8vp9SAAAh+QQJAQACACwAAAAAMAAwAAACZZSPqcvtD6OctNqLs968+w+G4kiW5omm6ooALeCusAHHclyzQs3rOz9jAXuqIRFlPJ6SQWRSaIQOpUBqtfjEZpfMJqmrHIFtpbGze2ZywWu0aUwWEbfiZvQdD4sXuWUj7gPos1EAACH5BAkBAAIALAAAAAAwADAAAAJrlI+py+0Po5y02ouz3rz7D4ZiCIxUaU4Amjrr+rDg+7ojXTdyh+e7kPP0egjabGg0EIVImHLJa6KaUam1aqVynNNsUvPTQjO/J84cFA3RzlaJO2495TF63Y7P6/f8vv8PGCg4SFhoeIg4UQAAIfkEBQEAAgAsAAAAADAAMAAAAnaUj6nL7Q+jXGDaW6+GeXsFdFL4UaITnuVBPunKtHGqwoKc0LjN7rdes70QQB/v1ykOj72kMghbPpm51pRKtBaxoteV2SUpsT/Dk0Y+A8lmNZSnZlfH8iy93lzj5+g93+gXKDhIWGh4iJiouMjY6PgIGSk5eVgAADs=';
        d.body.appendChild(z);

        const R = (o, m) => Math.max(Math.min(o + (r() - .5) * 400, m - 50), 50);

        const A = () => {
            let x = R(a, w.innerWidth), y = R(b, w.innerHeight),
                d = 7 * Math.sqrt((a - x) * (a - x) + (b - y) * (b - y));
            zs.opacity = n;
            n = 1;
            zs.transition = zs.transition = d / 1e3 + 's linear';
            zs.transform = zs.transform = 'translate(' + x + 'px,' + y + 'px)';
            i.style.transform = i.style.transform = (a > x) ? '' : 'scaleX(-1)';
            a = x;
            b = y;
            setTimeout(A, d);
        };
        setTimeout(A, r() * 3e3);
    }

}

const removeBats = () => {
    document.querySelectorAll('.flying-bats').forEach(e => e.remove());
}

const HalloweenPosterPage = () => {
    const [details, setDetails] = useState({});
    const [soldOut, setSoldOut] = useState(false)

    useEffect(() => {
        bats(7);
        fetch('/api/details')
            .then(res => res.json())
            .then(details => {
                setDetails(details);

                if (details.available_qty <= 0)
                    setSoldOut(true)
            })

        return () => {
            removeBats()
        }
    }, [])

    return (
        <div>
            <div className='px-5 flex flex-col justify-center items-center h-full'>
                <div className='h-[500px]'>
                    <div className='clouds'>
                        <div className='clouds-1'/>
                        <div className='clouds-2'/>
                        <div className='clouds-3'/>
                    </div>
                </div>


                <FullMoon/>

                <div className='z-10'>
                    <div className='text-center mt-[530px]'>
                        <p className='text-[#C65000] font-creepster text-2xl md:text-5xl'>{details.date_time}</p>
                        <p className='text-[#C65000] text-base'>{details.venue}</p>
                    </div>

                    <div className='text-center mt-20'>
                        <p className='text-[#C65000] text-2xl md:text-3xl'>{details.dj_name}</p>
                        <p className='text-[#C65000] text-base'>{details.dj_ig}</p>
                    </div>

                    {!soldOut &&
                    <div className='w-full mt-20'>

                        <div className='flex flex-col w-full justify-center items-center mx-2 -mr-20'>
                            {details.on_sale &&
                            <div className='text-white font-mystery-quest px-5 py-2 m-5 text-2xl
                                            bg-red-500 rounded-full -mt-10'>
                                ON SALE!
                            </div>}

                            <div className='text-white font-mystery-quest'>
                                <span className='text-4xl'>
                                    ${details.price}
                                </span>
                                <span className='text-3xl line-through text-[#808080] ml-2'>
                                    ${details.next_price}
                                </span>
                            </div>
                            <div className='text-[#FE2042] font-mystery-quest  p-3'>
                                <span>SALE ENDS IN </span>
                                <CountdownTimer expireDate={details.sale_exp}/>
                            </div>

                        </div>
                    </div>
                    }

                    <div className='flex justify-center mt-10 mb-[200px]'>
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
                                className='p-3 rounded-[3%] w-64 cursor-pointer bg-[#C65000] hover:bg-[#570101FF] text-3xl
                                 text-white text-center font-creepster'
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

export default HalloweenPosterPage;