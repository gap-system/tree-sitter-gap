function(x...)
    return x;
end

{x,y} -> x + y + 1

Print("This is a string\n");

for n in [1..100] do
  for i in [1..NrSmallGroups(n)] do
    G := SmallGroup(n,i);
    Print("SmallGroup(",n, ",", i, ") is abelian? ", IsAbelian(G), "\n");
  od;
od;

r := rec(
    a := [1,2,3],
    b := true,
    c := fail,
   );
