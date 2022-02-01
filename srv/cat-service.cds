using my.bookshop as my from '../db/data-model';

service CatalogService {
    @readonly
    entity Books as
        select from my.Books {
            ID,
            title,
            stock,
            author.name as author,
            genre.name  as genre
        };

    action submitOrder(book : Books:ID, quantity : Integer);
    action restock( 
        ![body] : String,
        ![from] : String
     );
}
