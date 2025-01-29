import request from 'supertest'
import app from '../../src/app'
import { Server } from 'http'

describe('Reading API', () => {
	let server: Server

	beforeAll((done) => {
		server = app.listen(() => done())
	})

	afterAll((done) => {
		server.close(done)
	})

	describe('GET /api/readings', () => {
		test('should return reading for the current date', async () => {
			const response = await request(server).get('/api/readings')
			expect(response.status).toBe(200)
		})
	})

	describe('GET /api/readings/:date', () => {
		test('should return reading for a specific valid date', async () => {
			const testDate = '2023-05-04'
			const response = await request(server).get(`/api/readings/${testDate}`)
			expect(response.status).toBe(200)
		})

		test('should return 400 for an invalid date format', async () => {
			const response = await request(server).get('/api/readings/invalid-date')
			expect(response.status).toBe(400)
		})
	})
})
