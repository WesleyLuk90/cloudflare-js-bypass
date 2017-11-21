const ScriptContext = require('./ScriptContext');
const ScriptObject = require('./ScriptObject');
const assert = require('assert');

module.exports = class PageContext {
    setUrl(url) {
        this.url = url;
    }

    create() {
        this.globalObject = this.createGlobalObject();
        this.documentContext = this.createDocumentObject();
        this.formContext = this.createFormContext();
        this.divElement = this.createDivElement();
        this.inputObject = this.createInputObject();

        const context = new ScriptContext(this.globalObject);
        context.setVariable('document', this.createDocumentObject());
        context.setVariable('location', this.createLocationObject());
        return context;
    }

    createDocumentObject() {
        return new ScriptObject({
            getElementById: (id) => {
                if (id === 'jschl-answer') {
                    return this.inputObject;
                } else if (id === 'challenge-form') {
                    return this.formContext;
                }
                assert.fail(`Unknown element ${id}`);
            },
            createElement: (type) => {
                assert.equal(type, 'div');
                return this.divElement;
            }
        });
    }

    createInputObject() {
        return new ScriptObject();
    }

    createDivElement() {
        const a = new ScriptObject({
            href: this.url,
        });
        const div = new ScriptObject({
            firstChild: a,
        });
        return div;
    }

    createGlobalObject() {
        return new ScriptObject({
            parseInt: parseInt,
        });
    }

    createLocationObject() {
        return new ScriptObject({
            hash: '',
        });
    }

    createFormContext() {
        return new ScriptObject({
            submit() {},
            action: '',
        });
    }
};
