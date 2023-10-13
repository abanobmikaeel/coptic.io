// Import your server and any necessary dependencies
import request from 'supertest'
import app from '../../src/app'
import { Server } from 'http'

describe('Test API routes', () => {
	// Test the GET /health route
	let server: Server

	beforeAll((done) => {
		server = app.listen(() => done())
	})

	afterAll((done) => {
		server.close(done)
	})
	it('should return a successful healthcheck response', async () => {
		const res = await request(app).get('/v1/health')
		expect(res.status).toEqual(200)
		expect(res.body).toEqual({ success: true })
	})
})
