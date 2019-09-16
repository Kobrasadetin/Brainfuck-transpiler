# Brainfuck-transpiler
Brainfuck transpiler

This transpiler is created for the purpose of completing a Codingwars kata.
It is released under GPLv3 or later.


This is the original task:

## Prologue

In this kata. We assume that you know what [BrainFuck](http://en.wikipedia.org/wiki/Brainfuck) is. And it would be better if you were able to recite all 8 basic operators to solve this kata.

## Background

Have you ever coded BrainFuck by hand ?  
Have you ever counted the operators again and again to make sure that the pointer points to the correct cell ?  
Is it fun ?  
Of course it is fun, especially when you produce a super short code abusing every cells while having the same functionality as long long codes.  
But is it always that fun ?

We know what to do if we are not 100 percent satisfied with an existing language. Stop using it, or create another language and transpile to it.

## Requirement

You are given a `code` follows the following specification, and are going to transpile it to BrainFuck.

## Specification

### Lexical Syntax

```txt
Program -\u003e Statement Comment* [EOL Program]

Statement -\u003e \"var\" VarSingle+
    | \"set\" VarName VarNameOrNumber

    | \"inc\" VarName VarNameOrNumber
    | \"dec\" VarName VarNameOrNumber

    | \"add\" VarNameOrNumber VarNameOrNumber VarName
    | \"sub\" VarNameOrNumber VarNameOrNumber VarName
    | \"mul\" VarNameOrNumber VarNameOrNumber VarName
    | \"divmod\" VarNameOrNumber VarNameOrNumber VarName VarName
    | \"div\" VarNameOrNumber VarNameOrNumber VarName
    | \"mod\" VarNameOrNumber VarNameOrNumber VarName

    | \"cmp\" VarNameOrNumber VarNameOrNumber VarName

    | \"a2b\" VarNameOrNumber VarNameOrNumber VarNameOrNumber VarName
    | \"b2a\" VarNameOrNumber VarName VarName VarName

    | \"lset\" ListName VarNameOrNumber VarNameOrNumber
    | \"lget\" ListName VarNameOrNumber VarName

    | \"ifeq\" VarName VarNameOrNumber
    | \"ifneq\" VarName VarNameOrNumber
    | \"wneq\" VarName VarNameOrNumber
    | \"proc\" VarName+
    | \"end\"
    | \"call\" VarName+

    | \"read\" VarName
    | \"msg\" VarNameOrString+

    | \"rem\" \u0026lt;all characters until EOL or EOF\u0026gt;

Comment -\u003e CommentPrefix \u0026lt;all characters until EOL or EOF\u0026gt;

EOL -\u003e \u0026lt;U+000A\u0026gt;
CommentPrefix -\u003e // | -- | #
Digit -\u003e 0 | 1 | ... | 9
VarPrefix -\u003e $ | _
    | a | b | ... | z
    | A | B | ... | Z
VarSuffix -\u003e VarPrefix | Digit
CharElement -\u003e \u0026lt;any characters other than ', \", or \\\u0026gt;
    | \\\\ | \\' | \\\"
    | \
 | \\r | \\t
CharQuote -\u003e '
Char -\u003e CharQuote CharElement CharQuote
StringQuote -\u003e \"
String -\u003e StringQuote CharElement* StringQuote
Number -\u003e '-' Digit+ | Digit+ | Char

VarName -\u003e VarPrefix VarSuffix*
ListName -\u003e VarName
VarNameOrNumber -\u003e VarName | Number
VarNameOrString -\u003e VarName | String
VarSingle -\u003e VarName
    | ListName '[' Digit+ ']'
```

Note

+ One line per instruction. Empty lines are acceptable. White spaces are used to seprate elements. Redundent spaces are just ignored.
+ Instruction names and variable names are all case insensitive.
+ Character literals are just numbers. (eg. `'z' -\u003e 122`)
+ If a number is not in range [0,255] wrap it into this range. (eg. `450 -\u003e 194`, `-450 -\u003e 62`)

### Instruction
#### Variable
`var VarSingle+`. Define one to many variables, some could be lists.  
The length of a list will always be in range [1,256].  
eg. `var A B C[100] D` defines variable `A`, `B`, `C` and `D` where `C` represent a 100-length list (or you call it an array).  
`var X [ 80 ]` is also acceptable.  
All variables and all list slots are initialized to `0`.

`set a b`. Set value of variable `a` to `b`.  
eg. `set X 30`, `set X Y`.

**Note** Variables can be defined everywhere except inside a `procedure`, and they are all global variables, cannot be used before defined.

#### Arithmetic
`inc a b`. Increase the value of `a` as `b`. Equals to `a += b`.  
eg. `inc X 10`, `inc X Y`.

`dec a b`. Decrease the value of `a` as `b`. Equals to `a -= b`.  
eg. `dec Y 10`, `dec X Y`.


`add a b c`. Add `a` and `b` then store the result into `c`. Equals to `c = a + b`.  
eg. `add 10 X Y`, `add X Y X`

`sub a b c`. Subtract `b` from `a` then store the result into `c`. Equals to `c = a - b`.  
eg. `sub X 20 Y`, `sub X Y Y`

`mul a b c`. Multiply `a` and `b` then store the result into `c`. Equals to `c = a * b`.  
eg. `mul 10 20 X`, `mul X 10 X`

`divmod a b c d`. Divide `a` and `b` then store the quotient into `c` and the remainder into `d`. Equals to `c = floor(a / b), d = a % b`.  
eg. `divmod 20 10 X Y`, `divmod X Y X Y`, `divmod X 10 Y X`.

`div a b c`. Divide `a` and `b` then store the quotient into `c`. Equals to `c = floor(a / b)`.  
eg. `div 10 X X`, `div X X X`

`mod a b c`. Divide `a` and `b` then store the remainder into `c`. Equals to `c = a % b`.  
eg. `mod 10 X X`, `mod X X Y`


**Note** The behavior when divisor is 0 is not defined, and will not be tested.

`cmp a b c`. Compare `a` and `b`.  
If `a` \u003c `b` store -1(255) into `c`.  
If `a` == `b` store 0 into `c`.  
If `a` \u003e `b` store 1 into `c`.  
eg. `cmp 10 10 X`, `cmp X X X`, `cmp X 20 Y`

`a2b a b c d`. ASCII To Byte. Treat `a`, `b` and `c` as ASCII digits and store the number represents those digits into `d`.  
Equals to `d = 100 * (a - 48) + 10 * (b - 48) + (c - 48)`.  
eg. `a2b '1' '5' '9' X`, `a2b '0' X Y X`

`b2a a b c d`. Byte To ASCII. The reverse operation of `a2b`.  
Equals to `b = 48 + floor(a / 100), c = 48 + floor(a / 10 % 10), d = 48 + (a % 10)`.  
eg. `b2a 159 X Y Z`, `b2a 'z' X Y Z`, `b2a X X Y Z`


#### List
`lset a b c`. Set `c` into index `b` of list `a`. Equals to `a[b] = c`.  
eg. `lset X 0 20`, `lset X Y Z`

`lget a b c`. Read index `b` of list `a` into `c`. Equals to `c = a[b]`.  
eg. `lget X 0 X`, `lget X Y Z`

**Note** The behavior of accessing invalid index (negative or too big) is not defined, and will not be tested.

#### Control Flow
`ifeq a b`. Execute the block when `a` equals to `b`. Equals to `if (a == b) {`

`ifneq a b`. Execute the block when `a` not equals to `b`. Equals to `if (a != b) {`

`wneq a b`. Execute the block repeatly while `a` not equals to `b`. Equals to `while (a != b) {`

`proc procedureName procedureParamater`. Begin a procedure block.

`end`. The end of `ifeq`, `ifneq`, `wneq` and `proc`. Equals to `}`

`call procedureName argument`. Invoke a procedure.

Notes

+ `ifeq`, `ifneq` and `wneq` can be nested, can appear inside a `proc`.
+ `proc` can not be nested.
+ `call` can invoke a `proc` defines below it.
+ `call` can be inside a `proc`.
+ Procedures can not be directly or indirectly recursive.
+ Arguments are passed to a procedure by reference, which means procedures are kind of marco.
+ Procedure paramaters can have same name with global variables, in which case its content refers to the parameter instead of global variables.

#### Interactive
`read a`. Read into `a`.

`msg`. Print message. The spaces around strings are not necessary.  
eg. `msg \"a is \" a`, `msg\"b \"\"is\"b\"\
\"`, `msg a b c`

#### Comment
`rem`. Comment the whole line.

## Error Handling

A complete transpiler would not only accept valid input but also tells the errors in an invalid input.  
If any situation mentioned below occured, just throws anything.  
There will not be any other invalid forms appears in the final tests. (eg. `msg 20` does not suit the specification but will not be tested)  
Also, there will not exist procedures that are not being used.

+ Unknown instructions. `whatever a b c`
+ Number of arguments for an instruction does not match the expectation. `add 20`, `div 20 20 c d`
+ Undefined var names. `var Q\
add Q Q S`
+ Duplicate var names. `var Q q`, `var Q\
var Q[20]`
+ Define variables inside a procedure. `proc whatever\
var Q\
end`
+ Unclosed `[]` pair. `var Q[ 20 S`
+ Expect a variable but got something else. `set 20 20`, `inc \"a\" 5`
+ Expect a variable but got a list. `var A B[20]\
lset B B 20`
+ Expect a list but got a variable. `var A B[20]\
lset A 0 20`
+ Unclosed `''` pair. `add '0 '1' a`
+ Unclosed `\"\"` pair. `msg \"abc`
+ Nested procedures. `proc pa\
proc pb\
end\
end`
+ Duplicate procedure names. `proc a\
end\
proc a\
end`
+ Duplicate parameter names. `proc a Q q\
end`
+ End before beginning a block. `end`
+ Unclosed blocks. `var a\
ifeq a 0`
+ Undefined procedure. `call whatever`
+ The length of arguments does not match the length of parameters. `proc a b c\
end\
call a x`
+ Recursive call.

```txt
var A
set a 20
call Wrap a
proc Say x
    msg \"It is \"x
    call Wrap X
end
Proc Wrap X
    call Say x
eNd
```

## What should the code be transpiled like
Any valid BrainFuck code with the same functionality.  
If you stuck on some instructions, you can check the following links.  
[Brainfuck algorithms](https://esolangs.org/wiki/Brainfuck_algorithms)  
[INSHAME: Brainfuck](http://www.inshame.com/search/label/Brainfuck)  
Actually this kata is inspired by the project `FBF` on INSHAME site.

## Example

```js
var code = kcuf(`
var q w e
read q
read w
add q w e
msg q \" \" w \" \" e
`)
runBF(Code,'A!') === 'A ! b'
```

Checkout more in example tests.

## About the BrainFuck interpreter

The interpreter used here

+ Accept and ignore characters other than `+-\u003c\u003e,.[]`.
+ Has *infinity* cells.
+ Cells value are wrapped into [0,255].
+ Throws an error when accessing negative indexes.

The following situations will be optimized

+ Continous `+`s.
+ Continous `-`s.
+ Continous `\u003c`s.
+ Continous `\u003e`s.
+ Loops that only contain `+-\u003c\u003e`, return back to be begining position at the end, and totally increasing 1 or decreasing 1 to the begining position. (eg. `[-]`, `[\u003e+\u003c-\u003c+\u003e]`. Not `[\u003e]`, `[-\u003e]`, `[\u003e[-]]`)

## Note

+ You do not need to concentrate on the size and performance of the output code, but you may need to be careful if the algorithm you used to transpile an instruction is too slow.
+ If you are sure that my implementation of BrainFuck interpreter includes a bug that fails your solution. Please feel free to raise an issue.
+ If the description above is not clear enough. Please feel free to question me.

Have Fun.
