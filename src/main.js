// Copyright 2020 BeyondIt S.r.l.
//
// Use of this source code is governed by an MIT-style license that can be found
// in the LICENSE file or at https://opensource.org/licenses/MIT.
import Context from './context.js';

const htmlparser2 = require('htmlparser2');

function htmlToPptxText(html, options) {
    options = options || {};

    let textItems = [];

    let contextStack = [new Context(options)];

    function currentContext() {
        return contextStack[contextStack.length - 1];
    }

    function addText(text) {
        textItems.push({ text, options: currentContext().toPptxTextOptions() });

        contextStack.forEach(c => {
            c.bullet = null;
        });
    }

    function addBreak() {
        let context = currentContext();

        context.break = true;
        addText('');
        context.break = false;
    }

    function addSoftBreak() {
        let context = currentContext();

        context.softBreak = true;
        addText('');
        context.softBreak = false;
    }
    

    function onopentag(name, attr) {
        let context = Object.create(currentContext());


        switch (name) {
            case 'a':
                context.href = attr.href;
                context.href_title = attr.title;
                break;
            case 'b':
            case 'i':
            case 's':
            case 'sub':
            case 'sup':
            case 'u':
                context[name] = true;
                break;
            case 'del':
            case 'strong':
                context.b = true;
                break;
            case 'strike':
                context.s = true;
                break;
            case 'em':
                context.i = true;
                break;
            case 'br':
                addSoftBreak();
                break;
            case 'p':
                options.paraSpaceBefore ?? (context.paraSpaceBefore = options.paraSpaceBefore );
                break;
            case 'ol':
                context.indent++;
                context.bulletOptions = { type: 'number' };
                break;
            case 'ul':
                context.indent++;
                context.bulletOptions = true;
                break;
            case 'li':
                context.bullet = true;
                break;
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                context.b = true;
                context.setFontSize(name);
                break;
            case 'pre':
                context.pre = true;
                context.setFontFace(options.preFontFace || 'Courier New');
                break;
            case 'font':
                context.setColor(attr.color);
                context.setFontFace(attr.face);
                context.setFontSize(attr.size);
                break;
        }

        attr.align && (context.align = attr.align);
        context.setClass(name, attr['class']);
        attr.style && context.setStyle(attr.style);
        contextStack.push(context);

    }

    function ontext(text) {
        const context = currentContext();

        if (!context.pre) {
            text = text.replace(/\s+/g, ' ');
        }

        if(text) {
            addText(text);
        }
    }

    function onclosetag(name) {
        let context = currentContext();

        switch (name) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
            case 'pre':
                addBreak();
                break;
            case 'ol':
            case 'ul':
                if (context.indent == 0) {
                    context.bullet = false;
                    addText('');
                }
                break;
            case 'p':
                options.paraSpaceAfter ?? (context.paraSpaceAfter = options.paraSpaceAfter );
                addBreak();
                break;
        }

        if(context.align) {
            context.align = 'left';
            addText('');
        }

        contextStack.pop();
    }

    const parser = new htmlparser2.Parser({
        onopentag, ontext, onclosetag
    }, {
        decodeEntities: true
    });

    parser.write(html);

    parser.end();

    return textItems;
}

export { htmlToPptxText };
