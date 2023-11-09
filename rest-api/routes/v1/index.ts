import express from 'express'
import calendarRoute from './calendar.route'
import readingsRoute from './readings.route'
import healthRoute from './health.route'

const Router = express.Router()

/**
 * Routes
 */
Router.use('/calendar', calendarRoute)
Router.use('/readings', readingsRoute)
Router.use('/health', healthRoute)

export default Router
