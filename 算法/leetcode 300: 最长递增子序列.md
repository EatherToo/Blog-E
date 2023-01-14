#### leetcode 300: 最长递增子序列

1. 方法一：动态规划

   ```js
   const lengthOfLIS = function (nums) {
     const maxCache = []
     // 以nums[position]结尾的递增子序列 的 长度
     function lengthOfLISPosition(position) {
       if (maxCache[position]) return maxCache[position]
       const num = nums[position]
       // 如果nums[position]前面所有的数都大于nums[position]，那么nums[position]结尾的递增子序列就是他自己
       let max = 1

       for (let i = 0; i < position; i++) {
         // 如果num > nums[i], 那么意味着以nums[i]结尾的递增子序列后面又可以在添加一个子元素了
         if (num > nums[i]) {
           // 所以末尾两个元素是nums[i], nums[position]的递增子序列长度是这个
           const newMax = maxCache[i] + 1
           // 和之前的比较一下
           max = newMax > max ? newMax : max
         }
       }
       maxCache[position] = max
       return max
     }
     let max = 1
     for (let i = 0; i < nums.length; i++) {
       maxCache[i] = lengthOfLISPosition(i)
       if (max < maxCache[i]) {
         max = maxCache[i]
       }
     }
     return max
   }
   ```

2. 方法二： 贪心

   ```js
   const lengthOfLIS = function (nums) {
     /**
      * 维护一个数组
      * 数组的索引是子序列的长度
      * 数组的值是对应长度的子序列末尾元素的最小值
      * 假设数组索引为i，则 lensArr[i] 为所有长度为i的子序列当中，末尾元素最小的那个子序列的末尾元素
      * 初始状态下lensArr[1] = nums[0]
      */
     const lensArr = [-Infinity, nums[0]]
     let len = 1

     for (let i = 1; i < nums.length; i++) {
       // 如果nums[i] 大于长度为len的子序列的最小末尾值
       // 那么很显然，可以把nums[i]放在这个子序列的末尾得到一个长度更长的子序列
       if (nums[i] > lensArr[len]) {
         // 所以len要加一
         len++
         // 加完之后就先假定lensArrlen] = nums[i]
         lensArr[len] = nums[i]
       } else {
         // 如果nums[i] < dlensArr[len]
         // 那么nums[i]肯定会是某个小于等于len长度的子序列的最小末尾元素
         // 在论证这个之前，要先论证一下d这个数组肯定是一个单调递增数组
         // 反证法：
         // 假如存在 0 < j < i <= len 使得lensArr[j] > lensArray[i]
         // 那么对于长度为 i 且以lensArr[i]结尾的子序列来说，可以将末尾的i-j个元素都去掉
         // 这样就得到了一个长度为j的子序列，且这个子序列的末尾元素一定小于 lensArray[i]
         // 则这个子序列的末尾元素就可以替代lensArr[j]了
         // 所以一定不存在 0 < j < i <= len 使得lensArr[j] > lensArray[i]
         // 即lensArr一定是单调递增的

         // 论证：nums[i]一定会是某个小于等于len长度的子序列的最小末尾元素
         // 因为nums[i] < lensArr[len]
         // 所以一定存在 0 < j < len 使得 lensArr[j] < nums[i] < lensArr[j + 1]
         // 那么对于长度为j且以lensArr[j]为末尾的子序列来说，可以把nums[i]放到它的末尾
         // 得到一个长度为j + 1的子序列，又因为nums[i] < lensArr[j + 1]，那么lensArr[j + 1]就需要被替换为nums[i]了

         // 因为lensArr是单调递增的，所以这里可以把线性查找改为二分查找，复杂度降为O(nlogn)
         for (let j = 0; j < len; j++) {
           if (lensArr[j] < nums[i] && lensArr[j + 1] > nums[i]) {
             lensArr[j + 1] = nums[i]
           }
         }
       }
     }
     return len
   }
   ```
