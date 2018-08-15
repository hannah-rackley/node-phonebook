var readline = require('readline');
var fs = require('fs');

var phonebook = {};

var interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var openPhonebook = function() {
    interface.question('What phonebook would you like to open? Enter file name: ', function(answer) {
        readFile(answer);
    })
}

var readFile = function(filename) {
    fs.readFile(filename, function(err, contents) {
       if (!err) {
           var stringContents = contents.toString();
           var object = JSON.parse(stringContents);
           phonebook = object;
           printHeader(phonebook, filename);
       } else {
           console.log(err);
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
    interface.question('Name: ', function(name) {
        interface.question('Phone Number: ', function(number) {
            phonebook[name] = number;
            console.log(`Entry stored for ${name}`)
            printHeader(phonebook, filename);
        })
    })
}

var deleteEntry = function(phonebook, filename) {
    interface.question('Name: ', function(name) {
        if (phonebook[name]) {
            delete phonebook[name];
            console.log(`Deleted entry for ${name}`)
            console.log(phonebook)
        } else {
            console.log(`There is no one by that name in the phonebook.\n ${JSON.stringify(phonebook)}`);
        }
        printHeader(phonebook, filename);
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