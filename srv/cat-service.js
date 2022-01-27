const cds = require("@sap/cds");
const twilioClient = require("twilio")();

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
        console.log(`A customer just ordered ${stock}x "${title}".`);
        twilioClient.messages
          .create({
            body: `A customer just ordered ${stock}x "${title}" and there are only ${remaining} left in stock.`,
            from: process.env.TWILIO_SENDER,
            to: process.env.TWILIO_RECEIVER,
          })
          .then((message) => console.log(message.sid))
          .catch((message) => console.error(message));
      }
      await UPDATE(Books, book).with({ stock: remaining });
      await this.emit("OrderedBook", { book, quantity, buyer: req.user.id });
      return { stock };
    });

    return super.init();
  }
}

module.exports = { CatalogService };
