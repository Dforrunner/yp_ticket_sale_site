export default function TipBtn({ amount, setTip }) {
    return (<button
        type='button'
        className='bg-gray-500 rounded px-5 md:px-8 py-3'
        onClick={() => setTip(amount)}
    >
        ${amount}
    </button>
    )
}