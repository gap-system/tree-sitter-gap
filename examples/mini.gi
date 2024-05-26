f := function(x,y)
    local z, helper;
    z := 1 - y;
    helper := function(bla)
        return x + y*z - bla;
    end;
    return helper;
end;

f("abc", 1.100e-20 : a:= 2, beta, 1:=10);

x -> x + 1;
{x,y} -> x + y + 1;

Print("This is a string\n");

for n in [1..100] do
  for i in [1..NrSmallGroups(n)] do
    G := SmallGroup(n,i);
    Print("SmallGroup(", n, ",", i, ") is abelian? ", IsAbelian(G), "\n");
    if IsPerfectGroup(G) = true then
      break;
    fi;
  od;
od;

BindGlobal("foo", 1);
BIND_GLOBAL("bar", 2);

r := rec(
    a := [1.0,2.3e10,3],
    b := true,
    c := fail,
   );
r.a;

p := rec(a:=r, b:=~.a, 1 := ~);

p.1.a.c;

InstallImmediateMethod( IsFinitelyGeneratedGroup,
    IsGroup and HasGeneratorsOfGroup,
    function( G )
    if IsFinite( GeneratorsOfGroup( G ) ) then
      return true;
    fi;
    TryNextMethod();
    end );
