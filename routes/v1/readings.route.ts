import express from 'express'
import { ReadingController } from '../../controllers'

const Router = express.Router()

// Defaults to today's readings
Router.route('/').get(ReadingController.get)
Router.route('/:date').get(ReadingController.getForDate)

export default Router
