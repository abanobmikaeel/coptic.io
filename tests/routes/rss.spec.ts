import request from 'supertest'
import app from '../../src/app'
import { Server } from 'http'

describe('RSS Feed API', () => {
	let server: Server

	beforeAll((done) => {
		server = app.listen(() => done())
	})

	afterAll((done) => {
		server.close(done)
	})

	describe('GET /rss', () => {
		test('should return RSS feed', async () => {
			const response = await request(server).get('/v1/rss/feed')
			expect(response.status).toBe(200)
		})
	})

	describe('GET /ical', () => {
		test('should return RSS feed', async () => {
			const response = await request(server).get('/v1/rss/ical')
			expect(response.status).toBe(200)
		})
	})
})
