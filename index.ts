import { logger } from './config/logger'
import vars from './config/vars'
import app from './app'

// Run server
app.listen(vars.port, () => {
	logger.info(`server is listening on port ${vars.port || 3000}`)
})
