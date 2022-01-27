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
        ![Body] : String,
        ![From] : String,
        ![ToCountry] : String,
        ![ToState] : String,
        ![NumMedia] : String,
        ![ToCity] : String,
        ![FromZip] : String,
        ![SmsSid] : String,
        ![FromState] : String,
        ![SmsStatus] : String,
        ![FromCity] : String,
        ![FromCountry] : String,
        ![SmsMessageSid] : String,
        ![To] : String,
        ![MessagingServiceSid] : String,
        ![ToZip] : String,
        ![AddOns] : String,
        ![NumSegments] : String,
        ![MessageSid] : String,
        ![AccountSid] : String,
        ![ApiVersion] : String
     );
}
