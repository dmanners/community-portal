import express = require('express');
import awsSdk = require('aws-sdk');

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const app = express();

const TEST_TABLE = process.env.TEST_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb:awsSdk.DynamoDB.DocumentClient;

if (IS_OFFLINE === 'true') {
  dynamoDb = new awsSdk.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
  console.log(dynamoDb);
} else {
  dynamoDb = new awsSdk.DynamoDB.DocumentClient();
}

app.use(bodyParser.json({ strict: false }));

// Get Project endpoint
app.get('/project/:projectId', (req:express.Request, res:express.Response) => {
  const params = {
    TableName: TEST_TABLE,
    Key: {
      projectId: req.params.projectId,
    },
  };

  dynamoDb.get(params, (error:Error, result:any) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get project' });
    }
    if (result.Item) {
      const { projectId } = result.Item;
      res.json({ projectId });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  });
});

module.exports.handler = serverless(app);

export {}; // for TypeScript to recognize local scoping