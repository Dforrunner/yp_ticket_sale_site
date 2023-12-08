import QRCode from 'qrcode.react';
import PrintTicket from './PrintTicket';

export default function Ticket({
  ticketVal,
  activeStep,
  index,
  handlePrint,
  componentRef,
  ...rest
}) {
  return (
    <div className={`w-full ${activeStep !== index ? 'hidden' : 'inline'}`}>
      <h2 className='text-2xl mt-5'>Your Ticket: </h2>

      <div className='flex justify-center items-center'>
        {!ticketVal ? (
          <p>Ticket hasn't been generated yet.</p>
        ) : (
          <QRCode value={ticketVal} includeMargin={true} size={350} />
        )}
      </div>

      <div className='hidden'>
        <PrintTicket ticketVal={ticketVal} {...rest} ref={componentRef} />
      </div>

      {ticketVal && (
        <p className='text-gray-600'>
          Thank you for purchasing a ticket! Your ticket has been emailed to you. You can also
          screenshot the QR code and use that to check-in.
        </p>
      )}
    </div>
  );
}
