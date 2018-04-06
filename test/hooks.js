const path = require('path');
const { fork } = require('child_process');

before((done) => {

    const filePath = path.resolve(__dirname, '../db/sync.js');
    const forkedProcess = fork(filePath);

    forkedProcess.once('exit', () => done());
});

after((done) => {

    const filePath = path.resolve(__dirname, '../db/drop.js');
    const forkedProcess = fork(filePath);

    forkedProcess.once('exit', () => done());
});