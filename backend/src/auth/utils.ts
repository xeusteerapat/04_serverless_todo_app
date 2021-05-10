import { decode } from 'jsonwebtoken'
import { JwtPayload } from './JwtPayload'
import * as AWS from 'aws-sdk'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

const client = new AWS.SecretsManager()

export async function getSecret(secretId: string) {
  const data = await client
    .getSecretValue({
      SecretId: secretId
    })
    .promise()

  return JSON.parse(data.SecretString)
}
