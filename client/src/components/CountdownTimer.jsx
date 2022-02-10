import {useEffect, useState} from "react";

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const CountdownTimer = ({expireDate, className}) => {
    const [timer, setTimer] = useState("")

    useEffect(() => {

        if (!expireDate) return console.log('Waiting for exp date');
        const expDate = new Date(expireDate).getTime();

        // Update the count down every 1 second
        const x = setInterval(() => {

            // Get today's date and time
            let now = new Date().getTime();

            // Find the distance between now and the count down date
            const distance = expDate - now;

            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            setTimer(`${days}d ${hours}h ${minutes}m ${seconds}s`);

            // If the count down is finished, write some text
            if (distance < 0) {
                clearInterval(x);
                setTimer("");
            }
        }, 1000);

        return () => {
            clearInterval(x);
        }

    }, [expireDate])
    return (
        <div className={className}>
            {timer}
        </div>
    )
}

export default CountdownTimer;