import React, {useEffect} from 'react'
import {getDeviceId} from './getDeviceId'
import jsQR from "jsqr";

const decoder = (imageData) =>
    new Promise((resolve) => {
        const decoded = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        )

        if (decoded)
            resolve(decoded.data)
        else
            resolve()
    })

const QrReader = ({
                      onError,
                      facingMode = 'environment',
                      constraints = null,
                      onLoad = () => {
                      },
                      style,
                      onScan,
                      className,
                      showViewFinder = true,
                      delay = 800,
                      resolution = 600,
                  }) => {

    const els = {};
    let timeout, stopCamera;

    const initiate = () => {
        // Check browser facingMode constraint support
        // Firefox ignores facingMode or deviceId constraints
        const isFirefox = /firefox/i.test(navigator.userAgent);

        let supported = {}
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getSupportedConstraints === 'function')
            supported = navigator.mediaDevices.getSupportedConstraints()


        const constraintsDef = {}

        if (supported.facingMode)
            constraintsDef.facingMode = {ideal: facingMode}

        if (supported.frameRate)
            constraintsDef.frameRate = {ideal: 25, min: 10}


        const vConstraintsPromise = (supported.facingMode || isFirefox)
            ? Promise.resolve(constraints || constraintsDef)
            : getDeviceId(facingMode).then(deviceId => Object.assign({}, {deviceId}, constraints))

        vConstraintsPromise
            .then(video => navigator.mediaDevices.getUserMedia({video}))
            .then(handleVideo)
            .catch(onError)
    }

    const handleVideo = (stream) => {
        const {preview} = els;

        // Preview element hasn't been rendered so wait for it.
        if (!preview)
            return setTimeout(() => handleVideo(stream), 200)

        // Handle different browser implementations of MediaStreams as src
        if ((preview || {}).srcObject !== undefined)
            preview.srcObject = stream
        else if (preview.mozSrcObject !== undefined)
            preview.mozSrcObject = stream
        else if (window.URL.createObjectURL)
            preview.src = window.URL.createObjectURL(stream)
        else if (window.webkitURL)
            preview.src = window.webkitURL.createObjectURL(stream)
        else
            preview.src = stream

        // IOS play in fullscreen
        preview.playsInline = true

        const streamTrack = stream.getTracks()[0]
        // Assign `stopCamera` so the track can be stopped once component is cleared
        stopCamera = streamTrack.stop.bind(streamTrack)

        preview.addEventListener('loadstart', () => handleLoadStart(preview, streamTrack.label))
    }

    const handleLoadStart = (preview, streamLabel) => {
        preview.play()
        onLoad({mirrorVideo: facingMode === 'environment', streamLabel})
        timeout = setTimeout(check, delay)

        // Some browsers call loadstart continuously
        preview.removeEventListener('loadstart', handleLoadStart)
    }

    const check = () => {
        const {preview, canvas} = els

        // Get image/video dimensions
        let width = Math.floor(preview.videoWidth)
        let height = Math.floor(preview.videoHeight)

        // Canvas draw offsets
        let hozOffset = 0
        let vertOffset = 0


        // Crop image to fit 1:1 aspect ratio
        const smallestSize = width < height ? width : height
        const ratio = resolution / smallestSize

        height = ratio * height
        width = ratio * width

        vertOffset = (height - resolution) / 2 * -1
        hozOffset = (width - resolution) / 2 * -1

        canvas.width = resolution
        canvas.height = resolution


        const previewIsPlaying = preview &&
            preview.readyState === preview.HAVE_ENOUGH_DATA

        if (previewIsPlaying) {
            const ctx = canvas.getContext('2d', {willReadFrequently: true})

            const decode = () => {
                ctx.drawImage(preview, hozOffset, vertOffset, width, height)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                decoder(imageData)
                    .then(code => {
                        timeout = setTimeout(decode, delay);
                        if (code) onScan(code)
                    })
            }

            decode()
        } else {
            // Preview not ready -> check later
            timeout = setTimeout(check, delay)
        }
    }

    const setRefFactory = (key) =>
        element =>
            els[key] = element

    const containerStyle = {
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingTop: '100%',
        transform: 'scaleX(-1)'
    }
    const hiddenStyle = {
        display: 'none'
    }
    const previewStyle = {
        top: 0,
        left: 0,
        display: 'block',
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '85%',
        transform: 'scaleX(-1)'
    }
    const videoPreviewStyle = {
        ...previewStyle,
        objectFit: 'cover',
        transform: 'scaleX(-1)'
    }

    const viewFinderStyle = {
        top: 100,
        left: 0,
        zIndex: 10,
        boxSizing: 'border-box',
        border: '40px solid rgba(0, 0, 0, 0.0)',
        boxShadow: 'inset 0 0 0 15px rgba(255, 255, 255, 0.4)',
        position: 'absolute',
        width: '100%',
        height: '60%'
    }

    useEffect(() => {
        initiate()

        return () => {
            if (timeout)
                clearTimeout(timeout)

            if (stopCamera)
                stopCamera()
        }
    }, []);


    return (
        <section className={className} style={style}>
            <section style={containerStyle}>
                {
                    showViewFinder
                        ? <div style={viewFinderStyle}/>
                        : null
                }

                <video style={videoPreviewStyle} ref={setRefFactory('preview')}/>
                <canvas style={hiddenStyle} ref={setRefFactory('canvas')}/>
            </section>
        </section>
    )

}

export default QrReader;