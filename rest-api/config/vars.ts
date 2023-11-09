import path from 'path'
import dotenv from 'dotenv-safe'

dotenv.config({
	path: path.join(__dirname, '../../.env'),
	example: path.join(__dirname, '../../.env.example'),
	allowEmptyValues: true,
})

export default {
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
}
