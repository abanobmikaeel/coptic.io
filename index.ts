import express from 'express'
import routes from './routes/v1'
import cors from 'cors'
import bodyParser from 'body-parser'
import error from './middlewares/error'
import { stream, logger } from './config/logger'
import morgan from 'morgan'
import vars from './config/vars'
import YAML from 'yamljs'

// Adding using require due to lack of declaration file
const swaggerUi = require('swagger-ui-express')

// Init express
const app = express()

app.use(morgan('combined', { stream }))

// Parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Enable CORS
app.use(cors())

// Docs
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Mount api v1 routes
app.use('/v1', routes)

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
