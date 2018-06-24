const { Transform } = require("stream");

let bitCount = 0, partialByteSum = 0;
const preamble = "CAPTIVATION";
let seq = ""; // track previous preamble.length characters
let numPrint = 0; // print the next numPrint characters

const trans = new Transform({
	transform( chunk, encoding, callback ){

		// get ascii string from buffer; remove line feed and carrage return
		const bits = chunk.toString().replace(/[^01]/g,"");

		for( const bit of bits ){
			bitCount += 1;
			partialByteSum = (partialByteSum << 1) | bit;

			if( bitCount % 8 === 0 ){
				const digit = String.fromCharCode(partialByteSum);
				partialByteSum = 0;

				if( numPrint > 0 ){
					this.push(digit);
				}

				seq = (seq + digit).substr(-preamble.length);
				numPrint = seq === preamble ? 100 : numPrint - 1;
			}
		}

		callback();
	}
});

process.stdin.pipe(trans).pipe(process.stdout);
