A sudoku input is a subset of a grid 9x9 containing numbers 1, 2, ..., 9. 

Your task is to find a sudoku input with the following properties: 

- it is not possible to extend it to the 9x9 to a valid sudoku solution (a valid solution uses each number once per row, column, 3x3 square). 

- it is possible to extend it to a valid fractional sudoku solution. 

A fractional sudoku solution is an assignment of 9 real numbers a^1_{i,j}, ..., a^9_{i,j} to each square i,j of the sudoku. It has to hold: 
- 0 <= a^k_{i,j} <= 1
- sum_{k =1}^9 a^k_{i,j} = 1
- for each i and k: sum_{j = 1}^9 a^k_{i,j} = 1 (and analogously for each column and 3x3 square)

