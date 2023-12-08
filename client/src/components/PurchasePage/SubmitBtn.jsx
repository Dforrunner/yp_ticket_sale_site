import Loader from '../Loader';

export default function SubmitBtn({ isLoading, text, targetFormId, disabled = false }) {
  return (
    <div
      className='flex justify-center items-center bg-[#3071BB]
        hover:bg-[#3584DF] w-[90%] h-[50px] text-white m-5 rounded'
    >
      {isLoading ? (
        <Loader />
      ) : (
        <button
          disabled={disabled}
          className='w-full h-full cursor-pointer'
          form={targetFormId}
          type='submit'
        >
          {text}
        </button>
      )}
    </div>
  );
}
