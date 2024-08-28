f := function(x, y)
# <- definition.function
    local z, helper;

    z := 1 - y;
    helper := function(bla)
#   ^ definition.function
        return x + y*z - bla;
    end;

    return helper;
end;

g := f(10, 11);
#    ^ reference.call

result := g(3);
#         ^ reference.call

bar := x -> x+1;
# <- definition.function
baz := {x, y} -> x^y;
# <- definition.function

result := baz(bar(1, 2), 3);
#         ^ reference.call
#             ^ reference.call

foo := atomic function(x, readonly y)
# <- definition.function
  if y = 10 then
    return x;
  fi;

  return x + 10;
end;

foo(1, 10);
# <- reference.call
