
age = 89
binary_number = 0b1010
o = 0o130
d = 0x12c
pi = 3.14
name = "Shiv"
is_pramod_married = True
complex_number = 1 + 7j

print(age, type(age))
print(binary_number, type(binary_number))
print(o, type(o))
print(d, type(d))
print(pi, type(pi))
print(name, type(name))
print(is_pramod_married, type(is_pramod_married))
print(complex_number, type(complex_number))

"""
Different representations of the same number: 10
Decimal · Base 10
10


Binary · Base 2
0b1010


Octal · Base 8
0o12


Hexadecimal · Base 16
0xA



All four values represent the same integer, 10.

Binary: 0b1010
Binary uses only 0 and 1.

1010_2 = 1(8)+0(4)+1(2)+0(1)=10


Octal: 0o130
Octal uses digits 0 through 7.

130_8=1(64)+3(8)+0(1)=88

Hexadecimal: 0x12c
Hexadecimal uses 0–9 and A–F, where C = 12.

12C_{16}=1(256)+2(16)+12=300


Important interview point: Binary, octal, hexadecimal and decimal integer literals all produce the same Python data type: int.Binary: 0b1010
Binary uses only 0 and 1.


1010_2 = 1(8)+0(4)+1(2)+0(1)=10


Octal: 0o130
Octal uses digits 0 through 7.

130_8=1(64)+3(8)+0(1)=88


Hexadecimal: 0x12c
Hexadecimal uses 0–9 and A–F, where C = 12.

12C_{16}=1(256)+2(16)+12=300


Important interview point: Binary, octal, hexadecimal and decimal integer literals all produce the same Python data type: int.

"""

number = 10

print(bin(number))  # 0b1010
print(oct(number))  # 0o12
print(hex(number))  # 0xa
print(int("1010", 2))  # 10