import Logo from "./Logo";
import React, {useContext, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "./Auth";

const LoginPg = () => {
    const [jk, setJk] = useState('Forgot Password ?');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        auth.login(username, password)
            .then(({isAuthenticated, error}) => {
                if (isAuthenticated) navigate('/admin/dashboard')
                if(error) setError(error);
            })
    }

    return (
        <div className="h-screen flex flex-wrap">
            <div
                className="flex md:w-1/2 w-full gradient-bg-welcome from-blue-800 to-purple-700 i justify-around items-center">
                <div className='p-5 flex flex-col items-center w-[50%]'>
                    <Logo style={{width: '100%'}}/>
                    <h1 className="text-white font-bold text-[5vw] md:text-[2.5vw] font-sans">The Real Ones</h1>
                    <p className="text-white mt-1 text-center text-2xl md:text-3xl">☝☝☝☝</p>
                </div>
            </div>
            <div
                className="flex h-[75%] md:h-full md:w-1/2 w-full justify-center items-start pt-5 md:p-0 md:items-center bg-white">
                <form className="bg-white" onSubmit={handleSubmit}>
                    <h1 className="text-gray-800 font-bold text-2xl mb-1">Hey Cutie! 😉</h1>
                    <p className="text-sm font-normal text-gray-600 mb-7">Welcome Back</p>
                    <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                        <input className="pl-2 outline-none border-none"
                               type="text"
                               name="username"
                               placeholder="Username"
                               required
                        />
                    </div>
                    <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"/>
                        </svg>
                        <input className="pl-2 outline-none border-none"
                               type="password"
                               name="password"
                               placeholder="Password"
                               required
                        />
                    </div>
                    <button type="submit"
                            className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2">Login
                    </button>
                    <span className="text-sm ml-2 hover:text-blue-500 cursor-pointer"
                          onClick={() => setJk('Too bad 😝')}>{jk} </span>
                    <div className='text-[red] text-center'>{error}</div>
                </form>

            </div>
        </div>
    )
}

export default LoginPg;