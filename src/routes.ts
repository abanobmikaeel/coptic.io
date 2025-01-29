import express from 'express'
import { ReadingController } from './controllers'
import { CalendarController } from './controllers'
import { HealthController } from './controllers'

const Router = express.Router()

// Readings
Router.route('/readings/:date?').get(ReadingController.get)

// Calendar
Router.route('/calendar/:date?').get(CalendarController.get)

// Health
Router.route('/health').get(HealthController.get)

export default Router
