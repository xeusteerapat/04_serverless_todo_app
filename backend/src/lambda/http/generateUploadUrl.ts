import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import {
  getImageSignedUrl,
  updateAttachmentUrl
} from '../../businessLogic/todo'

const logger = createLogger('Generate-Upload-Url')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  logger.info(`Processing upload url ${event}`)

  const todoId = event.pathParameters.todoId

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing TodoId parameter'
      })
    }
  }

  const userId = getUserId(event)
  logger.info(`Get Image Signed URL for user: ${userId}`)

  const signedUrl: string = await getImageSignedUrl(todoId)
  logger.info(`Retreived signe url image ${signedUrl}`)

  await updateAttachmentUrl(signedUrl, todoId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}
