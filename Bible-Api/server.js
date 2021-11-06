var express = require('express')
var app = express()
var NKV = require('./NKV.js')

app.use(express.static('public'))

app.get('/', function (request, response) {
	response.sendFile(__dirname + '/docs/index.html')
})

var listener = app.listen(process.env.PORT, function () {
	console.log('Your app is listening on port ' + listener.address().port)
})

app.get('/api/get_verse/:book/:chapter/:verse', (req, res) => {
	req.params.book = req.params.book.replace(/[A-Za-z]/, (match) =>
		match.toUpperCase()
	)
	if (
		req.params.book == 'Song of Solomon' ||
		req.params.book == 'Song of solomon'
	) {
		req.params.book = 'Song of Songs'
	}
	let resObj = {
		verse: '',
		reference:
			req.params.book + ' ' + req.params.chapter + ':' + req.params.verse,
	}
	if (req.params.verse.match(/\d+-\d+/)) {
		let min = req.params.verse.match(/\d+(?=-)/)[0]
		let max = req.params.verse.match(/(?<=-)\d+/)[0]
		console.log(min)
		console.log(max)
		for (; min <= max; min++) {
			resObj.verse +=
				NKV.NKV.NKV[req.params.book]['Chapter ' + req.params.chapter][
					'verse ' + min
				]
		}
	} else {
		resObj.verse =
			NKV.NKV.NKV[req.params.book]['Chapter ' + req.params.chapter][
				'verse ' + req.params.verse
			]
	}
	res.json(resObj)
})

app.get('/api/get_chapter/:book/:chapter', (req, res) => {
	req.params.book = req.params.book.replace(/[A-Za-z]/, (match) =>
		match.toUpperCase()
	)
	if (
		req.params.book == 'Song of Solomon' ||
		req.params.book == 'Song of solomon'
	) {
		req.params.book = 'Song of Songs'
	}
	let resObj = {
		verses: '',
		reference: req.params.book + ' ' + req.params.chapter,
	}
	if (req.params.chapter.match(/\d+-\d+/)) {
		let min = req.params.chapter.match(/\d+(?=-)/)[0]
		let max = req.params.chapter.match(/(?<=-)\d+/)[0]
		console.log(req.params.chapter)
		for (; min <= max; min++) {
			resObj.verses += min + ' '
			for (
				var i = 1;
				NKV.NKV.NKV[req.params.book]['Chapter ' + min].hasOwnProperty(
					'verse ' + i
				);
				i++
			) {
				resObj.verses +=
					i + NKV.NKV.NKV[req.params.book]['Chapter ' + min]['verse ' + i]
			}
		}
	} else {
		resObj.verses += req.params.chapter + ' '
		for (
			var i = 1;
			NKV.NKV.NKV[req.params.book][
				'Chapter ' + req.params.chapter
			].hasOwnProperty('verse ' + i);
			i++
		) {
			resObj.verses +=
				i +
				NKV.NKV.NKV[req.params.book]['Chapter ' + req.params.chapter][
					'verse ' + i
				]
		}
	}
	res.json(resObj)
})
