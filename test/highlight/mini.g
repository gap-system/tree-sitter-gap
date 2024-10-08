f := function(x,y)
# <- function
# ^ operator
#    ^ keyword.function
#            ^ punctuation.bracket
#             ^ variable.parameter
#              ^ punctuation.delimiter
#               ^ variable.parameter
#                ^ punctuation.bracket
    local z, helper;
#   ^ keyword.function
#         ^ variable.parameter
#            ^ variable.parameter
#                  ^ punctuation.delimiter
    z := 1 - y;
#   ^ variable
#     ^ operator
#        ^ number
#          ^ operator
#            ^ variable.parameter
#             ^ punctuation.delimiter
    helper := function(bla)
#   ^ function
#          ^ operator
#             ^ keyword.function
#                     ^ punctuation.bracket
#                      ^ variable.parameter
#                         ^ punctuation.bracket
        return x + y*z - bla;
#       ^ keyword.return
#              ^ variable.parameter
#                ^ operator
#                  ^ variable.parameter
#                    ^ variable
#                      ^ operator
#                        ^ variable.parameter
#                           ^ punctuation.delimiter
    end;
#   ^ keyword.function
#      ^ punctuation.delimiter
    return helper;
#   ^ keyword.return
#          ^ function
#                ^ punctuation.delimiter
end;
# <- keyword.function
#  ^ punctuation.delimiter

f("abc", 1.100e-20 : a:= 2, beta, 1:=10);
# <- function
#^ punctuation.bracket
# ^ string
#      ^ punctuation.delimiter
#        ^ number.float
#                  ^ punctuation.delimiter
#                    ^ property
#                     ^ operator
#                        ^ number
#                         ^ punctuation.delimiter
#                           ^ property
#                               ^ punctuation.delimiter
#                                 ^ property
#                                  ^ operator
#                                    ^ number
#                                      ^ punctuation.bracket
#                                       ^ punctuation.delimiter

x -> x + 1;
# <- variable.parameter
# ^ operator
#    ^ variable.parameter
#      ^ operator
#        ^ number
#         ^ punctuation.delimiter
{x,y} -> x + y + 1;
# <- punctuation.bracket
#^ variable.parameter
# ^ punctuation.delimiter
#  ^ variable.parameter
#   ^ punctuation.bracket
#     ^ operator
#        ^ variable.parameter
#          ^ operator
#            ^ variable.parameter
#              ^ operator
#                ^ number
#                 ^ punctuation.delimiter

Print("This is a string\n");
# <- function.call
#    ^ punctuation.bracket
#     ^ string
#                      ^ string.escape
#                         ^ punctuation.bracket
#                          ^ punctuation.delimiter

'\142';
# <- character
#^ string.escape
#     ^ punctuation.delimiter

for n in [1..100] do
# <- keyword.repeat
#   ^ variable
#     ^ keyword.operator
#        ^ punctuation.bracket
#         ^ number
#          ^ operator
#            ^ number
#               ^ punctuation.bracket
#                 ^ keyword.repeat
  for i in [1..NrSmallGroups(n)] do
# ^ keyword.repeat
#     ^ variable
#       ^ keyword.operator
#          ^ punctuation.bracket
#           ^ number
#            ^ operator
#              ^ function.call
#                           ^ punctuation.bracket
#                            ^ variable
#                             ^ punctuation.bracket
#                              ^ punctuation.bracket
#                                ^ keyword.repeat
    G := SmallGroup(n,i);
#   ^ variable
#     ^ operator
#        ^ function.call
#                  ^ punctuation.bracket
#                   ^ variable
#                    ^ punctuation.delimiter
#                     ^ variable
#                      ^ punctuation.bracket
#                       ^ punctuation.delimiter
    Print("SmallGroup(", n, ",", i, ") is abelian? ", IsAbelian(G), "\n");
#   ^ function.call
#        ^ punctuation.bracket
#         ^ string
#                      ^ punctuation.delimiter
#                        ^ variable
#                         ^ punctuation.delimiter
#                           ^ string
#                              ^ punctuation.delimiter
#                                ^ variable
#                                 ^ punctuation.delimiter
#                                   ^ string
#                                                   ^ punctuation.delimiter
#                                                     ^ function.call
#                                                              ^ punctuation.bracket
#                                                               ^ variable
#                                                                ^ punctuation.bracket
#                                                                 ^ punctuation.delimiter
#                                                                   ^ string
#                                                                    ^ string.escape
#                                                                       ^ punctuation.bracket
#                                                                        ^ punctuation.delimiter
    if IsPerfectGroup(G) = true then
#   ^ keyword.conditional
#      ^ function.call
#                    ^ punctuation.bracket
#                     ^ variable
#                      ^ punctuation.bracket
#                        ^ operator
#                          ^ constant.builtin
#                               ^ keyword.conditional
      break;
