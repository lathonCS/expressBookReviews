const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const { username,password} = req.body;

  if(!(username || password))
  {
    return res.status(404).json({message: "Unable to register user"});
  }
  if(isValid(username))
  {
    return res.status(404).json({message: "User already exists!"});
  }

  users.push({username: username, password: password});

  return res.status(200).json({message: "User successfully registered."});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try{
    const bookList = await Object.values(books);
    return res.status(200).send(JSON.stringify(books, null, 4));
  }catch(error){
    return res.status(500).send("Error fetching books object");
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const booksList = Object.values(books);
  let promise = new Promise(function(resolve,reject){
    if(isbn in booksList)
    {
      resolve();
    }
    else
    {
      reject();
    }
  });

  promise.then(function(){
    return res.status(200).send(books[isbn]);
  }).catch(function(){
    return res.status(500).send("Book with the isbn " + isbn + " not found!");
  })
  
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let promise = new Promise(function(resolve,reject){
    const author = req.params.author;
    //convert to filter out results easier 
    const booksList = Object.values(books);

    const authorBooks = booksList.filter((books) => books.author === author);
    if(authorBooks.length === 0)
    {
      reject(author);
    }else{
      resolve(authorBooks);
    }
  });

  promise.then((authorBooks) => {
    return res.status(200).send(JSON.stringify(authorBooks, null, 4));
  }).catch((author) => {
    return res.status(404).send("No books found for author " + author);
  })
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let promise = new Promise(function(resolve,reject){
    const title = req.params.title;

    //convert to filter out results easier 
    const booksList = Object.values(books);

    let titleBooks = booksList.filter((books) => books.title === title);

    if(titleBooks.length === 0)
    {
      reject(title);
    }
    else
    {
      resolve(titleBooks);
    }
  });

  promise.then((titleBooks) => {
    return res.status(200).send(JSON.stringify(titleBooks, null, 4));
  }).catch((title) => {
    return res.status(404).send("No books found with the title " + title);
  })

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(books[isbn].reviews));
});

module.exports.general = public_users;
