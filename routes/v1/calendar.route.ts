import express from 'express'
import { CalendarController } from '../../controllers'

const Router = express.Router()

Router.route('/:date').get(CalendarController.get)

export default Router
