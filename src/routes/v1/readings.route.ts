import express from 'express'
import { ReadingController } from '../../controllers'

const Router = express.Router()

Router.route('/').get(ReadingController.get)
Router.route('/:date').get(ReadingController.get)

export default Router
