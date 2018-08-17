const readline = require('readline');
const fs = require('fs');
const http = require('http');

let generateRandom = () => Math.floor(Math.random() * 10000000 + 1);

let readBody = (req, callback) => {
    let body="";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(body);
    })
}

let routes = [
    {
        method: 'GET',
        url: '/phonebook'
    },
    {
        method: 'GET',
        url: '/phonebook/'
    },
    {
        method: 'DELETE',
        url: '/phonebook/'
    },
    {
        method: 'POST',
        url: '/phonebook'
    },
    {
        method: 'PUT',
        url: '/phonebook/'
    }

]

//Everything inside of this function will be run anytime someone connects to your server
let server = http.createServer((req, res) => {
    fs.readFile('phonebook.txt', 'utf8', (err, data) => {
        let contacts = JSON.parse(data);
        let urlArray = req.url.split('/');
        let contact = urlArray.pop();
        if (req.url === "/phonebook" && req.method === "GET") {
            res.end(data);
        } else if (req.url.startsWith('/phonebook/') && req.method === "GET") {
            if (contacts[contact]) {
                res.end(JSON.stringify(contacts[contact]));
            } else {
                res.end('No contact with that name.');
            }
        } else if (req.url.startsWith('/phonebook/') && req.method === "DELETE") {
            delete contacts[contact];
            fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', (err) => {
                if (!err) {
                    res.end(`${contact} has been deleted.`);
                } else {
                    res.end("No contact with that name");
                }
            })
        } else if (req.url.startsWith('/phonebook') && req.method === "POST") {
            readBody(req, (body) => {
                let newContact = JSON.parse(body);
                let id = generateRandom();
                newContact.id = id;
                contacts[id] = newContact;
                fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', (err) => {
                    res.end(`${JSON.stringify(contacts[newContact])} has been created.`); 
                })
            })
        } else if (req.url.startsWith('/phonebook/') && req.method === "PUT") {
            readBody(req, (body) => {
                let currentContact = contact;
                let contactUpdates = JSON.parse(body);
                contacts[currentContact] = contactUpdates;
                fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', (err) => {
                    res.end(`${(JSON.stringify(contacts[currentContact]["name"]))} has been updated.`); 
                })
            })
        } 
    })
})

server.listen(3102);