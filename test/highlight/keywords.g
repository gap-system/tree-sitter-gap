if x = 2 then
# <- keyword
#        ^ keyword 
elif 1+1 = 2 then
# <- keyword
#            ^ keyword 
  Print(10);
else
# <- keyword
  1+1;
fi;
# <- keyword

atomic readonly x, y, readwrite z do
# <- keyword
#      ^ keyword
#                     ^ keyword
#                                 ^ keyword
  x := 3;
od;
# <- keyword

for x in [1..10] do
# <- keyword
#                ^ keyword
  Print(x);
  continue;
# ^ keyword
od;
# <- keyword

while x > 0 do
# <- keyword
#           ^ keyword
  x := x - 1;
  break;
# ^ keyword
od;
# <- keyword

repeat
# <- keyword
  x := x + 1;
until x > 0;
# <- keyword

x := rec(1:=3, a:=2);
#    ^ keyword

fun := function(x)
#      ^ keyword
  local y;
# ^ keyword
  return x + y;
# ^ keyword
end;
# <- keyword
