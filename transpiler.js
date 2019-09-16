/*
Brainfuck transpiler for a Codewars kata
https://www.codewars.com/kata/59f9cad032b8b91e12000035

Written by Mikko Karjanmaa (kobrasadetin) in 2019
released under GPLv3 or later
*/

const CONSTANTS = {
    MAX_INTEGER: 255,
    MIN_INTEGER: 0,
    MAX_ARRAY: 256,
    MIN_ARRAY: 1,
    ONLY_GLOBAL_SCOPE: true,
}

// ****************************************************************************
// LEXER
// ****************************************************************************

class Lexeme {
    constructor(name, regex) {
        this.name = name;
        this.regex = new RegExp(regex);
    }
    matches(string) {
        const match = string.match(this.regex);
        return match && match[0].length == string.length;
    }
}

const lexemeType = (string) => {
    return Object.values(LEXEMES).find(l => l.matches(string));
}

class LexemeInst {
    constructor(string, position) {
        this.string = string;
        this.position = position;
    }
    isType(lexeme) {
        return lexeme.matches(this.string);
    }
}

const LEXEMES = {
    instruction: new Lexeme("instruction", "(\\b[a-zA-Z]+\\b)"),
    comment: new Lexeme("comment", "(([\\/\\/|\\-\\-|#]).*(\n|$))"),
    varName: new Lexeme("varName", "(\\b[$_a-zA-Z][$_a-zA-Z0-9]*\\b)"),
    arraySymbol: new Lexeme("arraySymbol", "(\\[[0-9]+\\])"),
    varNameOrNumber: new Lexeme("varNameOrNumber", "(\\b[$_a-zA-Z][$_a-zA-Z0-9]*|[0-9]+\\b)"),
    EOL: new Lexeme("EOL", "(\n)"),
};

function lexer(stringInput) {
    const regexpMatcher = new RegExp(`(${Object.values(LEXEMES).map(a => a.regex.source).join("|")})`, "g");
    let foundLexeme;
    const result = [];
    while (foundLexeme = regexpMatcher.exec(stringInput)) {
        result.push(new LexemeInst(foundLexeme[0], foundLexeme.index));
    }
    return result;
}

// ****************************************************************************
// ABSTRACT SYNTAX TREE AND SYMBOL TABLE
// ****************************************************************************
// all symbols are relocatable

// in the original Codewars kata specifications
// there is only the global scope, but this could be easily changed

AST_ERRORS = {
    symbol_redefinition: "symbol already defined",
}

class STNode {
    constructor(scope, id) {
        this.scope = scope;
        this.terminal = false;
        this.id = id;
    }
}

class STSymbol {
    constructor(scope, id) {
        this.scope = scope;
        this.terminal = false;
        this.id = id.toLowerCase();
        this.isArray = false;
        this.arraySize = 0;
    }
    terminal(value) {
        this.terminal = true;
        this.terminalValue = value;
        return this;
    }
}

class STScope {
    constructor(parentScope) {
        this.parentScope = parentScope;
        this.symbols = new Map();
    }
    addSymbol(symbol) {
        if (this.find(symbol.id)) {
            throw new Error(AST_ERRORS.symbol_redefinition);
        }
        if (CONSTANTS.ONLY_GLOBAL_SCOPE && this.parentScope) {
            this.parentScope.addSymbol(symbol);
        } else {
            this.symbols.set(symbol.id, symbol);
        }
    }
    find(symbolId) {
        if (this.symbols.has(symbolId)) {
            return this.symbols.get(symbolId);
        } else if (this.parentScope) {
            return this.parentScope.find(symbol);
        }
        return null;
    }
}

// ****************************************************************************
// INSTRUCTIONS
// ****************************************************************************

const PARSER_ERROR = {
    invalid: "invalid syntax",
    value_error: "value_error",
}

class Instruction {
    constructor(symbol, paramValidator) {
        this.symbol = symbol;
        this.paramValidator = paramValidator;
        //this.fullRegex = new RegExp(`(${symbol} +${paramList.map(param => param.regex).join(" +")})`)
    }
    matches(string) {
        return string === this.symbol;
    }
    validate(lexemeArray) {
        return this.paramValidator(lexemeArray);
    }
    /*
        parameters: lexeme instances (LexemeInst)
    */
    apply(parameters, scope) {
        return scope;
    }
}

class Inst_var extends Instruction {
    apply(parameters, scope) {
        parameters.forEach((parameter, index) => {
            if (parameter.isType(LEXEMES.varName)) {
                const newSymbol = new STSymbol(scope, parameter.string);
                if (parameters[index + 1] && parameters[index + 1].isType(LEXEMES.arraySymbol)) {
                    newSymbol.isArray = true;
                    const numbers = parameters[index + 1].string.match(/[0-9]+/);
                    const arraySize = numbers[0] ? parseInt(numbers, 10) : -1;
                    if (arraySize > 256 || arraySize < 1 || arraySize != arraySize) {
                        throw new Error(PARSER_ERROR.value_error);
                    }
                    newSymbol.arraySize = arraySize;
                }
                scope.addSymbol(newSymbol);
            }
        });
        return scope;
    }
}

const arrayValidator = (lexemeTypeArray) => (inputArray) => {
    if (lexemeTypeArray.length != inputArray.length) return false;
    return lexemeTypeArray.every((lexemeType, i) => (
        inputArray[i].isType(lexemeType)
    ));
};

const INSTRUCTIONS = {
    var: new Inst_var("var", (arr) => arr.every((e) => e.isType(LEXEMES.varName) || e.isType(LEXEMES.arraySymbol))),
    set: new Instruction("set", arrayValidator([LEXEMES.varName, LEXEMES.varNameOrNumber])),
    inc: new Instruction("inc", arrayValidator([LEXEMES.varName, LEXEMES.varNameOrNumber])),
};

function parse(string) {
    const lexemeArray = lexer(string);
    const parseFn = [];
    let index = 0;

    const readInstruction = (() => {
        let line = [];
        let startingIndex = index;
        while (index < lexemeArray.length) {
            if (lexemeArray[index].isType(LEXEMES.EOL)) {
                index++;
                if (line.length) {
                    return { line, startingIndex };
                } else {
                    startingIndex = index;
                }
            }
            line.push(lexemeArray[index]);
            index++;
        }
        return { line, startingIndex };
    });

    const findInstruction = (lexeme) => {
        return Object.values(INSTRUCTIONS).find((inst) => inst.matches(lexeme.string));
    }

    const globalScope = new STScope();
    let currentScope = globalScope;

    while (index < lexemeArray.length) {
        const { line, startingIndex } = readInstruction();
        const instruction = findInstruction(line[0]);
        const parameters = line.slice(1);
        if (!instruction || !instruction.validate(parameters)) {
            return { error: { message: PARSER_ERROR.invalid, startingIndex } };
        }
        try {
            currentScope = instruction.apply(parameters, currentScope);
        } catch (error) {
            if (Object.values(AST_ERRORS).includes(error.message))
                return { error: { message: error.message, startingIndex } };
            else throw error;
        }
    }
    return globalScope;
}


//const fun = parse("set me up \nset me up \ninc g 56");
const result = parse("var a[5]");
console.log(result);

module.exports = { LEXEMES, parse, lexer };