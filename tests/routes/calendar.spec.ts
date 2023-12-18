import request from 'supertest'
import app from '../../src/app'
import fromGregorian from '../../src/utils/copticDate'
import calendarValidator from '../../src/validations/calendar.validation'
import { Server } from 'http'

describe('Coptic Date API', () => {
	let server: Server

	beforeAll((done) => {
		server = app.listen(() => done())
	})

	afterAll((done) => {
		server.close(done)
	})
	describe('GET /api/calendar', () => {
		test('should return current coptic date', async () => {
			const response = await request(server).get('/api/calendar')
			const copticDate = await fromGregorian(new Date())

			expect(response.status).toBe(200)
			expect(response.body).toEqual(copticDate)
		})
	})

	describe('GET /api/calendar/:date', () => {
		test('should return coptic date for valid gregorian date', async () => {
			const gregorianDate = '2023-05-04'
			const response = await request(server).get(
				`/api/calendar/${gregorianDate}`
			)
			console.log(`/api/calendar/${gregorianDate}`)
			const copticDate = await fromGregorian(new Date(gregorianDate))
			expect(response.status).toBe(200)
			expect(response.body).toEqual(copticDate)
		})

		test('should return 400 for invalid date parameter', async () => {
			const response = await request(server).get(`/api/calendar/invalid-date`)
			expect(response.status).toBe(400)
		})
	})

	describe('Calendar Validator', () => {
		test('should allow valid parameters', () => {
			const { error } = calendarValidator.calendar.validate({
				date: '2023-05-04',
			})
			expect(error).toBeUndefined()
		})

		test('should reject invalid parameters', () => {
			const invalidParams = { date: 'invalid-date' }
			const { error } = calendarValidator.calendar.validate({
				params: invalidParams,
			})
			expect(error).toBeDefined()
		})
	})
})
