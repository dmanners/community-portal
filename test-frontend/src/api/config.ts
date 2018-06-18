// export const API = 'http://localhost:5000';
export const API = 'https://boebm330qg.execute-api.us-east-1.amazonaws.com/demo';

// import getToken from './tokenRequests';

export const headers = {
    mode: 'cors' as "cors",
    headers: {
      'Authorization' : 'OAuth2',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }

export const postHeaders = (body:any) => {
  // const token = getToken('athenbirs', 'Cg9UCqAlMNImL2tIgQPBoUlxL5PjHQGFg5pTujilUbE5IYqU31M5uLiYlk2TB3b', '2h').message;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjkzMzY2MjAsImV4cCI6MTUyOTQyMzAyMH0.ExrdUmmqSZnlcXOqY3qVxQGTFIAIk2XKUSYQdsrtvsE';
  return {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Authorization': token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
}


