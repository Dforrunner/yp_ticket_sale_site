import {useState, cloneElement, useContext, useEffect} from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import {createTheme} from "@mui/material/styles";
import {ThemeProvider} from "@emotion/react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {AuthContext} from "./Auth";
import {useNavigate} from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {Checkbox, FormControlLabel, FormGroup, TextField} from "@mui/material";
import Loader from "./Loader";
import {DataGrid} from '@mui/x-data-grid';
import QrReader from './QrReader'

const Navbar = ({tab, setTab, setPrevTab}) => {

    return (
        <div className='w-full fixed bottom-0 md:top-0 h-[56px]'>
            <BottomNavigation
                showLabels
                value={tab}
                onChange={(event, newValue) => {
                    setPrevTab(tab);
                    setTab(newValue);
                }}
            >
                <BottomNavigationAction label="Dashboard" icon={<DashboardIcon/>}/>
                <BottomNavigationAction label="Ticket Scan" icon={<PhotoCameraIcon/>}/>
                <BottomNavigationAction label="Settings" icon={<SettingsIcon/>}/>
            </BottomNavigation>
        </div>
    );
}

const mdTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const CustomListItem = ({icon, text, onclick}) =>
    <ListItemButton onClick={onclick} style={{height: '60px', padding: 0, margin: 0}}>
        <ListItemIcon>
            {cloneElement(icon, {style: {color: "black", marginLeft: 20, marginTop: 10}})}
        </ListItemIcon>
        <div className='flex justify-between items-center w-full border-b border-gray-400 py-3 -mb-1'>
            <ListItemText primary={text} style={{paddingLeft: 2}}/>
            <ArrowForwardIosIcon style={{width: '15px', color: '#646464', marginRight: 10}}/>
        </div>

    </ListItemButton>

const slideAnimation = (index, prevTab) => {
    if (index === prevTab) return '';
    return index > prevTab ? 'slideInRight' : 'slideInLeft'
}

const DashTab = ({index, activeTab}) => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0)
    const columns = [
        {field: 'id', headerName: 'ID', width: 70, type: 'number'},
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            valueGetter: (params) =>
                `${params.row.firstname} ${params.row.lastname}`,
        },
        {field: 'qty', headerName: 'QTY', type: 'number', width: 60},
        {field: 'price', headerName: '@Price', type: 'number', width: 80},
        {field: 'tip', headerName: 'Donation', type: 'number', width: 90},
        {field: 'total_paid', headerName: 'Total Paid', type: 'number', width: 90},
        {field: 'email', headerName: 'Email', width: 200},
        {field: 'checked_in', headerName: 'Checked In'},
        {field: 'checked_in_by', headerName: 'By'},
    ];

    useEffect(() => {
        fetch('/api/transactions')
            .then(res => res.json())
            .then(data => {
                setData(data)
                let sum = 0;

                data.map(i => sum += i.total_paid)
                setTotal(sum)
            })
            .catch(console.error)
    }, []);

    return (
        <div className={`${slideAnimation(index, activeTab)}  w-full md:mt-10`}>
            <div className='flex flex-col p-2'>
                <div className='flex mx-1 my-3 bg-[#252525] justify-between items-center p-5 rounded'>
                    <p className='text-2xl'>Total Sales:</p>
                    <h1 className='text-4xl text-green-300'>${total}</h1>
                </div>

                <div className='bg-[#252525] mx-1 my-3 rounded h-[600px]'>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        pageSize={9}
                        rowsPerPageOptions={[5]}
                    />
                </div>
            </div>
        </div>
    )
}


