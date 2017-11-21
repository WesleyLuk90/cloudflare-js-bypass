const assert = require('assert');

module.exports = class ScriptObject {
    constructor(values) {
        this.properties = new Map();
        if (values) {
            Object
                .keys(values)
                .forEach(key => this.properties.set(key, values[key]));
        }
    }

    callMethod(name, args) {
        const method = this.properties.get(name);
        assert.equal(typeof method, 'function', `No method with the name ${name}`);
        return method(...args);
    }

    getProperty(name) {
        assert(this.properties.has(name), `No property with name ${name} on ${JSON.stringify(this)}`);
        return this.properties.get(name);
    }

    setProperty(name, value) {
        this.properties.set(name, value);
        return this;
    }
};
