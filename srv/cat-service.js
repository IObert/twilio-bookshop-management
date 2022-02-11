const cds = require("@sap/cds");
const twilio = require("twilio");

const twilioClient = twilio();

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
      await UPDATE(Books, book).with({ stock: remaining });

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

      return { ID: book, stock: remaining };
    });

    return super.init();
  }
}

module.exports = { CatalogService };
