const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const booksPath = path.join(__dirname, 'data', 'books.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

app.use(express.json());

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

async function readJsonFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function getBooksData() {
  const data = await readJsonFile(booksPath);
  return data.books || [];
}

async function saveBooksData(books) {
  await writeJsonFile(booksPath, { books });
}

async function getUsersData() {
  const data = await readJsonFile(usersPath);
  return data.users || [];
}

async function saveUsersData(users) {
  await writeJsonFile(usersPath, { users });
}

function normalizeIsbn(isbn) {
  return String(isbn || '').trim();
}

function matchBooks(books, key, value) {
  const normalizedValue = String(value || '').trim().toLowerCase();

  if (!normalizedValue) {
    return books;
  }

  return books.filter((book) => {
    const fieldValue = (book[key] || '').toLowerCase();
    return fieldValue.includes(normalizedValue);
  });
}

app.get('/api/books', async (req, res) => {
  try {
    const books = await getBooksData();
    const { isbn, author, title } = req.query;

    if (isbn) {
      const matches = books.filter((book) => book.isbn.includes(String(isbn)) || book.isbn === String(isbn));
      return matches.length ? res.json(matches) : sendError(res, 404, 'No books found for that ISBN.');
    }

    if (author) {
      const matches = matchBooks(books, 'author', String(author));
      return matches.length ? res.json(matches) : sendError(res, 404, 'No books found for that author.');
    }

    if (title) {
      const matches = matchBooks(books, 'title', String(title));
      return matches.length ? res.json(matches) : sendError(res, 404, 'No books found for that title.');
    }

    res.json(books);
  } catch (error) {
    sendError(res, 500, 'Unable to retrieve books.');
  }
});

app.get('/api/books/:isbn', async (req, res) => {
  try {
    const isbn = normalizeIsbn(req.params.isbn);
    const books = await getBooksData();
    const matched = books.filter((book) => book.isbn === isbn || book.isbn.includes(isbn));

    if (!matched.length) {
      return sendError(res, 404, 'Book not found for the given ISBN.');
    }

    res.json(matched);
  } catch (error) {
    sendError(res, 500, 'Unable to retrieve book by ISBN.');
  }
});

app.get('/api/books/author/:author', async (req, res) => {
  try {
    const books = await getBooksData();
    const result = matchBooks(books, 'author', req.params.author);

    if (!result.length) {
      return sendError(res, 404, 'No books found for that author.');
    }

    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Unable to retrieve books by author.');
  }
});

app.get('/api/books/title/:title', async (req, res) => {
  try {
    const books = await getBooksData();
    const result = matchBooks(books, 'title', req.params.title);

    if (!result.length) {
      return sendError(res, 404, 'No books found for that title.');
    }

    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Unable to retrieve books by title.');
  }
});

app.get('/api/books/:isbn/reviews', async (req, res) => {
  try {
    const books = await getBooksData();
    const book = books.find((item) => item.isbn === req.params.isbn || item.isbn.includes(req.params.isbn));

    if (!book) {
      return sendError(res, 404, 'Book not found for reviews.');
    }

    const reviews = book.reviews || [];
    res.json({ isbn: book.isbn, reviews });
  } catch (error) {
    sendError(res, 500, 'Unable to retrieve book reviews.');
  }
});

app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return sendError(res, 400, 'Username and password are required.');
  }

  try {
    const users = await getUsersData();
    const existing = users.find((user) => user.username.toLowerCase() === username.toLowerCase());

    if (existing) {
      return sendError(res, 409, 'User already exists.');
    }

    users.push({ username, password });
    await saveUsersData(users);

    res.status(201).json({ message: `User ${username} registered successfully.` });
  } catch (error) {
    sendError(res, 500, 'Unable to register user.');
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return sendError(res, 400, 'Username and password are required.');
  }

  try {
    const users = await getUsersData();
    const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password);

    if (!user) {
      return sendError(res, 401, 'Invalid username or password.');
    }

    const token = `token-${username}-${Date.now()}`;
    res.json({ message: 'Login successful', username, token });
  } catch (error) {
    sendError(res, 500, 'Unable to login.');
  }
});

