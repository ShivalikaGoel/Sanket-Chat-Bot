// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, ActionTypes, ActivityTypes, CardFactory } = require('botbuilder');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

class AttachmentsBot extends ActivityHandler {
    constructor() {
        super();

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                  
                   await context.sendActivity('Hey! My name is SANKET and I am here to help you out in your conversation. Just type the message you want to convey and I will convert it into sign language for you.');
              
                    await next();
                }
            }
        });

        this.onMessage(async (context, next) => {
            
            if (context.activity.attachments && context.activity.attachments.length > 0) {
                
                await this.handleIncomingAttachment(context);
            } else {
              
                await this.handleOutgoingAttachment(context);
            }
           
          
            await next();
        });
    }

   
    async handleIncomingAttachment(turnContext) {
        // Prepare Promises to download each attachment and then execute each Promise.
        const promises = turnContext.activity.attachments.map(this.downloadAttachmentAndWrite);
        const successfulSaves = await Promise.all(promises);

        
        async function replyForReceivedAttachments(localAttachmentData) {
            if (localAttachmentData) {
               " ` +
                    `has been received and saved to "${ localAttachmentData.localPath }".`);
            } else {
                await this.sendActivity('Attachment was not successfully saved to disk.');
            }
        }

       
        const replyPromises = successfulSaves.map(replyForReceivedAttachments.bind(turnContext));
        await Promise.all(replyPromises);
    }

   
    async downloadAttachmentAndWrite(attachment) {
      
        const url = attachment.contentUrl;

      
        const localFileName = path.join(__dirname, attachment.name);

        try {
            
            const response = await axios.get(url, { responseType: 'arraybuffer' });
         
            if (response.headers['content-type'] === 'application/json') {
                response.data = JSON.parse(response.data, (key, value) => {
                    return value && value.type === 'Buffer' ? Buffer.from(value.data) : value;
                });
            }
            fs.writeFile(localFileName, response.data, (fsError) => {
                if (fsError) {
                    throw fsError;
                }
            });
        } catch (error) {
            console.error(error);
            return undefined;
        }
       
        return {
            fileName: attachment.name,
            localPath: localFileName
        };
    }

  
    async handleOutgoingAttachment(turnContext) {
        const reply = { type: ActivityTypes.Message };

        
        const firstChar = turnContext.activity.text;
        
       

            //reply.text =firstchar;
            reply.attachments = [this.getInlineAttachment(firstChar[0])];
       

        await turnContext.sendActivity(reply);
    }

   
    async displayOptions(turnContext) {
        const reply = { type: ActivityTypes.Message };
        
        
        const buttons = [
            { type: ActionTypes.ImBack, title: '1. Inline Attachment', value: '1' },

        ];

        const card = CardFactory.heroCard('', undefined,
            buttons, { text: 'You can upload an image or select one of the following choices.' });

        reply.attachments = [card];

        await turnContext.sendActivity(reply);
    }

   
    getInlineAttachment(str) 
        {
            const reply = { type: ActivityTypes.Message };
            
       

            var x=str;
                    const imageData = fs.readFileSync(path.join(__dirname, '/resources/'+x+'.png'));
            
        const base64Image = Buffer.from(imageData).toString('base64');
           
        
    
        return {
            name: 'a.png',
            contentType: 'image/png',
            contentUrl: `data:image/png;base64,${ base64Image }`
        };
        
    
    }

   
    getInternetAttachment() {
        
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
        };
    }

    async getUploadedAttachment(turnContext) {
        const imageData = fs.readFileSync(path.join(__dirname, '../resources/architecture-resize.png'));
        const connector = turnContext.adapter.createConnectorClient(turnContext.activity.serviceUrl);
        const conversationId = turnContext.activity.conversation.id;
        const response = await connector.conversations.uploadAttachment(conversationId, {
            name: 'architecture-resize.png',
            originalBase64: imageData,
            type: 'image/png'
        });

       
        const baseUri = connector.baseUri;
        const attachmentUri = baseUri + (baseUri.endsWith('/') ? '' : '/') + `v3/attachments/${ encodeURI(response.id) }/views/original`;
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: attachmentUri
        };
    }
}

module.exports.AttachmentsBot = AttachmentsBot;

