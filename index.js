'use strict';

// Load in our libraries
const aws = require('aws-sdk');
const axios = require('axios');

let instanceRegions = {
    'EU (London)': 'eu-west-2',
    'EU (Ireland)': 'eu-west-1' 
};

// To get your Slack hook URL, go into Slack admin and create a new "Incoming Webhook" integration
const slackUrl = process.env.SLACK_POST_URL;

exports.handler = async (event) => {
    
    // Grab the inbound notification message
    let snsMessage = JSON.parse(event.Records[0].Sns.Message);
    
    // Build our Slack POST object, with styling blocks
    var slackMessagePayload = {
        "text": event.Records[0].Sns.Subject.replace(/["]/g, ""),
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*" + event.Records[0].Sns.Subject.replace(/["]/g, "") + "*"
                }
            },
            {
                "type": "section",
                "fields": []
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": snsMessage.NewStateReason,
                    "emoji": false
                }
            }
        ]
    };
    
    // Get the Dimensions attribute to parse any associated Metadata, then loop through and work on each dimension (where required)
    let alertDimensions = snsMessage.Trigger.Dimensions;
    for (var i = 0, len = alertDimensions.length; i < len; i++) {
        if(alertDimensions[i].name == 'InstanceId') {
            let ec2InstanceTags = await getEc2InstanceTags(alertDimensions[i].value, snsMessage.Region);
            ec2InstanceTags.Tags.forEach(function(instanceTag) {
                slackMessagePayload.blocks[1].fields.push(
                    {
                        "type": "mrkdwn",
                        "text": "*" + instanceTag.Key + "*\n" + instanceTag.Value
                    }
                );
            });
        }
    }

    // Post our complete message to Slack
    await axios.post(slackUrl, slackMessagePayload, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(response.data == 'ok') {
            return {
                statusCode: 200,
                body: JSON.stringify('OK'),
            };
        }
    }).catch(err => {
        console.log(err);
    });
};

function getEc2InstanceTags(instanceId, instanceRegion) {
    let ec2 = new aws.EC2({region: instanceRegions[instanceRegion]});
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