import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult
} from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import axios from 'axios'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from '../../auth/utils'

// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD
const auth0WebKeySet = process.env.AUTH_0_WEB_KEY_SET

const logger = createLogger('Authentication')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page
// -> Show Advanced Settings
// -> Endpoints
// -> JSON Web Key Set

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  // event.authorizationToken
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

interface Auth0WebKeys {
  alg: string
  kty: string
  use: string
  n: string
  e: string
  kid: string
  x5t: string
  x5c: string[]
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // Extract JWT
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info(`JWT ${{ jwt }}`)

  // TODO: Implement token verification
  // You should implement it similarly to
  // how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here:
  // https://auth0.com/blog/navigating-rs256-and-jwks/
  // Get Auth0 Web Key
  const { data } = await axios.get(auth0WebKeySet)
  const keys: Auth0WebKeys[] = data.keys

  // Decode the JWT and grab the kid property from the header.
  const jwtKid = jwt.header.kid

  const signingKeys = keys
    .filter(
      (key) =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signature verification
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid === jwtKid && // The `kid` must be present to be useful for later
        ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    )
    .map((key) => {
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) }
    })

  // If at least one signing key doesn't exist, Throw an Error
  if (!signingKeys.length) {
    throw new Error(
      'The JWKS endpoint did not contain any signature verification keys'
    )
  }

  return verify(token, signingKeys[0].publicKey, {
    algorithms: ['RS256']
  }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
