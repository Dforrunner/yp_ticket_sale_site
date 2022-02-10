import React, {createRef, useEffect, useState} from 'react'
import jsQR from 'jsqr'
import Webcam from "react-webcam";

const {requestAnimationFrame} = global

const QRScan = ({onFind}) => {

    const [loading, setLoading] = useState(true);
    const [notEnabled, setNotEnabled] = useState(true);

    const canvasRef = createRef();

    useEffect(() => {
        const video = document.createElement('video');
        video.autoplay = true;

        const ratio = window.devicePixelRatio;

        const canvas = canvasRef.current;

        const canvasWidth = window.screen.width * ratio;
        const canvasHeight = window.screen.height * ratio;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext('2d');

        if (navigator.mediaDevices.getUserMedia) {
            console.log({video})
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream
                    video.setAttribute('playsinline', true)
                    video.play()
                    requestAnimationFrame(tick)
                })
                .catch(err => console.log(err));
        }

        // navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}})
        //     .then((stream) => {
        //
        // })

        const tick = () => {
            if (notEnabled) setNotEnabled(false);

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                if (loading) setLoading(false);

                context.drawImage(video, 0, 0, canvasWidth, canvasHeight)
                const imageData = canvas.getImageData(0, 0, canvasWidth, canvasHeight)
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert'
                })
                if (code) onFind(code.data)
            }
            requestAnimationFrame(tick)
        }

        return () => {
            const stream = video.srcObject;
            const tracks = stream.getTracks();

            for (let i = 0; i < tracks.length; i++) {
                let track = tracks[i];
                track.stop();
            }

            video.srcObject = null;
        };

    }, []);

    return (
        <div>
            {/*{notEnabled && <p>Unable to access camera</p>}*/}
            {/*{loading && <p>Loading video...</p>}*/}
            {/*<canvas*/}
            {/*    ref={canvasRef}*/}
            {/*    style={{*/}
            {/*        position: 'fixed',*/}
            {/*        top: 0,*/}
            {/*        left: 0,*/}
            {/*        width: '100%',*/}
            {/*        height: '100%',*/}
            {/*        zIndex: 0*/}
            {/*    }}/>*/}
            <h1>CAMERA</h1>
            <Webcam />;
        </div>
    )
}

export default QRScan