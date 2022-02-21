const cds = require("@sap/cds");
var bodyParser = require("body-parser");
const twilio = require("twilio");

const MessagingResponse = twilio.twiml.MessagingResponse;

cds.on("bootstrap", (app) => {
  const twilioClient = twilio();

  async function collectBookDetails(sender, message) {
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

      try {
        const lastOrder = +lastMessage.match(lastOrderPattern)[1];
        const title = lastMessage.match(titlePattern)[1];
        const books = await cds.read("Books").where({ title });

        return {
          restock: restock || lastOrder,
          book: books[0],
        };
      } catch (err) {
        //regex didn't find a last order or book title
        return {};
      }
    }
  }

  app.use(bodyParser.urlencoded({ extended: true }));

  app.post(
    "/twilioWebhook",
    twilio.webhook({ validate: process.env.NODE_ENV === "production" }), // Don't validate in test mode
    async (req, res) => {
      req.res.writeHead(200, { "Content-Type": "text/xml" });
      const twiml = new MessagingResponse();

      if (req.body.Body.includes("Ja")) {
        const parsed = await collectBookDetails(req.body.From, req.body.Body);
        if (parsed?.book?.ID && parsed?.book?.stock) {
          const newStock = parsed?.book.stock + parsed.restock;
          await cds.update("Books").where({ ID: parsed?.book.ID }).with({
            stock: newStock,
          });

          twiml.message(
            `Erledigt ✅, dein Lieferant wurde kontaktiert und ab morgen sind ${newStock} Exemplare auf Lager.`
          );
        } else {
          twiml.message("Oh nein, etwas ging schief. 😣");
        }
      } else {
        twiml.message(
          `Entschuldige, I kann diese Antwort leider nicht verstehen. Du kannst beispielsweise mit "Ja" oder "Ja, bestelle 60 zusätzliche Bücher" antworten.`
        );
      }
      res.end(twiml.toString());
    }
  );
});
