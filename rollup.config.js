import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/main.js',
    output: [{
        file: 'dist/html-to-pptxgenjs-parser.cjs.js',
        format: 'cjs'
    }, {
        file: 'dist/html-to-pptxgenjs-parser.min.js',
        format: 'iife',
        name: 'htmlToPptxgenjsParser',
        plugins: [terser()]
    }]
};
