import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todo'

const logger = createLogger('Delete-Todo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing delete todo ${event}`)
  const todoId = event.pathParameters.todoId

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing todo parameter'
      })
    }
  }

  // TODO: Remove a TODO item by id
  const userId = getUserId(event)
  logger.info(`Deleting todo for user: ${{ userId, todoId }}`)

  await deleteTodo(todoId, userId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}
