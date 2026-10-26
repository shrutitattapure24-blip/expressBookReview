# Final Project Submission Notes

## Project files
- API server: [server.js](server.js)
- Axios verification client: [general.js](general.js)
- Dependencies: [package.json](package.json)

## Task 1 — GitHub repo check
The public repository name referenced by the assignment does not resolve under the GitHub API in this environment, so a true fork record could not be created from the provided upstream URL.

Command:
```bash
curl.exe -s "https://api.github.com/repos/ibm-developer-skills-network/expressBookReview"
```

Observed output:
```json
{
  "message": "Not Found"
}
```

## Task 2 — Get all books
Command:
```bash
curl.exe -s http://localhost:3000/api/books
```

Output:
```json
[
  {
    "isbn": "978-1-4028-9462-6",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "reviews": [
      { "username": "alice", "rating": 5, "comment": "A timeless classic." }
    ]
  },
  {
    "isbn": "978-0-7432-7356-5",
    "title": "The Catcher in the Rye",
    "author": "J.D. Salinger",
    "reviews": [
      { "username": "bob", "rating": 4, "comment": "A memorable coming-of-age story." }
    ]
  },
  {
    "isbn": "978-0-06-112008-4",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "reviews": [
      { "username": "charlie", "rating": 5, "comment": "Powerful and moving." }
    ]
  },
  {
    "isbn": "978-0-14-044926-6",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "reviews": [
      { "username": "newuser", "rating": 4, "comment": "Very elegant and witty." }
    ]
  }
]
```

## Task 3 — Get books by ISBN
Command:
```bash
curl.exe -s "http://localhost:3000/api/books/978-1-4028-9462-6"
```

Output:
```json
[
  {
    "isbn": "978-1-4028-9462-6",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "reviews": [
      { "username": "alice", "rating": 5, "comment": "A timeless classic." }
    ]
  }
]
```

## Task 4 — Get books by author
Command:
```bash
curl.exe -s "http://localhost:3000/api/books/author/Harper%20Lee"
```

Output:
```json
[
  {
    "isbn": "978-0-06-112008-4",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "reviews": [
      { "username": "charlie", "rating": 5, "comment": "Powerful and moving." }
    ]
  }
]
```

## Task 5 — Get books by title
Command:
```bash
curl.exe -s "http://localhost:3000/api/books/title/The%20Great%20Gatsby"
```

Output:
```json
[
  {
    "isbn": "978-1-4028-9462-6",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "reviews": [
      { "username": "alice", "rating": 5, "comment": "A timeless classic." }
    ]
  }
]
```

## Task 6 — Get initial book review
Command:
```bash
curl.exe -s "http://localhost:3000/api/books/978-1-4028-9462-6/reviews"
```

Output:
```json
{
  "isbn": "978-1-4028-9462-6",
  "reviews": [
    { "username": "alice", "rating": 5, "comment": "A timeless classic." }
  ]
}
```

## Task 7 — Register user
Command:
```bash
curl.exe -s -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d "{\"username\":\"newusercurl\",\"password\":\"newpass123\"}"
```

Output:
```json
{ "message": "User newusercurl registered successfully." }
```

## Task 8 — Login user
Command:
```bash
curl.exe -s -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d "{\"username\":\"alice\",\"password\":\"password123\"}"
```

Output:
```json
{
  "message": "Login successful",
  "username": "alice",
  "token": "token-alice-1793045553682"
}
```

## Task 9 — Add review
Command:
```bash
curl.exe -s -X POST http://localhost:3000/api/books/978-0-14-044926-6/reviews -H "Content-Type: application/json" -d "{\"username\":\"newusercurl\",\"rating\":4,\"comment\":\"Very elegant and witty.\"}"
```

Output:
```json
{
  "message": "Review added successfully.",
  "reviews": [
    { "username": "newuser", "rating": 4, "comment": "Very elegant and witty." },
    { "username": "newusercurl", "rating": 4, "comment": "Very elegant and witty." }
  ]
}
```

## Task 10 — Delete review
Command:
```bash
curl.exe -s -X DELETE http://localhost:3000/api/books/978-0-14-044926-6/reviews -H "Content-Type: application/json" -d "{\"username\":\"newusercurl\"}"
```

Output:
```json
{
  "message": "Review deleted successfully.",
  "reviews": [
    { "username": "newuser", "rating": 4, "comment": "Very elegant and witty." }
  ]
}
```

## Task 11 — Implementation file
The project logic for retrieval by all books, ISBN, author, and title is implemented in [general.js](general.js).
