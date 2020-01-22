"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FormData = require("form-data");
const http_1 = require("http");
const fs_1 = require("fs");
const config = require("./config.json");
const fs = require("fs");
class App {
    constructor() {
        this.fileName = config.fileName || 'dummy.txt';
        this.size = config.sizeInBytes || 1000 * 1000;
        this.host = config.host || 'localhost';
        this.port = config.port || '8000';
        this.path = config.path || '/upload';
        this.method = config.method || 'POST';
        this.isFileReady = false;
    }
    init() {
        //check if file exists
        try {
            const stats = fs.statSync(this.fileName);
            if (stats.size && stats.size === this.size) {
                this.isFileReady = true;
            }
        }
        catch (error) {
            this.isFileReady = false;
        }
        if (!this.isFileReady) {
            this.isFileReady = this.onFileCreate(this.fileName, this.size);
        }
        if (this.isFileReady) {
            this.onFileUpload();
        }
        else {
            console.log('Please correct the errors and try again');
        }
    }
    onFileCreate(fileName, size) {
        if (size <= 0) {
            console.log('Please enter any size in bytes greater then 0');
            return false;
        }
        try {
            const fd = fs.openSync(fileName, 'w');
            fs.writeSync(fd, Buffer.alloc(1), 0, 1, size - 1);
            fs.closeSync(fd);
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    onFileUpload() {
        try {
            const readStream = fs_1.createReadStream('./' + this.fileName);
            const form = new FormData();
            form.append('file', readStream);
            const req = http_1.request({
                host: this.host,
                port: this.port,
                path: this.path,
                method: this.method,
                headers: form.getHeaders(),
            }, response => {
                if (response.statusCode === 200) {
                    console.log('File ' + this.fileName + ' | ' + this.size + 'b was uploaded!');
                }
                else {
                    console.log('File failed to upload. Status code: ' + response.statusCode);
                }
            }).on('error', error => {
                console.log(error);
            });
            form.pipe(req);
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map