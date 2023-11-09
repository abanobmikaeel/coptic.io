import express from 'express'
import { HealthController } from '../../controllers'

const Router = express.Router()

Router.route('/').get(HealthController.get)

export default Router
