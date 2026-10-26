const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function getAllBooks() {
  const response = await axios.get(`${BASE_URL}/api/books`);
  console.log('All books:', JSON.stringify(response.data, null, 2));
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await axios.get(`${BASE_URL}/api/books/${isbn}`);
  console.log(`Books by ISBN ${isbn}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${BASE_URL}/api/books/author/${encodeURIComponent(author)}`);
  console.log(`Books by author ${author}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${BASE_URL}/api/books/title/${encodeURIComponent(title)}`);
  console.log(`Books by title ${title}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function getBookReviews(isbn) {
  const response = await axios.get(`${BASE_URL}/api/books/${isbn}/reviews`);
  console.log(`Reviews for ${isbn}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function registerUser(username, password) {
  const response = await axios.post(`${BASE_URL}/api/users/register`, { username, password });
  console.log('Register result:', JSON.stringify(response.data, null, 2));
  return response.data;
}

async function loginUser(username, password) {
  const response = await axios.post(`${BASE_URL}/api/users/login`, { username, password });
  console.log('Login result:', JSON.stringify(response.data, null, 2));
  return response.data;
}

async function addReview(isbn, username, rating, comment) {
  const response = await axios.post(`${BASE_URL}/api/books/${isbn}/reviews`, { username, rating, comment });
  console.log(`Review added for ${isbn}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function deleteReview(isbn, username) {
  const response = await axios.delete(`${BASE_URL}/api/books/${isbn}/reviews`, { data: { username } });
  console.log(`Review deleted for ${isbn}:`, JSON.stringify(response.data, null, 2));
  return response.data;
}

async function main() {
  const uniqueUser = `newuser${Date.now()}`;

  await getAllBooks();
  await getBooksByISBN('978-1-4028-9462-6');
  await getBooksByAuthor('Harper Lee');
  await getBooksByTitle('The Great Gatsby');
  await getBookReviews('978-1-4028-9462-6');
  await registerUser(uniqueUser, 'newpass123');
  await loginUser('alice', 'password123');
  await addReview('978-0-14-044926-6', uniqueUser, 4, 'Very elegant and witty.');
  await deleteReview('978-0-14-044926-6', uniqueUser);
}

main().catch((error) => {
  console.error('General.js failed:', error.response ? error.response.data : error.message);
  process.exit(1);
});
