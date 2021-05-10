import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
const logger = createLogger('Create-Todo')

// TODO: Implement creating a new TODO item
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  logger.info(`Processing create new todo ${newTodo}`)

  // Retrieve user info
  const userId = getUserId(event)
  logger.info(`Create new todo for: ${userId}`)

  const newTodoItem = await createTodo(newTodo, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newTodoItem
    })
  }
}
