import React, {useState, Fragment} from 'react'
import QRScan from './QrScanner'

const QrReader = () => {

    const [value, setValue] = useState('');
    const [watching, setWatching] = useState(false);


    const onFind = (value) => {
        setValue(value);
        setWatching(false);
    }


    return (
        <div className='min-h-screen w-full bg-white'>
            <h1>QRScan Demo</h1>
            {watching
                ? (
                    <QRScan onFind={onFind}/>
                )
                : (
                    <Fragment>
                        <button className='bg-purple p-10' onClick={() => setWatching(true)}>Scan</button>
                        <h4>value: {value}</h4>
                    </Fragment>
                )
            }
        </div>
    )
}

export default QrReader;