// the hashmap and sliding window
// Problem
//
// Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.
//
//You may assume exactly one solution exists, and you may not use the same element twice.
//
// Example
// nums = [2, 7, 11, 15], target = 9
// Output: [0, 1]
const hashMap = (nums, target)=>{
  const m = new Map()
  for (let i = 0; i < nums.length; i++){
    const remaining = target - nums[i]
    if(m.has(remaining)) return [m.get(remaining),i]
    else m.set(nums[i],i)
  }
  return []
}

// Problem
//
// Given a string s, return an object/dictionary containing the frequency of each character.
//
//   Example
// s = "banana"
// Output = {
//   b: 1,
//   a: 3,
//   n: 2
// }

const dictFrequency = (s) =>{
  const freq = new Map()
  for (let char of s){
    freq.set(char,(freq.get(char) || 0) +1 )
  }
  return Object.fromEntries(freq)
}
//
// Problem
//
// Given an array of strings strs, group the anagrams together.
//
//   Example
// Input: ["eat", "tea", "tan", "ate", "nat", "bat"]
//
// Output:
//   [
//     ["eat", "tea", "ate"],
//     ["tan", "nat"],
//     ["bat"]
//   ]

const groupingStrings = (strs) =>{
  const anagrams = new Map()
  for (let str of strs){
 const key = str.split('').sort().join('');

    if(!anagrams.has(key)){
      anagrams.set(key,[])
    }
    anagrams.get(key).push(str)
  }
  return Array.from(anagrams.values())
}