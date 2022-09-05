const Footer = ({classes}) =>
        <div className={`bottom-0 w-full flex justify-center items-center flex-col p-4 spooky-bg ${classes}`}>
            <div className='flex justify-center items-center flex-col mt-5'>
                <p className='text-white text-sm test-center'>Come join us</p>
                <p className='text-white text-sm test-center'>info@ypstl.com</p>
            </div>
            <div className='sm:w-[90%] w-full h-[0.25px] bg-gray-400 mt-5'/>
            <div className='sm:w-[90%] w-full flex justify-between items-center mt-3'>
                <p className='text-white text-sm test-center'>Young Professionals of Saint Louis @2022</p>
                <p className='text-white text-sm test-center'>All rights reserved</p>
            </div>
        </div>

export default Footer;