const fs = require('fs');
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

let server = express();

server.get('/contacts/:id', getContact)
server.delete('/contacts/:id', deleteContact)
server.put('/contacts/:id', updateContact)
server.get('/contacts', getPhonebook)
server.post('/contacts', addContact)
server.get('/*', getHomepage)

server.listen(3102);