const mjml2html = require('mjml')

/*
  Compile an mjml string
*/
const htmlOutput = ({
                        title,
                        qrUrl,
                        firstname,
                        lastname,
                        product,
                        qty,
                        price,
                        tipAmount,
                        total,
                        date_time,
                        tipped,
                        venue
                    }) => mjml2html(`
  <mjml>
  <mj-body>
    <mj-section>
      <mj-column background-color="gold" width="100%">
        <mj-text align="center" padding="30px" font-size="20px" font-weight="100"> Thank you for purchasing a ticket! </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text align="center" font-weight=100 font-size="16px" color="#3b3b40"> You're going to </mj-text>
        <mj-text align="center" font-weight=400 font-size="17px"> ${title} </mj-text>
        <mj-text align="center" font-weight=200 font-size="15px"> ${date_time} </mj-text>
        <mj-text align="center" font-weight=200 font-size="13px"> ${venue} </mj-text>
        <mj-text align="center"> Please use the following code to check in at the event </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-image width="300px" src="${qrUrl}"></mj-image>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-button background-color="white" border="2px solid #D8C716" color="#D8C716" href="https://ypstl.com" border-radius="0" font-size="15px"> EVENT SITE </mj-button>
        <mj-button background-color="white" border="2px solid #D8C716" color="#D8C716" href="https://www.facebook.com/groups/youngprofessionalsofstlouis" border-radius="0" font-size="15px"> FACEBOOK PAGE </mj-button>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text align="center" font-weight=800 font-size="16px"> Transaction Details </mj-text>
        <mj-text align="left" font-weight=800 font-size="14px"> Buyer: </mj-text>
        <mj-text line-height=0>Name: ${firstname} ${lastname}</mj-text>
        <mj-divider border-width="1px" border-style="solid" border-color="lightgrey" />
        <mj-text align="left" font-weight=800 font-size="14px"> Order Info: </mj-text>
        <mj-text line-height=0>Title: ${product}</mj-text>
        <mj-text line-height=0>Quantity: ${qty}</mj-text>
        <mj-text line-height=0>Purchase Price: $${price}</mj-text>
        ${tipped ?'<mj-text line-height=0> Donation Amount: $'+tipAmount+' - Thank you! 😊 </mj-text>' : ''}
        <mj-text line-height=0>Total: $${total}</mj-text>
        <mj-divider border-width="1px" border-style="solid" border-color="lightgrey" />
        <mj-text align="left" font-weight=800 font-size="14px"> Event Info: </mj-text>
        <mj-text line-height=0>Event Date: ${date_time}</mj-text>
        <mj-text line-height=0>Location: ${venue}</mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-divider border-color="#00B2D6"></mj-divider>
        <mj-text font-size="14px" color="gray" font-family="helvetica"> When you arrive at the event just show us a picture of your ticket and we'll scan you in. If you have any questions or concerns feel free to email us at <mj-raw>
            <a href="mailto:info@ypstl.com"> info@ypstl.com </a>
          </mj-raw>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`).html

module.exports = htmlOutput
