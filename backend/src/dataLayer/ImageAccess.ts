import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('Image-Access-Data-Layer')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class Images {
  constructor(
    private readonly imagesBucketName = process.env.IMAGES_BUCKET_NAME,
    private readonly SignedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getSignedUrl(todoId: string): Promise<string> {
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: this.imagesBucketName,
      Key: todoId,
      Expires: Number(this.SignedUrlExpiration)
    })

    logger.info(`Get signed url image ${{ signedUrl, todoId }}`)

    return signedUrl
  }
}
