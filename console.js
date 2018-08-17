const readline = require('readline');
const fs = require('fs');

let phonebook = {};

let interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let generateRandom = () => Math.floor(Math.random() * 10000000 + 1);

let openPhonebook = () => {
    interface.question('What phonebook would you like to open? Enter file name: ', (answer) => {
        readFile(answer);
    })
}

let readFile = (filename) => {
    fs.readFile(filename, (err, contents) => {
       if (!err) {
           let stringContents = contents.toString();
           phonebook = JSON.parse(stringContents);
           printHeader(phonebook, filename);
       } else {
           console.log(err);
           openPhonebook();
       }
   })
}

let create = (phonebook, filename) => {
    interface.question('What do you want to do (1-5)?' + '\n', ((answer) => {
        runPhonebook(answer, phonebook, filename);
    }))
}

let printHeader = (phonebook, filename) => {
    let menuArray = 
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

let lookupEntry = (phonebook, filename) => {
    interface.question('Name: ', (answer) => {
        let keys = Object.keys(phonebook);
        keys.forEach((key) => {
            if (answer == key) {
                console.log(`Found entry for ${answer}: ${phonebook[answer]}`);
            }
        })
        printHeader(phonebook, filename);
    })
}

let setEntry = (phonebook, filename) => {
    interface.question('Name: ', (person) => {
        interface.question('Phone Number: ', (number) => {
            let id = generateRandom();
            let contact = {"name": person, "Phone Number": number, "id": id}
            phonebook[id] = contact;
            console.log(`Entry stored for ${person}`)
            printHeader(phonebook, filename);
        })
    })
}

let deleteEntry = (phonebook, filename) => {
    interface.question('Name: ', (person) => {
        let keys = Object.keys(phonebook);
        keys.forEach((key) => {
            if (phonebook[key]["name"] === person) {
                delete phonebook[key];
                console.log(`Deleted entry for ${person}`)
            }
        })
        printHeader(phonebook, filename);
        // console.log(`There is no one by that name in the phonebook.\n ${JSON.stringify(phonebook)}`);
    })
}

let listAllEntries = (phonebook, filename) => {
    console.log(phonebook);
    printHeader(phonebook, filename);
}

let writeFile = (phonebook, filename) => {
    let writePhonebook = JSON.stringify(phonebook);
    fs.writeFile(filename, writePhonebook, 'utf8', (err) => {
       if (!err) {
            console.log("Made changes to the phonebook!\nGoodbye :)");
            interface.close();
       } else {
           console.log(err);
       }
   })
}

//Get rid of if/else statements and replace with a menu object
let runPhonebook = (answer, phonebook, filename) => {
    // let menu = {
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