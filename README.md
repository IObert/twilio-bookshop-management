# Mobile Bookshop Management
CAP Bookshop x Twilio Messaging

> This sample project demonstrates how to combine the [Twilio Messaging API](https://www.twilio.com/messaging) with an application built with the [SAP Cloud Application Programming Model](https://cap.cloud.sap/docs/).

The project builds on the well-established bookshop scenario and improves the user experience of the bookshop owner. Every time the stock of a particular book goes below a pre-defined threshold, a warning is sent to one or more shop managers. If the managers then want to restock this item, they can simply reply to the text message to trigger that action. The Twilio platform will then invoke a webhook provided by this application to order more books.


## Prerequisites
- Install [Node.js LTS version 16](https://nodejs.org/en/download) 
- Install [git](https://nodejs.org/en/download) 
- Sign up for a free [Twilio account](https://www.twilio.com/referral/iSDwWn) (no credit card needed)
- Get a [Twilio phone number](https://www.youtube.com/watch?v=f9jE5ywz8cs) (the initial credits you get for free are sufficient to buy a number)
- [Windows only] Install SQLite
>  If you are running macOS or Linux, you will likely have SQLite installed. For Windows users, I recommend using the [Chocolatey](https://chocolatey.org/) package manager to install [sqlite](https://community.chocolatey.org/packages/SQLite) via `choco install sqlite`. After the installation, please check you can start the executable (`sqlite`) from the terminal.

## Getting started
1. Clone this repository and navigate into it
    ```sh
    git clone https://github.com/IObert/openui5-sample-app.git
    cd openui5-sample-app
    ```

1. Create a new `default-env.json` file and add your secrets to it:
    ```json
    {
        "TWILIO_ACCOUNT_SID": "ACXXXXXXX",
        "TWILIO_AUTH_TOKEN": "1acYYYYY",
        "TWILIO_SENDER": "+1 860 0000000",
        "TWILIO_RECEIVER": "+1 860 111111"
    }
    ```
1. Ensure you set the proper geo permissions in the Twilio Console to receive text messages to the `TWILIO_RECEIVER` number.
    ```sh
    TODO
    ```
1. Install all dependencies and start the server
    ```sh
    npm install
    npm start
    ```
1. Trigger a request to order 40 books which results in a warning message to your phone number
    ```sh
    TODO
    ```
1. Respond to the incoming message with "Yes" and see the confirmation in the application log.
    ```sh
    TODO
    ```






## Known Issues
If this weren't just a demo but a production app, it would make sense to:

- Add proper state management to the application to save which book needs to be reordered instead of extracting this information from the initial text message.
- Add a check in the webhook to make sure only POST [requests sent by Twilio are accepted](https://www.twilio.com/blog/how-to-secure-twilio-webhook-urls-in-nodejs).



## Get Support

Check out the relevant documentation at [twilio.com/docs/sms](https://www.twilio.com/docs/sms) and [cap.cloud.sap](https://cap.cloud.sap). <br>
If you have a question, find a bug, or otherwise need support, please open an issue in this repository.


## License

This project is licensed under the Apache Software License, version 2.0, except as noted otherwise in the [LICENSE](LICENSE) file.
