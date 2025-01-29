import express from 'express'
import routes from './routes'
import cors from 'cors'

import bodyParser from 'body-parser'
import error from './middlewares/error'

// Logger
import { stream } from './config/logger'
import morgan from 'morgan'

// GraphQL
import { graphqlHTTP } from 'express-graphql'
import schema from './graphql/schema'

// Swagger for documentation
// import YAML from 'yamljs'

// const swaggerUi = require('swagger-ui-express')
const boolParser = require('express-query-boolean')

// Init express
const app = express()

// Enable CORS
app.use(cors())

// app.use(
// 	'/graphql',
// 	graphqlHTTP({
// 		schema,
// 		graphiql: true,
// 		// rootValue: resolvers,
// 		pretty: true,
// 	})
// )

// Mount api api routes
app.use('/api', routes)

// Logging
app.use(morgan('combined', { stream }))

// Parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(boolParser())

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

export default app
