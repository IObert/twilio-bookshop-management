const cds = require("@sap/cds");

class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities("my.bookshop");

    // Reduce stock of ordered books if available stock suffices
    this.on("submitOrder", async (req) => {
      const { book, quantity } = req.data;
      let { stock } = await SELECT`stock`.from(Books, book);
      if (quantity > stock) {
        return req.reject(409, `${quantity} exceeds stock for book #${book}`);
      }
      await UPDATE(Books, book).with({ stock: (stock -= quantity) });
      await this.emit("OrderedBook", { book, quantity, buyer: req.user.id });
      return { stock };
    });

    return super.init();
  }
}

module.exports = { CatalogService };
