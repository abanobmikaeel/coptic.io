import express from 'express'
import routes from './routes/v1'
import cors from 'cors'
import bodyParser from 'body-parser'
import error from './middlewares/error'
import { stream, logger } from './config/logger'
import morgan from 'morgan'
import vars from './config/vars'
import YAML from 'yamljs'
import serveStatic from 'serve-static'
import { createProxyMiddleware } from 'http-proxy-middleware'

// Adding using require due to lack of declaration file
const swaggerUi = require('swagger-ui-express')
const boolParser = require('express-query-boolean')

// Init express
const app = express()

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

// Docs
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// front-end assets
// for dev use local proxy
if (process.env.NODE_ENV === 'development') {
	app.use(
		'/',
		createProxyMiddleware({
			target: 'http://localhost:5174', // The URL of the React project
			changeOrigin: true,
			pathRewrite: {
				'^/v1': '',
			},
		})
	)
} else {
	app.use(serveStatic(__dirname + '/micro-frontend/dist'))
}

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

// Run server
app.listen(vars.port, () => {
	logger.info(`server is listening on port ${vars.port || 3000}`)
})
