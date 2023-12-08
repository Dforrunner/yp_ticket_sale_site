export default function PrintTicketBtn({ handlePrint }) {
  return (
    <div
      className='flex justify-center items-center bg-[#3071BB]
        hover:bg-[#3584DF] w-[90%] h-[50px] text-white m-5 rounded'
    >
      <button className='w-full h-full cursor-pointer' type='button' onClick={handlePrint}>
        Print Ticket
      </button>
    </div>
  );
}
