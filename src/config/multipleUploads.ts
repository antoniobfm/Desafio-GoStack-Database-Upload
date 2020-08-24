import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

interface FileDTO {
	fileT: File;
}

export default {
	directory: tmpFolder,

	storage: multer.diskStorage({
		destination: tmpFolder,
		filename(request, file, callback) {
			// console.log(file);

			const fileHash = crypto.randomBytes(10).toString('HEX');
			const fileName = `${fileHash}-${file.originalname}`;

			return callback(null, fileName);
		},
	}),
};
