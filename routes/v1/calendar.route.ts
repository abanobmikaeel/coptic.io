import express from 'express'
import { CalendarController } from '../../controllers'

const Router = express.Router()

Router.route('/').get(CalendarController.get)
Router.route('/:date').get(CalendarController.getDate)

export default Router
