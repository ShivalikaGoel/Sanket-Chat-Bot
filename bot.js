// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const { ActivityHandler } = require('botbuilder');
const { ActivityHandler, ActionTypes, ActivityTypes, CardFactory } = require('botbuilder');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        // this.onMessage(async (context, next) =>
        // {
        //     // await context.sendActivity(`You said '${ context.activity.text.split('').reverse().join('') }'`);
        //     await context.sendActivity(`hey there!`);
        //     await this.handle
        //     // By calling next() you ensure that the next BotHandler is run.
        //     await next();
        // });
        this.onMessage(async (context, next) => {
           // Determine how the bot should process the message by checking for attachments.
               // Since no attachment was received, send an attachment to the user.
               // await this.handleOutgoingAttachment(context);
               const reply={type: ActivityTypes.Message };
               reply.text='hey';
               reply.attachments =[this.getInlineAttachment()];
           // Send a HeroCard with potential options for the user to select.
           // await this.displayOptions(context);

           // By calling next() you ensure that the next BotHandler is run.
           await next();
       });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id)
                {

                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
    getInlineAttachment() {
    const imageData = fs.readFileSync(path.join(__dirname, '../resources/image.png'));
    const base64Image = Buffer.from(imageData).toString('base64');

    return {
        name: 'image.png',
        contentType: 'image/png',
        contentUrl: `data:image/png;base64,${ base64Image }`
    };
}
}


module.exports.EchoBot = EchoBot;
