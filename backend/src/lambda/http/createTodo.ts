import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(`Processing event: ${event}`)

  const requestBody: CreateTodoRequest = JSON.parse(event.body)

  const newTodo = {
    todoId: uuid(),
    dueDate: new Date().toISOString(),
    ...requestBody
  }

  await docClient
    .put({
      TableName: todoTable,
      Item: newTodo
    })
    .promise()

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newTodo
    })
  }
}
