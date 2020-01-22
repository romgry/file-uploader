import * as FormData from 'form-data'
import { request } from 'http';
import { createReadStream } from 'fs';
import * as config from './config.json';
import * as fs from 'fs';

export default class App {
    fileName: string = config.fileName || 'dummy.txt';
    size: number = config.sizeInBytes || 1000 * 1000;
    host: string = config.host || 'localhost';
    port: string = config.port || '8000';
    path: string = config.path || '/upload';
    method: string = config.method || 'POST';
    isFileReady: boolean = false;

    constructor() {}

    init(): void {
        //check if file exists
        try {
            const stats = fs.statSync(this.fileName);
            if (stats.size && stats.size === this.size) {
                this.isFileReady = true;
            }
        } catch (error) {
            this.isFileReady = false;
        }
        if (!this.isFileReady) {
            this.isFileReady = this.onFileCreate(this.fileName, this.size);
        }
        if (this.isFileReady) {
            this.onFileUpload();
        } else {
            console.log('Please correct the errors and try again')
        }

    }

    onFileCreate(fileName: string, size: number): boolean {
        if (size <= 0) {
            console.log('Please enter any size in bytes greater then 0');
            return false;
        }
        try {
            const fd = fs.openSync(fileName, 'w');
            fs.writeSync(fd, Buffer.alloc(1), 0, 1, size - 1);
            fs.closeSync(fd);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    onFileUpload() {
        try {
            const readStream = createReadStream('./' + this.fileName);
            const form = new FormData();
            form.append('file', readStream);

            const req = request(
                {
                    host: this.host,
                    port: this.port,
                    path: this.path,
                    method: this.method,
                    headers: form.getHeaders(),
                },
                response => {
                    if (response.statusCode === 200) {
                        console.log('File ' + this.fileName + ' | ' + this.size + 'b was uploaded!')
                    } else {
                        console.log('File failed to upload. Status code: ' + response.statusCode);
                    }
                },
            ).on('error', error => {
                console.log(error);
            });
            form.pipe(req);
        } catch (error) {
            console.log(error);
        }
    }
}

