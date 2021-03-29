'use strict';

// Load in our libs
const axios = require('axios');

// To get the Slack hook url, go into Slack admin and create a new "Incoming Webhook" integration
const slackUrl = process.env.SLACK_POST_URL;

exports.handler = async (event) => {
    
    // Grab the message
    var snsMessage = JSON.parse(event.Records[0].Sns.Message);

    // Build our Slack POST object, with styling attachment(s)
    var slackMessageData = {
        "text": event.Records[0].Sns.Subject,
        "attachments": [
            {
                "fallback": "CloudWatch Alert System",
                "color": (snsMessage.NewStateValue == "ALARM")? "danger" : "good",
                "fields": [
                    {"title": "Alarm Name", "value": snsMessage.AlarmName, "short": true},
                    {"title": "Account ID", "value": snsMessage.AWSAccountId, "short": true},
                    {"title": "AWS Region", "value": snsMessage.Region, "short": true},
                    {"title": "Alarm Triggered", "value": snsMessage.StateChangeTime, "short": true},
                ]
            }
        ]
    };    

    // Post to Slack
    await axios.post(slackUrl, slackMessageData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return;
};