#     ^ keyword
#          ^ punctuation.delimiter
    fi;
#   ^ keyword.conditional
#     ^ punctuation.delimiter
  od;
# ^ keyword.repeat
#   ^ punctuation.delimiter
od;
# <- keyword.repeat
# ^ punctuation.delimiter

foo := function(x, y...)
#               ^ variable.parameter
#                  ^ variable.parameter
#                   ^ operator
    return x;
end;

bar := function(arg)
#               ^ variable.parameter.builtin
    return arg;
end;

baz := function(x, arg)
#               ^ variable.parameter
#                  ^ variable.parameter
    return arg;
end;

foobar := atomic function(readonly arg)
#                                  ^ variable.parameter.builtin
    return arg;
end;

foobaz := {arg} -> arg;
#          ^ variable.parameter.builtin

BindGlobal("foo", 1);
# <- function.call
#         ^ punctuation.bracket
#          ^ string
#               ^ punctuation.delimiter
#                 ^ number
#                  ^ punctuation.bracket
#                   ^ punctuation.delimiter
BIND_GLOBAL("bar", 2);
# <- function.call
#          ^ punctuation.bracket
#           ^ string
#                ^ punctuation.delimiter
#                  ^ number
#                   ^ punctuation.bracket
#                    ^ punctuation.delimiter

r := rec(
# <- variable
# ^ operator
#    ^ keyword.type
#       ^ punctuation.bracket
    a := [1.0,2.3e10,3],
#   ^ variable.member
#     ^ operator
#        ^ punctuation.bracket
#         ^ number.float
#            ^ punctuation.delimiter
#             ^ number.float
#                   ^ punctuation.delimiter
#                    ^ number
#                     ^ punctuation.bracket
#                      ^ punctuation.delimiter
    b := true,
#   ^ variable.member
#     ^ operator
#        ^ constant.builtin
#            ^ punctuation.delimiter
    c := fail,
#   ^ variable.member
#     ^ operator
#        ^ constant.builtin
#            ^ punctuation.delimiter
   );
#  ^ punctuation.bracket
#   ^ punctuation.delimiter
r.a;
# <- variable
#^ punctuation.delimiter
# ^ variable.member
#  ^ punctuation.delimiter

p := rec(a:=r, b:=~.a, 1 := ~);
# <- variable
# ^ operator
#    ^ keyword.type
#       ^ punctuation.bracket
#        ^ variable.member
#         ^ operator
#           ^ variable
#            ^ punctuation.delimiter
#              ^ variable.member
#               ^ operator
#                 ^ variable.builtin
#                  ^ punctuation.delimiter
#                   ^ variable.member
#                    ^ punctuation.delimiter
#                      ^ variable.member
#                        ^ operator
#                           ^ variable.builtin
#                            ^ punctuation.bracket
#                             ^ punctuation.delimiter

p.1.a.c;
# <- variable
#^ punctuation.delimiter
# ^ variable.member
#  ^ punctuation.delimiter
#   ^ variable.member
#    ^ punctuation.delimiter
#     ^ variable.member
#      ^ punctuation.delimiter

InstallImmediateMethod( IsFinitelyGeneratedGroup,
# <- function.call
#                     ^ punctuation.bracket
#                       ^ variable
#                                               ^ punctuation.delimiter
    IsGroup and HasGeneratorsOfGroup,
#   ^ variable
#           ^ keyword.operator
#               ^ variable
    function( G )
#   ^ keyword.function
#           ^ punctuation.bracket
#             ^ variable.parameter
#               ^ punctuation.bracket
    if IsFinite( GeneratorsOfGroup( G ) ) then
#   ^ keyword.conditional
#      ^ function.call
#              ^ punctuation.bracket
#                ^ function.call
#                                 ^ punctuation.bracket
#                                   ^ variable.parameter
#                                     ^ punctuation.bracket
#                                       ^ punctuation.bracket
#                                         ^ keyword.conditional
      return true;
#     ^ keyword.return
#            ^ constant.builtin
#                ^ punctuation.delimiter
    fi;
#   ^ keyword.conditional
#     ^ punctuation.delimiter
    TryNextMethod();
#   ^ function.builtin
#                ^ punctuation.bracket
#                 ^ punctuation.bracket
#                  ^ punctuation.delimiter
    end );
#   ^ keyword.function
#       ^ punctuation.bracket
#        ^ punctuation.delimiter

quit;
# < keyword

QUIT;
# < keyword

#% pragma
# < keyword.directive

# FIXME: (reiniscirpons) It seems that the following statements cannot be
# tested for highlighting. I have a hunch that this is related to the
# newline capture used in the grammar.
?Integer
?Reference:?Integer
?Reference:?Integer;;;
?
?>>
?7138

