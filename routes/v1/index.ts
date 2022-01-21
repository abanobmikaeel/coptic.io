import express from 'express'
import calendarRoute from './calendar.route'
import readingsRoute from './readings.route'

const Router = express.Router()

/**
 * Routes
 */
Router.use('/calendar', calendarRoute)
Router.use('/readings', readingsRoute)

export default Router
