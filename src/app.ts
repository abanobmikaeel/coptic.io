import express from 'express'
import routes from './routes'
import cors from 'cors'

// Express middleware
import bodyParser from 'body-parser'
import error from './middlewares/error'

// Logger
import { stream } from './config/logger'
import morgan from 'morgan'

// Front-end hosting
// import serveStatic from 'serve-static'
// import { createProxyMiddleware } from 'http-proxy-middleware'

// GraphQL
import { graphqlHTTP } from 'express-graphql'
import schema from './graphql/schema'
import resolvers from './resolvers'

// Swagger for documentation
// import YAML from 'yamljs'

// const swaggerUi = require('swagger-ui-express')
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

// Mount api api routes
app.use(routes)

// Logging
app.use(morgan('combined', { stream }))

// Parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(boolParser())

// Enable CORS
app.use(cors())

// Docs
// const swaggerDocument = YAML.load('./swagger.yaml')
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// front-end assets
// for dev use local proxy
// if (process.env.NODE_ENV === 'development') {
// 	app.use(
// 		'/',
// 		createProxyMiddleware({
// 			target: 'http://localhost:5173', // The URL of the React project
// 			changeOrigin: true,
// 			pathRewrite: {
// 				'^/api': '',
// 			},
// 		})
// 	)
// } else {
// 	app.use(serveStatic(__dirname + '/micro-frontend/dist'))
// }

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

export default app