const CheckinTab = ({index, prevTab, setTab, scanData = [], setScanData}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const checkedUsers = [];

        e.target.querySelectorAll('[name="user[]"]').forEach(i => {
            if (i.checked) checkedUsers.push(Number(i.value))
        })

        const usersToCheckIn = [];

        scanData.map(i => {
            if (checkedUsers.includes(i.id) && !i.checked_in)
                usersToCheckIn.push(i)
        })

        if (!usersToCheckIn.length)
            return setMsg('Select a new customer to check-in');
        setMsg('');


        setIsLoading(true);
        fetch('/api/check-in', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(usersToCheckIn)
        })
            .then(res => res.json())
            .then(res => {
                setIsLoading(false);

                if(res.error)
                    return setMsg(res.error)

                setMsg('Checked in selected customers')

                const updatedData = []

                scanData.map(i => {
                    if (checkedUsers.includes(i.id))
                        updatedData.push({...i, checked_in: true})
                    else
                        updatedData.push(i)
                })

                console.log({updatedData})
                setScanData(updatedData);

                const timer = setTimeout(() => {
                    setMsg('')
                    clearTimeout(timer)
                }, 4000)
            })
            .catch(console.error)
    }

    return (
        <div className={`${slideAnimation(index, prevTab)}  w-full`}>
            <div
                className='flex items-center p-3 bg-[#121212] md:bg-[#595959] md:mt-4 h-[50px] cursor-pointer'
                onClick={() => setTab(1)}>
                <ArrowBackIcon/>
                Back
            </div>

            <h1 className='text-2xl text-center my-10'>Check In Customer</h1>
            <form onSubmit={handleSubmit}>
                <FormGroup
                    sx={{
                        '& .MuiSvgIcon-root': {fontSize: 45}
                    }}
                >

                    <div className='ml-10 pb-[300px]'>
                        {scanData.length > 1
                            ? scanData.map((user, index) =>
                                <FormControlLabel
                                    key={`${user.full_name}_${user.id}_${index}`}
                                    control={<Checkbox
                                        name='user[]'
                                        value={user.id}
                                        defaultChecked={user.checked_in}
                                        disabled={user.checked_in}
                                    />}
                                    label={`${user.full_name} ${user.mainBuyer ? ' - Buyer' : ''}`}/>
                            )
                            : <h1 className='text-2xl text-center p-10 -ml-10'>Sing leUser</h1>
                        }
                    </div>
                </FormGroup>


                <div className='sticky bottom-0 mb-10'>
                    <div className='flex justify-center items-center h-[40px] '>
                        <p className='text-gray-400'>{msg}</p>
                    </div>

                    <div className='flex justify-center items-center bg-[#3071BB]
                                hover:bg-[#3584DF] h-[50px] text-white mx-5 rounded w-[90%]'>
                        {isLoading
                            ? <Loader/>
                            : <button className='w-full h-full cursor-pointer' type='submit'>
                                CHECK IN
                            </button>
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}


const ScanTab = ({index, prevTab, activeTab, setTab, setScanData}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const getTransaction = (ticketId) => {
        if(!ticketId || ticketId.split('_')[0] !== 'ypstl'){
            setMsg('Invalid Code')
            return;
        }
        setMsg('')
        setIsLoading(true);
        fetch('/api/transaction', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ticketId})
        })
            .then(res => res.json())
            .then(res => {
                setIsLoading(false);

                if (res.error)
                    return setMsg(res.error);

                const users = [{
                    id: res.id,
                    full_name: `${res.firstname} ${res.lastname}`,
                    checked_in: res.checked_in,
                    mainBuyer: true
                }];

                if (res.additionalTickets.length)
                    res.additionalTickets.map(i => users.push({mainBuyer: false,  ...i}))

                setScanData(users)
                setTab(4)
            })
            .catch(console.error)
    }

    const handleScan = (value) => {
        if(Array.isArray(value)) value = value[0];
        getTransaction(value)
    }

    const handleError = (err) => {
        setMsg(err)
    }

    return (
        <div className={`${slideAnimation(index, prevTab)} w-full md:mt-10 h-screen`}>
            <div className='flex justify-center items-center mt-5 h-[75%]'>
                {index === activeTab && <QrReader
                    delay={100}
                    style={{
                        height: window.screen.height - 250,
                        width: window.screen.width,
                    }}
                    onError={handleError}
                    onScan={handleScan}
                />}
            </div>

            <div className='fixed bottom-20  w-full'>
                <div className='flex justify-center items-center h-[40px]'>
                    <p className='text-gray-400'>{msg}</p>
                </div>

                <div className='flex justify-center items-center bg-[#3071BB]
                                hover:bg-[#3584DF] h-[50px] text-white m-5 rounded w-[90%]'>
                    {isLoading
                        ? <Loader/>
                        : <button className='w-full h-full cursor-pointer' onClick={() => {}}>
                            SCAN QR CODE
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}

const CustomInput = ({...rest}) =>
    <div className='mt-4'>
        <TextField
            {...rest}
            fullWidth={true}
        />
    </div>

const AccountTab = ({index, prevTab, setTab, user}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [confirmErr, setConfirmErr] = useState(false);
    const [usernameErr, setUserNameErr] = useState(false);
    const [passErr, setPassErr] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLoading) return;

        const getVal = (name) => e.target[name].value;

        const formData = {
            currentUsername: user.username,
            username: getVal('username'),
            firstname: getVal('firstname'),
            lastname: getVal('lastname'),
            currentPass: getVal('currentPass'),
            newPass: getVal('newPass'),
            confirmPass: getVal('confirmPass')
        }

        if (!formData.currentPass) {
            setPassErr(true);
            setMsg('Current password is required to save changes')
            return;
        }

        setPassErr(false);

        if (!formData.username || formData.username.lastname < 2) {
            setUserNameErr(true);
            setMsg('Username required')
            return;
        }

        setUserNameErr(false);

        if (formData.newPass !== formData.confirmPass) {
            setMsg('Passwords must match');
            setConfirmErr(true)
            return;
        }

        setConfirmErr(false);
        setMsg('');
        setIsLoading(true)

        const rmMsg = () => {
            const timer = setTimeout(() => {
                setMsg('')
                clearTimeout(timer);
            }, 5000)
        }

        fetch('/api/updated-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(({error}) => {
                setIsLoading(false);

                if (error) {
                    setMsg(error)
                    return;
                }
                setMsg('Changes successfully saved!')
                rmMsg();
            })
            .catch(err => console.log(err))

    }

    return (
        <div className={`${slideAnimation(index, prevTab)}  w-full`}>
            <div
                className='flex items-center p-3 bg-[#121212] md:bg-[#595959] md:mt-4 h-[50px] cursor-pointer'
                onClick={() => setTab(2)}
            >
                <ArrowBackIcon/>
                Back
            </div>

            <form onSubmit={handleSubmit} className='mt-5'>
                <h2 className='pl-5 pt-5 '>User information</h2>

                <div className='flex flex-col p-5 w-full'>
                    <CustomInput
                        label="Username"
                        name='username'
                        defaultValue={user.username}
                        error={usernameErr}
                    />
                    <CustomInput
                        label="First Name"
                        name='firstname'
                        defaultValue={user.firstname}
                    />
                    <CustomInput
                        label="Last Name"
                        name='lastname'
                        defaultValue={user.lastname}
                    />
                </div>

                <h2 className='pl-5 pt-5 '>Reset Password</h2>

                <div className='flex flex-col p-5 w-full'>
                    <CustomInput
                        label="Current Password"
                        name='currentPass'
                        type='password'
                        error={passErr}
                    />

                    <CustomInput
                        label="New Password (Optional)"
                        name='newPass'
                        type='password'
                    />
                    <CustomInput
                        label="Confirm Password (Optional)"
                        name='confirmPass'
                        type='password'
                        error={confirmErr}
                    />
                </div>

                <div className='flex justify-center items-center h-[40px]'>
                    <p className='text-gray-400'>{msg}</p>
                </div>
                <div className='flex justify-center items-center bg-[#3071BB]
                                hover:bg-[#3584DF] h-[50px] text-white m-5 rounded'>
                    {isLoading
                        ? <Loader/>
                        : <button className='w-full h-full cursor-pointer' type='submit'>
                            Save Changes
                        </button>
                    }
                </div>
            </form>
        </div>
    )
}

