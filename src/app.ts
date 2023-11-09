import express from 'express'
import routes from './routes/v1'
import cors from 'cors'

// Express middleware
import bodyParser from 'body-parser'
import error from './middlewares/error'

// Logger
import { stream } from './config/logger'
import morgan from 'morgan'

// GraphQL
import { graphqlHTTP } from 'express-graphql'
import schema from './graphql/schema'
import resolvers from './resolvers'

const boolParser = require('express-query-boolean')

// Init express
const app = express()

app.use(
	'/graphql',
	graphqlHTTP({
		schema,
		graphiql: true,
		rootValue: resolvers,
		pretty: true,
	})
)

// Mount api v1 routes
app.use('/v1', routes)

// Logging
app.use(morgan('combined', { stream }))

// Parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(boolParser())

// Enable CORS
app.use(cors())

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

export default app
