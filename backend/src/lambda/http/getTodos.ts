// import * as AWS from 'aws-sdk'
import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

// const docClient = new AWS.DynamoDB.DocumentClient()
// console.log(docClient)

// const todosTable = process.env.TODOS_TABLE
// console.log(todosTable)

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log(`Processing event in GetTodos: ${event}`)

  const todos = ['test']

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
}
