const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const TEST_TABLE = process.env.TEST_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;

if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
};

app.use(bodyParser.json({ strict: false }));


// Get Project endpoint
app.get('/project/:projectId', function (req, res) {
  const params = {
    TableName: TEST_TABLE,
    Key: {
      projectId: req.params.projectId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get project' });
    }
    if (result.Item) {
      const {projectId} = result.Item;
      res.json({ projectId });
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });
})


module.exports.handler = serverless(app);