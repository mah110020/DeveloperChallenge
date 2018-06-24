const { Transform } = require("stream");

let bitCount = 0
const partialByteSums = [0, 0, 0, 0, 0, 0, 0, 0]; // capture every possible alignment
const charSeq = ["", "", "", "", "", "", "", ""]; // only tracks previous preamble.length characters; capture every alignment
const preamble = "CAPTIVATION";
let preambleAlignment = 0; // bit alignment of preamble
let numPrint = 0; // print the next numPrint characters

const trans = new Transform({
	transform( chunk, encoding, callback ){

		// get ascii string from buffer; remove line feed and carrage return
		const bits = chunk.toString().replace(/[^01]/g,"");

		for( const bit of bits ){
			bitCount += 1;

			for( const index in partialByteSums ){
				partialByteSums[index] = (partialByteSums[index] << 1) | bit;
			}

			const bytePopIndex = bitCount % 8;
			const digit = String.fromCharCode(partialByteSums[bytePopIndex]);
			partialByteSums[bytePopIndex] = 0;

			if( numPrint > 0 && bytePopIndex === preambleAlignment ){
				this.push(digit);
				numPrint -= 1;
			}

			charSeq[bytePopIndex] = (charSeq[bytePopIndex] + digit).substr(-preamble.length);
			if( charSeq[bytePopIndex] === preamble ){
				numPrint = 100;
				preambleAlignment = bytePopIndex;
			}
		}

		callback();
	}
});

process.stdin.pipe(trans).pipe(process.stdout);
