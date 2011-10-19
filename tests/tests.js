var sys = require('sys'),
    fs = require('fs');

fs.readFile(process.argv[2], 'utf8', function(err, input){
    if (err) throw err;
    console.log(input);
    try {
        var xjst = require('./../lib/xjst'),
            result = xjst.ometa.XJSTParser.matchAll(
                input,
                'topLevel',
                undefined,
                function(m, i) { throw { errorPos: i, toString: function(){ return "match failed" } } }
            );
        process.stdout.write('--- tree:\n' + JSON.stringify(result) + '\n\n');

        var compileFn = xjst.ometa.XJSTCompiler.match(result, 'topLevel');
        process.stdout.write('--- compile:\n' + compileFn + '\n\n');
        compileFn = process.compile(compileFn, 'compile').apply;

        var compileFn2 = xjst.compile(result);
        process.stdout.write('--- compile2:\n' + compileFn2 + '\n\n');
        try {
            compileFn2 = process.compile(compileFn2, 'compile2').apply;
        } catch(e) { console.log(e) }

        process.stdout.write('\n-=-=-=-=-=-=-=-=-=-=-\n\n');
        fs.readFile(process.argv[2] + '.json', 'utf8', function(err, input){
            if (err) return;
            input = JSON.parse(input);

            try {
                process.stdout.write(
                    compileFn(input) +
                    '\n\n');

                process.stdout.write(
                    compileFn2(input) +
                    '\n\n');
            } catch(e) {
                console.log(e);
            }
        });

    } catch (e) {
	if(e.errorPos != undefined) {
            var isString = typeof input === 'string';
            isString && (input = input.split(''));
            input.splice(e.errorPos, 0, '\n--- Parse error ->');
            sys.error(isString? input.join('') : input);
	}
        console.log('error: ' + e);
        throw e
    }
});
