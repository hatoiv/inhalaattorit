const fs = require('fs/promises');
const path = require('path');

const DATA_FOLDER = path.join(__dirname, "../../data");

const initFolders = async () => {
    const dirs = [
        "uploads", "uploads/full", "uploads/thumb", "uploads/tmp", "db", "admindata", "guides"
    ];

    await fs.mkdir(DATA_FOLDER, { recursive: true })
    console.log('Ensured directory: ', DATA_FOLDER);

    for (const dir of dirs) {
        const dirPath = path.join(DATA_FOLDER, dir);

        await fs.mkdir(dirPath, { recursive: true })
        console.log('Ensured directory: ', dirPath);
    }
};

const initFiles = async () => {
    const filePath = path.join(DATA_FOLDER, "admindata", "admins.json");

    // check if admins.json exists before initializing it.
    // done by fs.access throwing an error if the file doesn't exist,
    // pretty silly but this seems to be the only way to check this with fs promises.
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
    }

    console.log('Ensured file: ', filePath);
};

const initFileSystem = async () => {
    console.log('');
    await initFolders();
    await initFiles();
    console.log('');
}

module.exports = initFileSystem;
