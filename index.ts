import { logger } from './src/config/logger'
import vars from './src/config/vars'
import app from './src/app'

// Run server
app.listen(vars.port, () => {
	logger.info(`server is listening on port ${vars.port || 3000}`)
})
