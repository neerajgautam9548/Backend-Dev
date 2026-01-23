const fs = require('fs');

// 1. Copy file
try {
    fs.copyFileSync('file.txt', 'copied.txt');
    console.log('File is copied');
} catch (err) {
    console.log('Error while copying file');
}

// 2. Delete original file
fs.unlink('file.txt', (err) => {
    if (err) {
        console.log('Error while deleting file');
        return;
    }
    console.log('File deleted');
});

// 3. Create / Write new file
fs.writeFile('newfile.txt', 'This is new file', (err) => {
    if (err) {
        console.log('Error while writing file');
        return;
    }
    console.log('File is created');
});

// 4. Create a directory
fs.mkdir('nodejs-files/folder', { recursive: true }, (err) => {
    if (err) {
        console.log('Error while creating directory');
        return;
    }
    console.log('Directory is created');
});

// 5. Read directory contents
fs.readdir('./nodejs-files', (err, files) => {
    if (err) {
        console.log('Error while reading directory');
        return;
    }
    console.log(files);
});