const { LEXEMES, parse, lexer } = require("../transpiler");
var assert = require('assert');

describe('Lexemes', function () {
    const otherLexemes = (lexeme) => (Object.values(LEXEMES).filter((l) => l.name != lexeme));
    describe('lexer', function () {
        it('should return list of lexemes for simple program', function () {
            const program = "set val 0\n  inc val 1   \ninc val 1";
            assert(lexer(program).length === 11);
            assert(lexer(program)[0].string === "set");
        });
    });
    describe('instruction', function () {
        it('should verify only the correct string', function () {
            assert(LEXEMES.instruction.matches("variable"));
            assert(!LEXEMES.instruction.matches("123"));
            assert(!LEXEMES.instruction.matches("variable123"));
        });
    });
    describe('comment', function () {
        it('should verify only the correct string', function () {
            assert(LEXEMES.comment.matches("//comment"));
            assert(!LEXEMES.comment.matches("123"));
            assert(!LEXEMES.comment.matches("variable123"));
        });
    });
    describe('varName', function () {
        it('should verify only the correct string', function () {
            assert(LEXEMES.varName.matches("variable"));
            assert(!LEXEMES.varName.matches("123"));
            assert(LEXEMES.varName.matches("variable123"));
        });
    });
    describe('arraySymbol', function () {
        it('should verify only the correct string', function () {
            assert(LEXEMES.arraySymbol.matches("[5]"));
            assert(!LEXEMES.arraySymbol.matches("123"));
            assert(LEXEMES.arraySymbol.matches("[255]"));
        });
    });
});

describe('Instructions', function () {
    describe('var', function () {
        it('adds new symbol to the scope', function () {
            assert(parse("var Variable").find("variable"));
        });
        it('throws error on variable redefinition', function () {
            assert(parse("var a a").error);
        });
        it('adds an array variable to the scope', function () {
            assert(parse("var a[5]").find("a"));
        });
    });
    describe('set', function () {
        it('should match a string only with correct keyword', function () {
            //assert(parse("set Variable 5"));
        });
    });
    describe('inc', function () {
        it('should match a string only with correct keyword', function () {
            //assert("inc variable 5".match(LEXEMES.inc.regex));
            //assert(!"inc 5 asdasd".match(LEXEMES.inc.regex));
            // otherLexemes("inc").forEach((l) => assert(!"inc Variable b".match(l.regex)));
        });
    });
});

describe('Parser', function () {
    describe('parse', function () {
        it('returns an error message for invalid syntax', function () {
            assert(parse("invalid!!! syntax!!").error);
            assert(parse("var a 1").error);
        });
        it('does not return an error message for valid syntax', function () {
            assert.equal(parse("var a b").error, undefined);
        });
    });
});
