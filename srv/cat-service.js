const cds = require("@sap/cds");
const twilio = require("twilio");

const twilioClient = twilio();
const MessagingResponse = twilio.twiml.MessagingResponse;

class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities("my.bookshop");

    // Reduce stock of ordered books if available stock suffices
    this.on("submitOrder", async (req) => {
      const { book, quantity } = req.data;
      let { stock, title } = await SELECT`stock, title`.from(Books, book);
      const remaining = stock - quantity;
      if (remaining < 0) {
        return req.reject(409, `${quantity} exceeds stock for book #${book}`);
      }
      if (remaining < 10) {
        twilioClient.messages
          .create({
            body: `A customer just ordered ${quantity}x "${title}" and there are only ${remaining} left in stock. Please respond with "Yes" if you would like to restock now.`,
            from: process.env.TWILIO_SENDER,
            to: process.env.TWILIO_RECEIVER,
          })
          .then((message) =>
            console.log(`Message ${message.sid} has been delivered.`)
          )
          .catch((message) => console.error(message));
      }
      await UPDATE(Books, book).with({ stock: remaining });
      return { ID: book, stock: remaining };
    });

    // Restock books that are low on supply
    this.on("restock", async (req) => {
      // retrieve sender and payload from incoming message
      const sender = req.data.from,
        payload = req.data.body;
      // get last message that was sent to that number
      const lastMessages = await twilioClient.messages.list({
        limit: 1,
        from: process.env.TWILIO_SENDER,
        to: sender,
      });
      const lastMessage = lastMessages[0]?.body;

      if (payload.includes("Yes") && lastMessage) {
        const restockPattern = /\d+/;
        const lastOrderPattern = /(\d+)x/;
        const titlePattern = /"(.*?)"/;

        const restock = payload.match(restockPattern)
          ? +payload.match(restockPattern)[0]
          : undefined;
        const lastOrder = +lastMessage.match(lastOrderPattern)[1];
        const title = lastMessage.match(titlePattern)[1];
        const books = await SELECT.from(Books).where({ title });
        if (books[0] && books[0].ID && books[0].stock) {
          const newStock = books[0].stock + (restock || lastOrder);
          await UPDATE(Books, books[0].ID).with({
            stock: newStock,
          });

          const twiml = new MessagingResponse();
          req.res.writeHead(200, { "Content-Type": "text/xml" });
          twiml.message(`The item has been restocked to ${newStock} :) .`);
          req.res.end(twiml.toString());

          return;
        }
      }

      const twiml = new MessagingResponse();
      req.res.writeHead(200, { "Content-Type": "text/xml" });
      twiml.message("Oh no. Something went wrong :( .");
      req.res.end(twiml.toString());
    });

    return super.init();
  }
}

module.exports = { CatalogService };