async function updateReviewList(isbn, reviewData, mode) {
  const books = await getBooksData();
  const book = books.find((item) => item.isbn === isbn || item.isbn.includes(isbn));

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  const username = (reviewData.username || 'anonymous').toString().trim();
  const rating = Number(reviewData.rating || 0);
  const comment = (reviewData.comment || '').toString().trim();

  if (mode !== 'delete' && (!username || !comment || Number.isNaN(rating) || rating < 1 || rating > 5)) {
    throw new Error('INVALID_REVIEW');
  }

  const existing = (book.reviews || []).find((review) => review.username.toLowerCase() === username.toLowerCase());

  if (mode === 'add') {
    if (existing) {
      throw new Error('REVIEW_EXISTS');
    }
    book.reviews.push({ username, rating, comment });
  } else if (mode === 'update') {
    if (!existing) {
      throw new Error('REVIEW_NOT_FOUND');
    }
    Object.assign(existing, { username, rating, comment });
  } else if (mode === 'delete') {
    book.reviews = (book.reviews || []).filter((review) => review.username.toLowerCase() !== username.toLowerCase());
  }

  await saveBooksData(books);
  return { book, reviews: book.reviews || [] };
}

app.post('/api/books/:isbn/reviews', async (req, res) => {
  try {
    const result = await updateReviewList(req.params.isbn, req.body || {}, 'add');
    res.status(201).json({ message: 'Review added successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    if (error.message === 'REVIEW_EXISTS') {
      return sendError(res, 409, 'Review already exists for this user.');
    }
    sendError(res, 400, 'Review must include a valid username, rating (1-5), and comment.');
  }
});

app.post('/api/books/:isbn/review', async (req, res) => {
  try {
    const result = await updateReviewList(req.params.isbn, req.body || {}, 'add');
    res.status(201).json({ message: 'Review added successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    if (error.message === 'REVIEW_EXISTS') {
      return sendError(res, 409, 'Review already exists for this user.');
    }
    sendError(res, 400, 'Review must include a valid username, rating (1-5), and comment.');
  }
});

app.put('/api/books/:isbn/reviews', async (req, res) => {
  try {
    const result = await updateReviewList(req.params.isbn, req.body || {}, 'update');
    res.json({ message: 'Review updated successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    if (error.message === 'REVIEW_NOT_FOUND') {
      return sendError(res, 404, 'Review not found for this user.');
    }
    sendError(res, 400, 'Review update requires a valid username, rating (1-5), and comment.');
  }
});

app.put('/api/books/:isbn/review', async (req, res) => {
  try {
    const result = await updateReviewList(req.params.isbn, req.body || {}, 'update');
    res.json({ message: 'Review updated successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    if (error.message === 'REVIEW_NOT_FOUND') {
      return sendError(res, 404, 'Review not found for this user.');
    }
    sendError(res, 400, 'Review update requires a valid username, rating (1-5), and comment.');
  }
});

app.delete('/api/books/:isbn/reviews', async (req, res) => {
  const username = req.body && req.body.username ? req.body.username : (req.query.username || 'anonymous');

  try {
    const result = await updateReviewList(req.params.isbn, { username }, 'delete');
    res.json({ message: 'Review deleted successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    sendError(res, 400, 'Review deletion requires a valid username.');
  }
});

app.delete('/api/books/:isbn/review', async (req, res) => {
  const username = req.body && req.body.username ? req.body.username : (req.query.username || 'anonymous');

  try {
    const result = await updateReviewList(req.params.isbn, { username }, 'delete');
    res.json({ message: 'Review deleted successfully.', reviews: result.reviews });
  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return sendError(res, 404, 'Book not found.');
    }
    sendError(res, 400, 'Review deletion requires a valid username.');
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Book review server running on http://localhost:${PORT}`);
});
