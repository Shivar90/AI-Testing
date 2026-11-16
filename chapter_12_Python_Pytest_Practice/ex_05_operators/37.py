is_shiv_married = True
print(not is_shiv_married)
print(is_shiv_married)

# Logical Operator -> bool
# > , <  >= <=
x = 10
y = 20
print(x > y)
print(x < y)

print(" ----------------------------- ")

ans = 100
bns = 100
print(ans is bns)  # Memory identity comparison
# print(ans == bns)  # Value comparison
# print(ans >= bns) # 100 > 100 or 100 = 100
# print(isinstance(ans == bns, bool)) # True
print(id(ans))
print(id(bns))



"""When I assign ans = 100 and bns = 100, both variables reference the same integer object in CPython because it caches small integers from -5 to 256. Therefore, ans is bns returns True, and both id() values are identical. This is a memory optimization. However, for comparing integer values, we should always use == instead of is."

Key takeaway: is checks whether two variables reference the same object, not whether their values are equal. Integer caching explains your observed result, but it should never be relied upon for application logic.
"""