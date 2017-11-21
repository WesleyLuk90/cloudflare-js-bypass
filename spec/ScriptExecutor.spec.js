const acorn = require('acorn');
const ScriptObject = require('../src/ScriptObject');
const ScriptExecutor = require('../src/ScriptExecutor');
const ScriptContext = require('../src/ScriptContext');

describe('ScriptExecutor', () => {
    it('should set values', () => {
        const script = acorn.parse('var a = 10');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toEqual(10);
    });

    it('should set objects', () => {
        const script = acorn.parse('var a = {x:30}');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a').getProperty('x')).toEqual(30);
    });

    it('should modify object values', () => {
        const script = acorn.parse('var a = {x:30}; a.x += 5');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a').getProperty('x')).toEqual(35);
    });

    it('should set calculated values', () => {
        const script = acorn.parse('var a = (+!![])+!![]');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toEqual(2);
    });

    it('should call object methods', () => {
        const script = acorn.parse('var a = b.c(3)');
        const context = new ScriptContext();
        context.setVariable('b', new class extends ScriptObject {
            callMethod(name, args) {
                if (name === 'c') {
                    return args[0] + 1;
                }
            }
        });
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toBe(4);
    });

    it('should increment', () => {
        const script = acorn.parse('var a = 2; a += 3');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toBe(5);
    });

    it('should multiply', () => {
        const script = acorn.parse('var a = 2; a *= 3');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toBe(6);
    });

    it('should assign', () => {
        const script = acorn.parse('a = 2');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a')).toBe(2);
    });

    it('should assign properties', () => {
        const script = acorn.parse('var a = {}; a.b = 2');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('a').getProperty('b')).toBe(2);
    });

    it('can call string methods', () => {
        const script = acorn.parse('var a = "hi"; b = a.match(/i/)[0]');
        const context = new ScriptContext();
        new ScriptExecutor(context).execute(script.body);
        expect(context.getVariable('b')).toBe('i');
    });
});
