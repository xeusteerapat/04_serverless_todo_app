import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todo'

const logger = createLogger('Update-Todo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters
  const updateTodoBody: UpdateTodoRequest = JSON.parse(event.body)

  logger.info(`Processing update todo ${event}`)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing TodoId parameter'
      })
    }
  }

  const userId = getUserId(event)

  logger.info(`Update todo for user: ${userId}`)

  const updatedTodo = await updateTodo(todoId, userId, updateTodoBody)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: updatedTodo
    })
  }
}
