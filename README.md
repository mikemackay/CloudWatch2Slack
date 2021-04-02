# CloudWatch2Slack - Get better visibility over your Alarms
 A simple Lambda function built with Node.js [14.x] to push CloudWatch Alarms to Slack, with semi-pretty formatting.
 
 ## Requirements
 While this code should work with any type of CloudWatch notification, this script has been built to work more-specifically with EC2 alerts. When it receives an alarm from CloudWatch that contains an EC2 _"InstanceId"_ dimension, the script retrieves all Tags for the instance in question and displays them in Slack; instead of the default CloudWatch information - as this doesn't generally identify the instance in question (who can identify each workload purely based on the Instance Id?!).
 
 Because of the EC2 Tags retrieval, this code needs to have an appropriate service role in place. I have supplied a file _"Ec2ReadTagsOnly.json"_ IAM profile that allows Read Only access to EC2 Tags. Feel free to use this one, or create your own - please don't grant overly excessive access to any script that doesn't need it; always work on the principle of Least Privilege access. 

## Configuration
You are free to determine the right amount of Memory for this Lambda function as necessary, I have not performed in-depth testing to determine which memory allocation works best. Just ensure the aforementioned service role is used for the script, otherwise it will return an unauthorised error.

## Setup
Clone this script. Run `npm install` to pull down the Node package libraries (note that the AWS SDK is automatically available via Lambda so we do not need to pull it in locally, although you can if you choose to). Once downloaded, create a zip file with the _index.js_ file and the _node_modules_ folder. Upload to Lambda and that should be all you need.

You will need to create and setup the CloudWatch alarms you need, and then this Lambda script as a subscriber to the event in SNS. CloudWwatch alarms get pushed to SNS, which in turn triggers any subscriptions. You want this Lambda script to be one of them, otherwise you will not get notified.

## Example
Below you can see an example screenshot of the script in action, showing an alarm based on EBS volume diskspace.

![CloudWatch2Slack](https://user-images.githubusercontent.com/180614/113428305-7a56ff80-93ce-11eb-9b55-80e8e8aa89e2.png)

## Updates / Feature Requests / Bugs
Feel free to contact me, or utilise native GitHub features to extend the code, or fix something I have missed.
