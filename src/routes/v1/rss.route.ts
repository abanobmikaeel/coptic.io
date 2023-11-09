import express from 'express'
import { RSSController } from '../../controllers'

const Router = express.Router()

Router.route('/feed').get(RSSController.getRSS)
Router.route('/ical').get(RSSController.getICAL)

export default Router
