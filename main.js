var readline = require('readline');
var fs = require('fs');
var http = require('http');

var phonebook = {};

var generateRandom = function() {
    return Math.floor(Math.random() * 10000000 + 1);
}

var readBody = function(req, callback) {
    var body="";
    req.on('data', function(chunk) {
        body += chunk.toString();
    });
    req.on('end', function() {
        callback(body);
    })
}
    
var interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Everything inside of this function will be run anytime someone connects to your server
var server = http.createServer(function(req, res) {
    fs.readFile('phonebook.txt', 'utf8', function(err, data) {
        var contacts = JSON.parse(data);
        var urlArray = req.url.split('/');
        var contact = urlArray.pop();
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
            fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', function(err) {
                if (!err) {
                    res.end(`${contact} has been deleted.`);
                } else {
                    res.end("No contact with that name");
                }
            })
        } else if (req.url.startsWith('/phonebook') && req.method === "POST") {
            readBody(req, function(body) {
                var newContact = JSON.parse(body);
                var id = generateRandom();
                newContact.id = id;
                contacts[id] = newContact;
                fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', function(err) {
                    res.end(`${JSON.stringify(contacts[newContact]["name"])} has been created.`); 
                })
            })
        } else if (req.url.startsWith('/phonebook/') && req.method === "PUT") {
            readBody(req, function(body) {
                var currentContact = contact;
                var contactUpdates = JSON.parse(body);
                contacts[currentContact] = contactUpdates;
                fs.writeFile('phonebook.txt', JSON.stringify(contacts), 'utf8', function(err) {
                    res.end(`${(JSON.stringify(contacts[currentContact]["name"]))} has been updated.`); 
                })
            })
        } 
    })
})

server.listen(3102);

var openPhonebook = function() {
    interface.question('What phonebook would you like to open? Enter file name: ', function(answer) {
        readFile(answer);
    })
}

var readFile = function(filename) {
    fs.readFile(filename, function(err, contents) {
       if (!err) {
           var stringContents = contents.toString();
           phonebook = JSON.parse(stringContents);
           printHeader(phonebook, filename);
       } else {
           console.log(err);
           openPhonebook();
       }
   })
}

var create = function(phonebook, filename) {
    interface.question('What do you want to do (1-5)?' + '\n', (function(answer) {
        runPhonebook(answer, phonebook, filename);
    }))
}

var printHeader = function (phonebook, filename) {
    var menuArray = 
    ['Electronic Phone Book',
        '=====================',
        '1. Look up an entry',
        '2. Set an entry',
        '3. Delete an entry',
        '4. List all entries',
        '5. Quit'];
    console.log(menuArray.join('\n'));
    create(phonebook, filename);
};

var lookupEntry = function(phonebook, filename) {
    interface.question('Name: ', function(answer) {
        var keys = Object.keys(phonebook);
        keys.forEach(function(key) {
            if (answer == key) {
                console.log(`Found entry for ${answer}: ${phonebook[answer]}`);
            }
        })
        printHeader(phonebook, filename);
    })
}

var setEntry = function(phonebook, filename) {
    interface.question('Name: ', function(person) {
        interface.question('Phone Number: ', function(number) {
            var id = generateRandom();
            var contact = {"name": person, "Phone Number": number, "id": id}
            phonebook[id] = contact;
            console.log(`Entry stored for ${person}`)
            printHeader(phonebook, filename);
        })
    })
}

var deleteEntry = function(phonebook, filename) {
    interface.question('Name: ', function(person) {
        var keys = Object.keys(phonebook);
        keys.forEach(function(key) {
            if (phonebook[key]["name"] === person) {
                delete phonebook[key];
                console.log(`Deleted entry for ${person}`)
            }
        })
        printHeader(phonebook, filename);
        // console.log(`There is no one by that name in the phonebook.\n ${JSON.stringify(phonebook)}`);
    })
}

var listAllEntries = function(phonebook, filename) {
    console.log(phonebook);
    printHeader(phonebook, filename);
}

var writeFile = function(phonebook, filename) {
    var writePhonebook = JSON.stringify(phonebook);
    fs.writeFile(filename, writePhonebook, 'utf8', function(err) {
       if (!err) {
            console.log("Made changes to the phonebook!\nGoodbye :)");
            interface.close();
       } else {
           console.log(err);
       }
   })
}

//Get rid of if/else statements and replace with a menu object
var runPhonebook = function(answer, phonebook, filename) {
    // var menu = {
    //     "1": lookupEntry(phonebook, filename), 
    //     "2": setEntry(phonebook, filename),
    //     "3": deleteEntry(phonebook, filename),
    //     "4": listAllEntries(phonebook, filename),
    //     "5": writeFile(phonebook, filename),
    // }
    if (answer === '1') {
        lookupEntry(phonebook, filename);
    } else if (answer === '2') {
        setEntry(phonebook, filename);
    } else if (answer === '3') {
        deleteEntry(phonebook, filename);
    } else if (answer === '4') {
        listAllEntries(phonebook, filename);
    } else if (answer === '5') {
        writeFile(phonebook, filename);
    } else {
        console.log("Uh-oh! You did not enter a valid number.")
        printHeader(phonebook, filename);
    }
}

openPhonebook();