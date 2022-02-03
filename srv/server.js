const cds = require("@sap/cds");
var bodyParser = require("body-parser");
const twilio = require("twilio");

const MessagingResponse = twilio.twiml.MessagingResponse;

cds.on("bootstrap", (app) => {
  const twilioClient = twilio();

  app.use(bodyParser.urlencoded({ extended: true }));

  app.post(
    "/twilioWebhook",
    twilio.webhook({ validate: process.env.NODE_ENV === "production" }), // Don't validate in test mode
    async (req, res) => {
      const twiml = new MessagingResponse();
      req.res.writeHead(200, { "Content-Type": "text/xml" });

      if (req.body.Body.includes("Yes")) {
        const { book, restock } = await parse(req.body.From, req.body.Body);
        if (book?.ID && book?.stock) {
          const newStock = book.stock + restock;
          await cds.update("Books").where({ ID: book.ID }).with({
            stock: newStock,
          });

          twiml.message(`The item has been restocked to ${newStock} :) .`);
        } else {
          twiml.message("Oh no. Something went wrong :( .");
        }
      } else {
        twiml.message(
          `I'm sorry, I don't understand that reply. Please answer with "Yes" or "Yes, order 60 additional book."`
        );
      }
      res.end(twiml.toString());
    }
  );

  async function parse(sender, message) {
    const lastMessages = await twilioClient.messages.list({
      limit: 1,
      from: process.env.TWILIO_SENDER,
      to: sender,
    });
    const lastMessage = lastMessages[0]?.body;

    if (lastMessage) {
      const restockPattern = /\d+/;
      const lastOrderPattern = /(\d+)x/;
      const titlePattern = /"(.*?)"/;

      const restock = message.match(restockPattern)
        ? +message.match(restockPattern)[0]
        : undefined;
      const lastOrder = +lastMessage.match(lastOrderPattern)[1];
      const title = lastMessage.match(titlePattern)[1];

      const books = await cds.read("Books").where({ title });

      return {
        restock: restock || lastOrder,
        book: books[0],
      };
    }
  }
});

module.exports = cds.server;
