const assert = require('assert');

module.exports = class ScriptContext {
    constructor(global) {
        this.variables = new Map();
        this.global = global;
    }

    getGlobal() {
        return this.global;
    }

    setVariable(variable, value) {
        assert.equal(typeof variable, 'string');
        this.variables.set(variable, value);
    }

    getVariable(variable) {
        assert.equal(typeof variable, 'string');
        return this.variables.get(variable);
    }
};
