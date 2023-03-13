import { parseCallData } from '../services/abi-parser';
import { green, blue, red, yellow } from 'ansi-colors';

const run = async () => {
    const callDataStrings = process.argv.slice(2);

    for (const [index, callDataString] of callDataStrings.entries()) {
        if (index > 0) {
            console.log();
            console.log('--------------------------------------------------------------------------------');
            console.log();
        }

        console.log(blue(`parsing call data ${index + 1} of ${callDataStrings.length}`));

        let parsedCandidates;
        try {
            parsedCandidates = await parseCallData(callDataString);
        } catch (e) {
            console.log(red(`call data could not be parsed:`), e);
            continue;
        }

        const resultString = `parsed ${parsedCandidates.length} matching function call(s):`;
        console.log(parsedCandidates.length > 0 ? green(resultString) : yellow(resultString));

        for (const candidate of parsedCandidates) {
            console.log(JSON.stringify(candidate, undefined, 4));
        }
    }
};

run()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
