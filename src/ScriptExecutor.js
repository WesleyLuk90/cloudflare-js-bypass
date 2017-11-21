const assert = require('assert');
const util = require('util');
const ScriptObject = require('./ScriptObject');

module.exports = class ScriptExecutor {
    constructor(context) {
        this.context = context;
    }

    execute(nodes) {
        assert(Array.isArray(nodes));
        nodes.forEach((statement) => {
            this.executeStatement(statement);
        });
    }

    executeStatement(statement) {
        this.e(statement, {
            VariableDeclaration: () => {
                statement.declarations.forEach((d) => this.declareVariable(d));
            },
            ExpressionStatement: () => {
                this.evaluateExpression(statement.expression);
            },
            EmptyStatement: () => {},
        });
    }

    evaluateExpression(statement) {
        this.e(statement, {
            CallExpression: () => {
                this.callExpression(statement);
            },
            Literal: () => {},
            AssignmentExpression: () => {
                switch (statement.operator) {
                    case '+=':
                        this.setVariable(statement.left, this.getVariable(statement.left) + this.evaluateValue(statement.right));
                        break;
                    case '-=':
                        this.setVariable(statement.left, this.getVariable(statement.left) - this.evaluateValue(statement.right));
                        break;
                    case '*=':
                        this.setVariable(statement.left, this.getVariable(statement.left) * this.evaluateValue(statement.right));
                        break;
                    case '=':
                        this.setVariable(statement.left, this.evaluateValue(statement.right));
                        break;
                    default:
                        this.fail(statement);
                }
            },
        });
    }

    callExpression(node) {
        const callee = node.callee;
        if (callee.type === 'Identifier') {
            return this.context.getGlobal().callMethod(callee.name, node.arguments.map(a => this.evaluateValue(a)));
        } else {
            assert.equal(callee.type, 'MemberExpression');
            const object = this.getVariable(callee.object);
            assert(object, `Unknown object ${JSON.stringify(callee.object)}`);
            if (typeof object === 'string') {
                return object[callee.property.name](...node.arguments.map(a => this.evaluateValue(a)));
            }
            return object.callMethod(callee.property.name, node.arguments.map(a => this.evaluateValue(a)));
        }
    }

    setVariable(node, value) {
        return this.e(node, {
            Identifier: () => {
                return this.context.setVariable(node.name, value);
            },
            MemberExpression: () => {
                return this.getVariable(node.object).setProperty(node.property.name, value);
            },
        });
    }

    getVariable(node) {
        return this.e(node, {
            Identifier: () => {
                return this.context.getVariable(node.name);
            },
            MemberExpression: () => {
                return this.getProperty(this.getVariable(node.object), node.property.name || node.property.value);
            },
            CallExpression: () => {
                return this.callExpression(node);
            },
        });
    }

    getProperty(object, key) {
        assert(object);
        if (Array.isArray(object)) {
            return object[key];
        }
        if (typeof object === 'string') {
            return object[key];
        }
        return object.getProperty(key);
    }

    declareVariable(d) {
        if (d.init) {
            if (d.init.type === 'ObjectExpression') {
                const object = new ScriptObject();
                d.init.properties.forEach((p) => {
                    if (p.key.type === 'Identifier') {
                        object.setProperty(p.key.name, this.evaluateValue(p.value));
                    } else if (p.key.type === 'Literal') {
                        object.setProperty(p.key.value, this.evaluateValue(p.value));
                    }
                });
                this.setVariable(d.id, object);
            } else {
                this.context.setVariable(d.id.name, this.evaluateValue(d.init));
            }
        }
    }

    evaluateValue(node) {
        return this.e(node, {
            Literal: () => {
                return node.value;
            },
            Identifier: () => {
                return this.context.getVariable(node.name);
            },
            MemberExpression: () => {
                return this.getVariable(node);
            },
            CallExpression: () => {
                return this.callExpression(node);
            },
            BinaryExpression: () => {
                switch (node.operator) {
                    case '+':
                        return this.evaluateValue(node.left) + this.evaluateValue(node.right);
                    case '-':
                        return this.evaluateValue(node.left) - this.evaluateValue(node.right);
                    default:
                        this.fail(node);
                }
            },
            UnaryExpression: () => {
                switch (node.operator) {
                    case '+':
                        return +this.evaluateValue(node.argument);
                    case '!':
                        return !this.evaluateValue(node.argument);
                    default:
                        this.fail(node);
                }
            },
            ArrayExpression: () => {
                return []
            },
        });
    }

    e(node, typeActions) {
        if (!typeActions[node.type]) {
            this.fail(node);
        }
        return typeActions[node.type](node);
    }

    fail(node) {
        console.error(util.inspect(node));
        assert.fail(`Unexpected node ${node.type}`);
    }
};
