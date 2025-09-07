const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return (users.filter((user) => {return user.username === username && user.password === password})).length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if(!username || !password)
  {
    return res.status(404).json({message :"Error Logging in"});
  }

  if(!authenticatedUser(username,password))
  {
    return res.status(401).json({message: "Invalid Login. Check username and/or password!"});
  }

  //generate the JWT token
  let accessToken = jwt.sign(
    {data: password,},
    "access",
    {expiresIn: 60 * 60}
  );

  //store access token and user
  req.session.authorization = {accessToken,username};
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization;
  const review = req.body;
  const isbn = req.params.isbn;

  const book = books[isbn];

  if(!book)
  {
    return res.status(404).send("Book with isbn " + isbn + " not found!");
  }

  if(book.reviews[user])
  {
    book.reviews[user] = review;
    return res.status(201).send("Review updated successfully");
  }

  book.reviews[user] = review;
  return res.status(201).send("Review added successfully");
});

//delete reviews for a book
regd_users.delete("/auth/review/:isbn", (req,res) => {
  const user = req.session.authorization;
  const isbn = req.params.isbn;

  const book = books[isbn];

  if(!book)
  {
    return res.status(404).send("Book with isbn " + isbn + " not found!");
  }

  if(!book.reviews[user])
  {
    return res.status(404).send("Reviews for this user were not found!");
  }

  delete books[isbn].reviews[user];

  return res.status(200).json({message: "Review deleted for ", user});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
