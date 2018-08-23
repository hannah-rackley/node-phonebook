const fs = require('fs');
// const http = require('http');
const pg = require('pg-promise')();
const dbConfig = 'postgres://hannahglasser@localhost:5432/phonebook';
const db = pg(dbConfig);
const express = require('express');

let getHomepage = (req, res) => {
    let file = "Phonebook_Frontend/" + req.url.slice(1);
    fs.readFile(file, 'utf8', (err, data) => {
        res.end(data);
    })
}

let getPhonebook = (req, res) => {
    db.query('select * from contacts;')
    .then(results => {res.end(JSON.stringify(results))})
    .catch(err => console.log(err));
}

let getContact = (req, res) => {
    let id = req.params.id;
    db.one(`select * from contacts where contacts.id = ${id}`)
    .then(result => {res.end(JSON.stringify(result))})
    .catch(err => {
        res.end('There is no contact with that id');
        console.log(err);
    })
}

let deleteContact = (req, res) => {
    let id = req.params.id;
    db.one(`DELETE from contacts WHERE id = ${id} returning *;`)
    .then((results) => {res.end('Contact has been deleted')})
    .catch(err => console.log(err));
};

let readBody = (req, callback) => {
    let body="";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(body);
    })
}

let addContact = (req, res) => {
    readBody(req, (body) => {
        let newContact = JSON.parse(body);
        db.query(`INSERT INTO contacts(name, number) VALUES
        ('${newContact.name}', '${newContact.number}');`)
        .then(res.end('Contact has been created.'))
        .catch(err => console.log(err));
    })
}

let updateContact = (req, res) => {
    readBody(req, (body) => {
        let id = req.params.id;
        try {
            (JSON.parse(body))
            let contactUpdates = JSON.parse(body);
            db.query(`update contacts set name = '${contactUpdates.name}', number = '${contactUpdates.number}'
            where id=${id}`)
            .then(res.end('Contact has been updated'))
            .catch(err => {
                console.log(err)});
        }
        catch (error) {
            res.end('You did not enter the appropriate information');
        }

    })
}

// let notFound = (req, res) => {
//     res.end('404 Not Found');
// }

// let routes = [
//     {
//         method: 'GET',
//         url: /^\/contacts\/([0-9]+)$/,
//         run: getContact
//     },
//     {
//         method: 'DELETE',
//         url: /^\/contacts\/([0-9]+)$/,
//         run: deleteContact
//     },
//     {
//         method: 'PUT',
//         url: /^\/contacts\/([0-9]+)$/,
//         run: updateContact
//     },
//     {
//         method: 'GET',
//         url: /^\/contacts\/?$/,
//         run: getPhonebook
//     },
//     {
//         method: 'POST',
//         url: /^\/contacts\/?$/,
//         run: addContact
//     },
//     {
//         method: 'GET',
//         url: /^.*$/,
//         run: notFound
//     }
// ]

//Everything inside of this function will be run anytime someone connects to your server
// let server = http.createServer((req, res) => {
//     let file = "Phonebook_Frontend/" + req.url.slice(1);
//     fs.readFile(file, 'utf8', (err, data) => {
//         if (err) {
//             for (route of routes) {
//                 if (route.url.test(req.url) && route.method === req.method) {
//                     let matches = route.url.exec(req.url);
//                     route.run(req, res, matches.slice(1));
//                     break
//                 }
//             }
//         } else {
//             res.end(data);
//         }
//     })
// })

let server = express();

server.get('/', getHomepage)
server.get('/contacts', getPhonebook)
server.get('/contacts/:id', getContact)
server.post('/contacts', addContact)
server.delete('/contacts/:id', deleteContact)
server.put('/contacts/:id', updateContact)

server.listen(3102);