if x = 2 then
# <- keyword.conditional
#        ^ keyword.conditional
elif 1+1 = 2 then
# <- keyword.conditional
#            ^ keyword.conditional
  Print(10);
else
# <- keyword.conditional
  1+1;
fi;
# <- keyword.conditional

atomic readonly x, y, readwrite z do
# <- keyword
#      ^ keyword.modifier
#                     ^ keyword.modifier
#                                 ^ keyword.repeat
  x := 3;
od;
# <- keyword.repeat

atomic function(x)
# <- keyword.modifier
#      ^ keyword.function
#              ^ punctuation.bracket
#               ^ variable.parameter
#                ^ punctuation.bracket
  return x;
# ^ keyword.return
#        ^ variable.parameter
#         ^ punctuation.delimiter
end;
# <- keyword.function
#  ^ punctuation.delimiter

for x in [1..10] do
# <- keyword.repeat
#                ^ keyword.repeat
  Print(x);
  continue;
# ^ keyword
od;
# <- keyword.repeat

while x > 0 do
# <- keyword.repeat
#           ^ keyword.repeat
  x := x - 1;
  break;
# ^ keyword
od;
# <- keyword.repeat

repeat
# <- keyword.repeat
  x := x + 1;
until x > 0;
# <- keyword.repeat

x := rec(1:=3, a:=2);
#    ^ keyword.type

fun := function(x)
#      ^ keyword.function
  local y;
# ^ keyword.function
  return x + y;
# ^ keyword.return
end;
# <- keyword.function
