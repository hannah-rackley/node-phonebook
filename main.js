var readline = require('readline');
var fs = require('fs');

var phonebook = {
    "John": "000-000-0000",
    "Jacob": "100-100-1100",
    "Jingle": "200-200-2200"
}

var interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var create = function() {
    interface.question('What do you want to do (1-5)?' + '\n', (function(answer) {
        runPhonebook(answer);
    }))
}

var printHeader = function () {
    var choiceArray = 
    ['Electronic Phone Book',
        '=====================',
        '1. Look up an entry',
        '2. Set an entry',
        '3. Delete an entry',
        '4. List all entries',
        '5. Quit'];
    console.log(choiceArray.join('\n'));
    create();
};

var lookupEntry = function() {
    interface.question('Name: ', function(answer) {
        var keys = Object.keys(phonebook);
        keys.forEach(function(key) {
            if (answer == key) {
                console.log(`Found entry for ${answer}: ${phonebook[answer]}`);
            }
        })
        printHeader();
    })
}

var setEntry = function() {
    interface.question('Name: ', function(name) {
        interface.question('Phone Number: ', function(number) {
            phonebook[name] = number;
            console.log(`Entry stored for ${name}`)
            printHeader();
        })
    })
}

var deleteEntry = function() {
    interface.question('Name: ', function(name) {
        if (phonebook[name]) {
            delete phonebook[name];
            console.log(`Deleted entry for ${name}`)
            // console.log(phonebook)
            printHeader();
        } else {
            console.log(`There is no one by that name in the phonebook.\n ${JSON.stringify(phonebook)}`);
            printHeader();
        }
    })
}

var listAllEntries = function() {
    console.log(phonebook);
}

var runPhonebook = function(answer) {
    if (answer === '1') {
        lookupEntry();
    } else if (answer === '2') {
        setEntry();
    } else if (answer === '3') {
        deleteEntry();
    } else if (answer === '4') {
        listAllEntries();
        printHeader();
    } else if (answer === '5') {
        interface.close();
    } else {
        console.log("Uh-oh! You did not enter a valid number.")
        printHeader();
    }
}

printHeader();