const SettingsTab = ({index, prevTab, setTab, logout, navigate}) => {

    const handleLogout = () => {
        logout()
            .then(_ => {
                navigate('/admin')
            })
    }

    return (
        <div className={`${slideAnimation(index, prevTab)} w-full`}>
            <div className='flex flex-col justify-start items-center'>
                <div className='rounded-full p-5 bg-white mt-10'>
                    <ManageAccountsIcon style={{fontSize: 80, color: 'black'}}/>
                </div>
                <h1 className='text-3xl mb-10 mt-3'>Mo Barut</h1>

                <List className='w-[90%] rounded bg-gray-300 text-black overflow-hidden' style={{padding: 0}}>
                    <CustomListItem
                        icon={<AdminPanelSettingsIcon/>}
                        text='Account'
                        onclick={() => setTab(3)}
                    />
                    <CustomListItem
                        icon={<LogoutIcon/>}
                        text='Logout'
                        onclick={handleLogout}
                    />
                </List>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const [tab, setTab] = useState(0);
    const [prevTab, setPrevTab] = useState(0);
    const [scanData, setScanData] = useState([]);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className='min-h-screen overflow-hidden text-white md:mt-10'>
            <ThemeProvider theme={mdTheme}>

                <div>
                    {tab === 0 &&
                    <DashTab
                        index={0}
                        prevTab={prevTab}
                    />}

                    {tab === 1 &&
                    <ScanTab
                        index={1}
                        activeTab={tab}
                        prevTab={prevTab}
                        setTab={setTab}
                        setScanData={setScanData}
                    />}

                    {tab === 2 &&
                    <SettingsTab
                        index={2}
                        prevTab={prevTab}
                        setTab={setTab}
                        logout={auth.logout}
                        navigate={navigate}
                    />}

                    {tab === 3 &&
                    <AccountTab
                        index={3}
                        prevTab={prevTab}
                        setTab={setTab}
                        user={auth.user}
                    />}

                    {tab === 4 &&
                    <CheckinTab
                        index={4}
                        prevTab={prevTab}
                        setTab={setTab}
                        scanData={scanData}
                        setScanData={setScanData}
                    />}

                </div>

                <Navbar
                    tab={tab}
                    setTab={setTab}
                    setPrevTab={setPrevTab}
                />
            </ThemeProvider>
        </div>

    )
}

export default Dashboard;