const stubs = {};

stubs.cpp = `
#include <iostream>
using namespace std;
int main() {
  cout << "I like solving problems with code using JavaScript!";
  return 0;
}
`
stubs.py = `
import time 
from time import sleep
for i in (1,6):
  print(i)
  sleep(i)
`
stubs.js = `
console.log("Hi JS!");
`
export default stubs;