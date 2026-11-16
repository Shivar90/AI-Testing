# Find the positive number is even or odd

num = int(input("Enter a number:").strip())
if num == 0:
    print("Zero , enter a positive number!")
elif num > 0:
    if num % 2 == 0:
        print("Even")
    else:
        print("Odd")
else:
    print("Negative Number!")