const fs = require('fs');
const http = require('http');
const pg = require('pg-promise')();
const dbConfig = 'postgres://hannahglasser@localhost:5432/phonebook';
const db = pg(dbConfig);

let getPhonebook = (req, res, matches) => {
    db.query('select * from contacts;')
    .then(results => {res.end(JSON.stringify(results))})
    .catch(err => console.log(err));
}

let getContact = (req, res, matches) => {
    let id = matches[0];
    db.one(`select * from contacts where contacts.id = ${id}`)
    .then(result => {res.end(JSON.stringify(result))})
    .catch(err => {
        res.end('There is no contact with that id');
        console.log(err);
    })
}

let deleteContact = (req, res, matches) => {
    let id = matches[0];
    db.one(`DELETE from contacts WHERE id=${id}`)
    .then(res.end('Contact has been deleted'))
    .catch(err => console.log(err));
}

let readBody = (req, callback) => {
    let body="";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(body);
    })
}

let addContact = (req, res, matches) => {
    readBody(req, (body) => {
        let newContact = JSON.parse(body);
        db.query(`INSERT INTO contacts(name, number) VALUES
        ('${newContact.name}', '${newContact.number}');`)
        .then(res.end('Contact has been created.'))
        .catch(err => console.log(err));
    })
}

let updateContact = (req, res, matches) => {
    readBody(req, (body) => {
        let id = matches[0];
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

let notFound = (req, res) => {
    res.end('404 Not Found');
}

let routes = [
    {
        method: 'GET',
        url: /^\/contacts\/([0-9]+)$/,
        run: getContact
    },
    {
        method: 'DELETE',
        url: /^\/contacts\/([0-9]+)$/,
        run: deleteContact
    },
    {
        method: 'PUT',
        url: /^\/contacts\/([0-9]+)$/,
        run: updateContact
    },
    {
        method: 'GET',
        url: /^\/contacts\/?$/,
        run: getPhonebook
    },
    {
        method: 'POST',
        url: /^\/contacts\/?$/,
        run: addContact
    },
    {
        method: 'GET',
        url: /^.*$/,
        run: notFound
    }
]

//Everything inside of this function will be run anytime someone connects to your server
let server = http.createServer((req, res) => {
    let file = "Phonebook_Frontend/" + req.url.slice(1);
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            for (route of routes) {
                if (route.url.test(req.url) && route.method === req.method) {
                    let matches = route.url.exec(req.url);
                    route.run(req, res, matches.slice(1));
                    break
                }
            }
        } else {
            res.end(data);
        }
    })
})

server.listen(3102);