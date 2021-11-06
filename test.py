import requests

BIBLE_API_PORT = 5000

def getVerse(bookName: str, chapterNumber: int, verseNumberOrRange: any):
  url = 'http://localhost:' + str(BIBLE_API_PORT) + '/api/get_verse/'+ bookName +'/' + str(chapterNumber) +'/'+ str(verseNumberOrRange)
  response = requests.get(url)
  resp = response.json()
  return resp['verse']

print(getVerse('genesis', 1, 2))
