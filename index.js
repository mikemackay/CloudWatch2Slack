'use strict';

// Load in our libs
const axios = require('axios');
const aws = require('aws-sdk');
let ec2 = new aws.EC2();

// To get the Slack hook url, go into Slack admin and create a new "Incoming Webhook" integration
const slackUrl = process.env.SLACK_POST_URL;

exports.handler = async (event) => {
    
    // Grab the inbound notification message
    let snsMessage = JSON.parse(event.Records[0].Sns.Message);
    
    // Build our Slack POST object, with styling attachment(s)
    var slackMessageData = {
        "text": event.Records[0].Sns.Subject + "\n" + snsMessage.NewStateReason,
        "attachments": [
            {
                "fallback": "CloudWatch Alert System",
                "color": (snsMessage.NewStateValue == "ALARM")? "danger" : "good",
                "fields": []
            }
        ]
    };
    
    // Get the Dimensions attribute to parse any associated Metadata
    let alertDimensions = snsMessage.Trigger.Dimensions;
    
    // Loop through and work on each dimension (where required)
    for (var i = 0, len = alertDimensions.length; i < len; i++) {
        if(alertDimensions[i].name == 'InstanceId') {
            let ec2InstanceTags = await getEc2InstanceTags(alertDimensions[i].value);
            ec2InstanceTags.Tags.forEach(function(instanceTag) {
                slackMessageData.attachments[0].fields.push({"title": instanceTag.Key, "value": instanceTag.Value, "short": true});
            });
        }
    }

    // Post to Slack
    await axios.post(slackUrl, slackMessageData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return;
};

function getEc2InstanceTags(instanceId) {
    let params = {Filters: [{ Name:"resource-id", Values:[ instanceId ]}]};
    return new Promise((resolve, reject) => {
        let instanceTags = ec2.describeTags(params).promise();
        instanceTags.then(function(data) {
           resolve(data); 
        }).catch(function(err) {
            console.log(err);
        });
    });
}