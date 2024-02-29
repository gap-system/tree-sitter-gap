f := function(x,y)
# <- variable
# ^ operator
#    ^ keyword
#            ^ punctuation.bracket
#             ^ variable.parameter
#              ^ punctuation.delimiter
#               ^ variable.parameter
#                ^ punctuation.bracket
    local z, helper;
#   ^ keyword
#         ^ variable.parameter
#            ^ variable.parameter
#                  ^ punctuation.delimiter
    z := 1 - y;
#   ^ variable.parameter
#     ^ operator
#        ^ number
#          ^ operator
#            ^ variable.parameter
#             ^ punctuation.delimiter
    helper := function(bla)
#   ^ variable.parameter
#          ^ operator
#             ^ keyword
#                     ^ punctuation.bracket
#                      ^ variable.parameter
#                         ^ punctuation.bracket
        return x + y*z - bla;
#       ^ keyword
#              ^ variable
#                ^ operator
#                  ^ variable
#                    ^ variable
#                      ^ operator
#                        ^ variable.parameter
#                           ^ punctuation.delimiter
    end;
#   ^ keyword
#      ^ punctuation.delimiter
    return helper;
#   ^ keyword
#          ^ variable.parameter
#                ^ punctuation.delimiter
end;
# <- keyword
#  ^ punctuation.delimiter

f("abc", 1.100e-20 : a:= 2, beta, 1:=10);
# <- function
#^ punctuation.bracket
# ^ string
#      ^ punctuation.delimiter
#        ^ number
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
# <- function
#    ^ punctuation.bracket
#     ^ string
#                      ^ escape
#                         ^ punctuation.bracket
#                          ^ punctuation.delimiter

for n in [1..100] do
# <- keyword
#   ^ variable
#     ^ operator
#        ^ punctuation.bracket
#         ^ number
#          ^ operator
#            ^ number
#               ^ punctuation.bracket
#                 ^ keyword
  for i in [1..NrSmallGroups(n)] do
# ^ keyword
#     ^ variable
#       ^ operator
#          ^ punctuation.bracket
#           ^ number
#            ^ operator
#              ^ function
#                           ^ punctuation.bracket
#                            ^ variable
#                             ^ punctuation.bracket
#                              ^ punctuation.bracket
#                                ^ keyword
    G := SmallGroup(n,i);
#   ^ variable
#     ^ operator
#        ^ function
#                  ^ punctuation.bracket
#                   ^ variable
#                    ^ punctuation.delimiter
#                     ^ variable
#                      ^ punctuation.bracket
#                       ^ punctuation.delimiter
    Print("SmallGroup(", n, ",", i, ") is abelian? ", IsAbelian(G), "\n");
#   ^ function
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
#                                                     ^ function
#                                                              ^ punctuation.bracket
#                                                               ^ variable
#                                                                ^ punctuation.bracket
#                                                                 ^ punctuation.delimiter
#                                                                   ^ string
#                                                                    ^ escape
#                                                                       ^ punctuation.bracket
#                                                                        ^ punctuation.delimiter
    if IsPerfectGroup(G) = true then
#   ^ keyword
#      ^ function
#                    ^ punctuation.bracket
#                     ^ variable
#                      ^ punctuation.bracket
#                        ^ operator
#                          ^ constant.builtin
#                               ^ keyword
      break;
#     ^ keyword
#          ^ punctuation.delimiter
    fi;
#   ^ keyword
#     ^ punctuation.delimiter
  od;
# ^ keyword
#   ^ punctuation.delimiter
od;
# <- keyword
# ^ punctuation.delimiter

BindGlobal("foo", 1);
# <- function
#         ^ punctuation.bracket
#          ^ string
#               ^ punctuation.delimiter
#                 ^ number
#                  ^ punctuation.bracket
#                   ^ punctuation.delimiter
BIND_GLOBAL("bar", 2);
# <- constant
#          ^ punctuation.bracket
#           ^ string
#                ^ punctuation.delimiter
#                  ^ number
#                   ^ punctuation.bracket
#                    ^ punctuation.delimiter

r := rec(
# <- variable
# ^ operator
#    ^ keyword
#       ^ punctuation.bracket
    a := [1.0,2.3e10,3],
#   ^ property
#     ^ operator
#        ^ punctuation.bracket
#         ^ number
#            ^ punctuation.delimiter
#             ^ number
#                   ^ punctuation.delimiter
#                    ^ number
#                     ^ punctuation.bracket
#                      ^ punctuation.delimiter
    b := true,
#   ^ property
#     ^ operator
#        ^ constant.builtin
#            ^ punctuation.delimiter
    c := fail,
#   ^ property
#     ^ operator
#        ^ constant.builtin
#            ^ punctuation.delimiter
   );
#  ^ punctuation.bracket
#   ^ punctuation.delimiter
r.a;
# <- variable
#^ punctuation.delimiter
# ^ property
#  ^ punctuation.delimiter

p := rec(a:=r, b:=~.a, 1 := ~);
# <- variable
# ^ operator
#    ^ keyword
#       ^ punctuation.bracket
#        ^ property
#         ^ operator
#           ^ variable
#            ^ punctuation.delimiter
#              ^ property
#               ^ operator
#                 ^ variable.builtin
#                  ^ punctuation.delimiter
#                   ^ property
#                    ^ punctuation.delimiter
#                      ^ property
#                        ^ operator
#                           ^ variable.builtin
#                            ^ punctuation.bracket
#                             ^ punctuation.delimiter

p.1.a.c;
# <- variable
#^ punctuation.delimiter
# ^ property
#  ^ punctuation.delimiter
#   ^ property
#    ^ punctuation.delimiter
#     ^ property
#      ^ punctuation.delimiter

InstallImmediateMethod( IsFinitelyGeneratedGroup,
# <- function
#                     ^ punctuation.bracket
#                       ^ variable
#                                               ^ punctuation.delimiter
    IsGroup and HasGeneratorsOfGroup,
#   ^ variable
#           ^ operator
#               ^ variable
    function( G )
#   ^ keyword
#           ^ punctuation.bracket
#             ^ variable.parameter
#               ^ punctuation.bracket
    if IsFinite( GeneratorsOfGroup( G ) ) then
#   ^ keyword
#      ^ function
#              ^ punctuation.bracket
#                ^ function
#                                 ^ punctuation.bracket
#                                   ^ variable.parameter
#                                     ^ punctuation.bracket
#                                       ^ punctuation.bracket
#                                         ^ keyword
      return true;
#     ^ keyword
#            ^ constant.builtin
#                ^ punctuation.delimiter
    fi;
#   ^ keyword
#     ^ punctuation.delimiter
    TryNextMethod();
#   ^ function
#                ^ punctuation.bracket
#                 ^ punctuation.bracket
#                  ^ punctuation.delimiter
    end );
#   ^ keyword
#       ^ punctuation.bracket
#        ^ punctuation.delimiter
