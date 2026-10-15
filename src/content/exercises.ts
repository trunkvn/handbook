// Coding exercises attached to questions, keyed by question id.
// `tests` runs in the same scope as the user's code (see src/lib/code-runner/harness.ts for the helpers).

export interface Exercise {
  /** Code the editor starts with. */
  starter: string;
  /** Test script: refers to the user's functions/classes by name. */
  tests: string;
}

export const exercises: Record<string, Exercise> = {
  /* ---------- Viết code tay ---------- */

  q37: {
    starter: `function debounce(fn, wait) {
  // Trả về hàm mới: chỉ gọi fn sau khi không có lần gọi nào trong \`wait\` ms.
  // Gợi ý: timer sống trong closure, giữ đúng this + đối số, thêm .cancel()
}
`,
    tests: `
test("chỉ gọi một lần sau khi ngừng gọi, với đối số của lần cuối", async () => {
  const calls = [];
  const d = debounce((x) => calls.push(x), 40);
  d(1); d(2); d(3);
  eq(calls.length, 0, "chưa được gọi ngay lập tức");
  await wait(100);
  eq(calls, [3]);
});

test("mỗi lần gọi đặt lại bộ đếm", async () => {
  const calls = [];
  const d = debounce(() => calls.push(1), 60);
  d(); await wait(40);
  d(); await wait(40);
  eq(calls.length, 0, "đã gọi sớm dù vẫn đang có lần gọi mới");
  await wait(60);
  eq(calls.length, 1);
});

test("giữ đúng this và nhiều đối số", async () => {
  const obj = { v: 7, run: debounce(function (a, b) { this.out = this.v + a + b; }, 20) };
  obj.run(1, 2);
  await wait(60);
  eq(obj.out, 10);
});

test("có .cancel() để huỷ lần gọi đang chờ", async () => {
  const calls = [];
  const d = debounce(() => calls.push(1), 20);
  d();
  d.cancel();
  await wait(60);
  eq(calls.length, 0);
});
`,
  },

  q38: {
    starter: `function throttle(fn, wait) {
  // Chạy ngay lần gọi đầu (leading), trong khoảng \`wait\` ms chỉ nhớ lần gọi cuối
  // và chạy nó khi hết khoảng (trailing).
}
`,
    tests: `
test("chạy ngay lần gọi đầu tiên (leading)", () => {
  const calls = [];
  const t = throttle((x) => calls.push(x), 50);
  t(1);
  eq(calls, [1]);
});

test("bỏ qua các lần gọi trong khoảng wait nhưng vẫn chạy lần gọi cuối (trailing)", async () => {
  const calls = [];
  const t = throttle((x) => calls.push(x), 60);
  t(1); t(2); t(3);
  eq(calls, [1], "chỉ lần đầu chạy ngay");
  await wait(130);
  eq(calls, [1, 3], "lần gọi cuối phải chạy khi hết khoảng wait");
});

test("gọi lại được sau khi đã qua khoảng wait", async () => {
  const calls = [];
  const t = throttle((x) => calls.push(x), 40);
  t(1);
  await wait(80);
  t(2);
  eq(calls, [1, 2]);
});

test("không chạy quá nhiều lần khi gọi liên tục", async () => {
  let n = 0;
  const t = throttle(() => n++, 50);
  const end = Date.now() + 160;
  while (Date.now() < end) { t(); await wait(5); }
  await wait(80);
  eq(n <= 5 && n >= 2, true, "đã chạy " + n + " lần trong ~160ms với wait 50ms");
});

test("giữ đúng this", () => {
  const o = { v: 5, f: throttle(function () { this.r = this.v; }, 10) };
  o.f();
  eq(o.r, 5);
});
`,
  },

  q39: {
    starter: `function deepClone(value) {
  // Sao chép sâu object/mảng, xử lý Date, RegExp, Map, Set và vòng tham chiếu.
  // Gợi ý: dùng WeakMap để nhớ object đã clone.
}
`,
    tests: `
test("clone object và mảng lồng nhau, độc lập với bản gốc", () => {
  const src = { a: 1, b: { c: [1, 2, { d: 3 }] } };
  const c = deepClone(src);
  eq(c, src);
  eq(c !== src && c.b !== src.b && c.b.c !== src.b.c && c.b.c[2] !== src.b.c[2], true, "phải tạo object mới ở mọi tầng");
  c.b.c[2].d = 99;
  eq(src.b.c[2].d, 3, "sửa bản sao không được ảnh hưởng bản gốc");
});

test("giá trị nguyên thủy trả về nguyên vẹn", () => {
  eq(deepClone(5), 5);
  eq(deepClone("x"), "x");
  eq(deepClone(null), null);
  eq(deepClone(undefined), undefined);
});

test("Date và RegExp", () => {
  const d = new Date(0);
  const r = /ab+c/gi;
  const c = deepClone({ d, r });
  eq(c.d instanceof Date && c.d !== d && c.d.getTime() === 0, true, "Date phải là một Date mới");
  eq(c.r instanceof RegExp && c.r !== r && c.r.source === "ab+c" && c.r.flags === "gi", true, "RegExp phải là một RegExp mới");
});

test("Map và Set", () => {
  const m = new Map([["k", { x: 1 }]]);
  const s = new Set([{ y: 2 }]);
  const c = deepClone({ m, s });
  eq(c.m instanceof Map && c.m !== m && c.m.get("k") !== m.get("k") && c.m.get("k").x === 1, true, "Map");
  eq(c.s instanceof Set && c.s !== s && [...c.s][0] !== [...s][0] && [...c.s][0].y === 2, true, "Set");
});

test("vòng tham chiếu không làm lặp vô hạn", () => {
  const a = { name: "a" };
  a.self = a;
  const c = deepClone(a);
  eq(c !== a, true);
  eq(c.name, "a");
  eq(c.self === c, true, "self của bản sao phải trỏ về chính bản sao");
});

test("cùng một object được tham chiếu hai lần vẫn chỉ clone một lần", () => {
  const shared = { n: 1 };
  const c = deepClone({ x: shared, y: shared });
  eq(c.x === c.y && c.x !== shared, true);
});
`,
  },

  q40: {
    starter: `function promiseAll(iterable) {
  // Trả về Promise: resolve mảng kết quả theo đúng thứ tự đầu vào,
  // hoặc reject ngay khi có một promise lỗi.
}
`,
    tests: `
test("giữ đúng thứ tự dù các promise xong không theo thứ tự", async () => {
  const r = await promiseAll([wait(40).then(() => "a"), "b", Promise.resolve("c")]);
  eq(r, ["a", "b", "c"]);
});

test("reject ngay khi có một promise lỗi", async () => {
  let err;
  const start = Date.now();
  try {
    await promiseAll([wait(300).then(() => 1), Promise.reject(new Error("boom"))]);
  } catch (e) { err = e; }
  eq(err && err.message, "boom");
  eq(Date.now() - start < 200, true, "phải reject ngay, không đợi các promise còn lại");
});

test("mảng rỗng resolve ngay thành []", async () => {
  eq(await promiseAll([]), []);
});

test("nhận được iterable bất kỳ, ví dụ Set", async () => {
  eq(await promiseAll(new Set([1, 2, 3])), [1, 2, 3]);
});

test("kết quả là một Promise", () => {
  eq(promiseAll([1]) instanceof Promise, true);
});
`,
  },

  q73: {
    starter: `function memoize(fn) {
  // Cache kết quả theo đối số: gọi lại với cùng đối số thì trả từ cache.
}
`,
    tests: `
test("chỉ tính một lần với cùng đối số", () => {
  let n = 0;
  const f = memoize((x) => { n++; return x * 2; });
  eq(f(2), 4);
  eq(f(2), 4);
  eq(n, 1, "hàm gốc bị gọi " + n + " lần");
});

test("đối số khác nhau được tính riêng", () => {
  let n = 0;
  const f = memoize((x) => { n++; return x + 1; });
  eq([f(1), f(2), f(1)], [2, 3, 2]);
  eq(n, 2);
});

test("nhiều đối số", () => {
  let n = 0;
  const f = memoize((a, b) => { n++; return a + b; });
  f(1, 2); f(1, 2); f(2, 1);
  eq(n, 2);
});

test("cache cả kết quả undefined", () => {
  let n = 0;
  const f = memoize(() => { n++; });
  f(); f();
  eq(n, 1, "kết quả undefined cũng phải được cache (dùng has thay vì kiểm tra truthy)");
});

test("giữ đúng this", () => {
  const o = { k: 3, f: memoize(function (x) { return this.k * x; }) };
  eq(o.f(2), 6);
});
`,
  },

  q74: {
    starter: `class EventEmitter {
  on(event, handler) {
    // đăng ký handler; trả về hàm huỷ đăng ký là một điểm cộng
  }

  off(event, handler) {}

  once(event, handler) {}

  emit(event, ...args) {}
}
`,
    tests: `
test("on + emit truyền đối số cho handler", () => {
  const e = new EventEmitter();
  const got = [];
  e.on("a", (x, y) => got.push([x, y]));
  e.emit("a", 1, 2);
  eq(got, [[1, 2]]);
});

test("nhiều handler được gọi theo thứ tự đăng ký", () => {
  const e = new EventEmitter();
  const order = [];
  e.on("a", () => order.push(1));
  e.on("a", () => order.push(2));
  e.emit("a");
  eq(order, [1, 2]);
});

test("chỉ gọi handler của đúng sự kiện", () => {
  const e = new EventEmitter();
  let n = 0;
  e.on("a", () => n++);
  e.emit("b");
  eq(n, 0, "emit('b') không được gọi handler của 'a'");
  e.emit("a");
  eq(n, 1);
});

test("off gỡ handler", () => {
  const e = new EventEmitter();
  let n = 0;
  const h = () => n++;
  e.on("a", h);
  e.emit("a");
  eq(n, 1);
  e.off("a", h);
  e.emit("a");
  eq(n, 1, "handler đã off vẫn bị gọi");
});

test("once chỉ chạy đúng một lần", () => {
  const e = new EventEmitter();
  const got = [];
  e.once("a", (x) => got.push(x));
  e.emit("a", 1);
  e.emit("a", 2);
  eq(got, [1]);
});

test("không lỗi khi off/emit sự kiện chưa từng đăng ký", () => {
  const e = new EventEmitter();
  e.off("nope", () => {});
  e.emit("nope", 1);
});

test("handler tự gỡ mình khi đang emit không làm bỏ sót handler sau nó", () => {
  const e = new EventEmitter();
  const order = [];
  const a = () => { order.push("a"); e.off("x", a); };
  const b = () => order.push("b");
  e.on("x", a);
  e.on("x", b);
  e.emit("x");
  eq(order, ["a", "b"], "gợi ý: lặp trên bản sao của danh sách handler");
});
`,
  },

  q93: {
    starter: `function flat(arr, depth = 1) {
  // Làm phẳng mảng lồng nhau tới độ sâu \`depth\`, không sửa mảng gốc.
}
`,
    tests: `
cases(flat, [
  [[[1, [2, [3, [4]]]]], [1, 2, [3, [4]]]],
  [[[1, [2, [3, [4]]]], 1], [1, 2, [3, [4]]]],
  [[[1, [2, [3, [4]]]], 2], [1, 2, 3, [4]]],
  [[[1, [2, [3, [4]]]], Infinity], [1, 2, 3, 4]],
  [[[1, [2, [3, [4]]]], 0], [1, [2, [3, [4]]]]],
  [[[]], []],
  [[[[], [[]]], Infinity], []],
  [[[1, 2, 3]], [1, 2, 3]],
]);

test("không sửa mảng gốc", () => {
  const a = [1, [2, [3]]];
  eq(flat(a, Infinity), [1, 2, 3]);
  eq(a, [1, [2, [3]]], "mảng gốc bị sửa");
});
`,
  },

  q94: {
    starter: `function deepEqual(a, b) {
  // So sánh sâu hai giá trị kiểu JSON (object, mảng, số, chuỗi, boolean, null).
}
`,
    tests: `
cases(deepEqual, [
  [[{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }], true],
  [[[1, 2], { 0: 1, 1: 2 }], false],
  [[1, 1], true],
  [[1, 2], false],
  [["a", "a"], true],
  [[null, null], true],
  [[null, {}], false],
  [[{}, null], false],
  [[{ a: 1 }, { a: 1, b: 2 }], false],
  [[{ a: undefined }, { b: 1 }], false],
  [[{ a: 1, b: 2 }, { b: 2, a: 1 }], true],
  [[{ a: [1, 2], b: { c: 3 } }, { b: { c: 3 }, a: [1, 2] }], true],
  [[[1, 2, 3], [1, 2, 3]], true],
  [[[1, 2, 3], [1, 2, 4]], false],
  [[[1, 2], [1, 2, 3]], false],
  [[{ a: { b: { c: [1] } } }, { a: { b: { c: [1] } } }], true],
  [[{ a: { b: { c: [1] } } }, { a: { b: { c: [2] } } }], false],
]);
`,
  },

  /* ---------- LeetCode ---------- */

  q44: {
    starter: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {

}
`,
    tests: `
cases(containsDuplicate, [
  [[[1, 2, 3, 1]], true],
  [[[1, 2, 3, 4]], false],
  [[[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], true],
  [[[]], false],
  [[[7]], false],
]);
`,
  },

  q45: {
    starter: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}  chỉ số của hai số có tổng bằng target
 */
function twoSum(nums, target) {

}
`,
    tests: `
cases(twoSum, [
  [[[2, 7, 11, 15], 9], [0, 1]],
  [[[3, 2, 4], 6], [1, 2]],
  [[[3, 3], 6], [0, 1]],
  [[[-1, -2, -3, -4, -5], -8], [2, 4]],
  [[[0, 4, 3, 0], 0], [0, 3]],
], "same");
`,
  },

  q46: {
    starter: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {

}
`,
    tests: `
cases(isAnagram, [
  [["anagram", "nagaram"], true],
  [["rat", "car"], false],
  [["a", "ab"], false],
  [["aab", "abb"], false],
  [["", ""], true],
  [["listen", "silent"], true],
]);
`,
  },

  q47: {
    starter: `/**
 * @param {string[]} strs
 * @return {string[][]}  thứ tự các nhóm và thứ tự trong nhóm đều không quan trọng
 */
function groupAnagrams(strs) {

}
`,
    tests: `
cases(groupAnagrams, [
  [[["eat", "tea", "tan", "ate", "nat", "bat"]], [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]],
  [[[""]], [[""]]],
  [[["a"]], [["a"]]],
  [[["ab", "ba", "abc", "cab", "x"]], [["ab", "ba"], ["abc", "cab"], ["x"]]],
  [[[]], []],
], "same");
`,
  },

  q48: {
    starter: `/**
 * @param {number[]} nums
 * @return {number[]}  answer[i] = tích của mọi phần tử trừ nums[i], không dùng phép chia
 */
function productExceptSelf(nums) {

}
`,
    tests: `
cases(productExceptSelf, [
  [[[1, 2, 3, 4]], [24, 12, 8, 6]],
  [[[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]],
  [[[2, 3]], [3, 2]],
  [[[0, 0]], [0, 0]],
  [[[1, 1, 1]], [1, 1, 1]],
]);

test("không dùng phép chia: chạy được khi có số 0", () => {
  eq(productExceptSelf([4, 0, 5]), [0, 20, 0]);
});
`,
  },

  q60: {
    starter: `/**
 * @param {string} s
 * @return {boolean}  bỏ qua hoa/thường và ký tự không phải chữ/số
 */
function isPalindrome(s) {

}
`,
    tests: `
cases(isPalindrome, [
  [["A man, a plan, a canal: Panama"], true],
  [["race a car"], false],
  [[" "], true],
  [[""], true],
  [["0P"], false],
  [[".,"], true],
  [["ab_a"], true],
  [["Was it a car or a cat I saw?"], true],
]);
`,
  },

  q61: {
    starter: `/**
 * @param {string} s
 * @return {number}  độ dài chuỗi con dài nhất không có ký tự lặp
 */
function lengthOfLongestSubstring(s) {

}
`,
    tests: `
cases(lengthOfLongestSubstring, [
  [["abcabcbb"], 3],
  [["bbbbb"], 1],
  [["pwwkew"], 3],
  [[""], 0],
  [[" "], 1],
  [["abba"], 2],
  [["dvdf"], 3],
  [["tmmzuxt"], 5],
]);
`,
  },

  q62: {
    starter: `/**
 * @param {number[]} height
 * @return {number}  diện tích lớn nhất giữa hai đường thẳng
 */
function maxArea(height) {

}
`,
    tests: `
cases(maxArea, [
  [[[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49],
  [[[1, 1]], 1],
  [[[4, 3, 2, 1, 4]], 16],
  [[[1, 2, 1]], 2],
  [[[2, 3, 4, 5, 18, 17, 6]], 17],
]);

test("đủ nhanh với 100.000 phần tử (cần O(n), không phải O(n²))", () => {
  const h = Array.from({ length: 100000 }, (_, i) => (i % 100) + 1);
  const start = Date.now();
  const area = maxArea(h);
  eq(area, 9990000);
  eq(Date.now() - start < 500, true, "mất " + (Date.now() - start) + "ms");
});
`,
  },

  q63: {
    starter: `/**
 * @param {number[]} nums
 * @return {number[][]}  mọi bộ ba duy nhất có tổng bằng 0
 */
function threeSum(nums) {

}
`,
    tests: `
cases(threeSum, [
  [[[-1, 0, 1, 2, -1, -4]], [[-1, -1, 2], [-1, 0, 1]]],
  [[[0, 1, 1]], []],
  [[[0, 0, 0]], [[0, 0, 0]]],
  [[[0, 0, 0, 0]], [[0, 0, 0]]],
  [[[-2, 0, 1, 1, 2]], [[-2, 0, 2], [-2, 1, 1]]],
  [[[]], []],
  [[[-1, -1, -1, 2, 2]], [[-1, -1, 2]]],
], "same");
`,
  },

  q75: {
    starter: `/**
 * @param {string} s  chỉ gồm ()[]{}
 * @return {boolean}
 */
function isValid(s) {

}
`,
    tests: `
cases(isValid, [
  [["()"], true],
  [["()[]{}"], true],
  [["(]"], false],
  [["([)]"], false],
  [["{[]}"], true],
  [["("], false],
  [[")"], false],
  [[""], true],
  [["(("], false],
]);
`,
  },

  q76: {
    starter: `class MinStack {
  push(val) {}

  pop() {}

  top() {}

  getMin() {}
}
`,
    tests: `
test("ví dụ của LeetCode", () => {
  const s = new MinStack();
  s.push(-2); s.push(0); s.push(-3);
  eq(s.getMin(), -3);
  s.pop();
  eq(s.top(), 0);
  eq(s.getMin(), -2, "sau khi pop, min phải quay về giá trị trước đó");
});

test("giá trị nhỏ nhất trùng lặp", () => {
  const s = new MinStack();
  s.push(1); s.push(1);
  s.pop();
  eq(s.getMin(), 1, "vẫn còn một số 1 trong stack");
});

test("min thay đổi theo từng bước", () => {
  const s = new MinStack();
  const mins = [];
  [5, 3, 7, 3, 1].forEach((v) => { s.push(v); mins.push(s.getMin()); });
  eq(mins, [5, 3, 3, 3, 1]);
  const back = [];
  for (let i = 0; i < 4; i++) { s.pop(); back.push(s.getMin()); }
  eq(back, [3, 3, 3, 5]);
});

test("thao tác O(1): 100.000 lần push/getMin vẫn nhanh", () => {
  const s = new MinStack();
  const start = Date.now();
  for (let i = 0; i < 100000; i++) { s.push(100000 - i); s.getMin(); }
  eq(s.getMin(), 1);
  eq(Date.now() - start < 500, true, "mất " + (Date.now() - start) + "ms");
});
`,
  },

  q77: {
    starter: `/**
 * @param {number[]} nums  đã sắp xếp tăng dần
 * @param {number} target
 * @return {number}  chỉ số của target hoặc -1
 */
function search(nums, target) {

}
`,
    tests: `
cases(search, [
  [[[-1, 0, 3, 5, 9, 12], 9], 4],
  [[[-1, 0, 3, 5, 9, 12], 2], -1],
  [[[5], 5], 0],
  [[[5], -5], -1],
  [[[], 1], -1],
  [[[1, 3, 5, 7, 9, 11], 1], 0],
  [[[1, 3, 5, 7, 9, 11], 11], 5],
  [[[1, 3, 5, 7, 9, 11], 7], 3],
]);

test("chỉ đọc O(log n) phần tử của mảng (không quét tuần tự)", () => {
  const N = 1e6;
  let reads = 0;
  const base = Object.create(Array.prototype);
  base.length = N;
  const nums = new Proxy(base, {
    get(target, key) {
      if (typeof key === "string" && key !== "length" && !isNaN(key)) {
        if (++reads > 60) throw new Error("Đọc quá nhiều phần tử của mảng: cần O(log n), không quét tuần tự");
        return Number(key) * 2;
      }
      return target[key];
    },
  });
  eq(search(nums, 2 * 777777), 777777);
});
`,
  },

  q78: {
    starter: `/**
 * @param {number[]} nums  mảng tăng dần đã bị xoay tại một điểm, không có phần tử trùng
 * @param {number} target
 * @return {number}  chỉ số của target hoặc -1, trong O(log n)
 */
function search(nums, target) {

}
`,
    tests: `
cases(search, [
  [[[4, 5, 6, 7, 0, 1, 2], 0], 4],
  [[[4, 5, 6, 7, 0, 1, 2], 3], -1],
  [[[1], 0], -1],
  [[[1], 1], 0],
  [[[3, 1], 1], 1],
  [[[3, 1], 3], 0],
  [[[5, 1, 3], 5], 0],
  [[[5, 1, 3], 3], 2],
  [[[4, 5, 6, 7, 0, 1, 2], 4], 0],
  [[[4, 5, 6, 7, 0, 1, 2], 2], 6],
  [[[1, 3], 3], 1],
  [[[1, 2, 3, 4, 5], 4], 3],
]);
`,
  },

  q95: {
    starter: `// Có sẵn: ListNode, list([1, 2, 3]) để tạo danh sách, toArray(head) để in ra mảng.
/**
 * @param {ListNode | null} head
 * @return {ListNode | null}
 */
function reverseList(head) {

}
`,
    tests: `
test("đảo ngược danh sách 5 phần tử", () => {
  eq(toArray(reverseList(list([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);
});

test("hai phần tử", () => {
  eq(toArray(reverseList(list([1, 2]))), [2, 1]);
});

test("một phần tử", () => {
  eq(toArray(reverseList(list([7]))), [7]);
});

test("danh sách rỗng trả về null", () => {
  eq(reverseList(null), null);
});

test("danh sách dài 5.000 phần tử", () => {
  const arr = Array.from({ length: 5000 }, (_, i) => i);
  eq(toArray(reverseList(list(arr))), arr.slice().reverse());
});
`,
  },

  q96: {
    starter: `// Có sẵn: ListNode, list([1, 2, 3]) để tạo danh sách, toArray(head) để in ra mảng.
/**
 * @param {ListNode | null} a
 * @param {ListNode | null} b
 * @return {ListNode | null}
 */
function mergeTwoLists(a, b) {

}
`,
    tests: `
cases((a, b) => {
  const merged = mergeTwoLists(list(a), list(b));
  if (merged === undefined) throw new Error("Hàm chưa trả về gì (undefined). Danh sách rỗng phải là null.");
  return toArray(merged);
}, [
  [[[1, 2, 4], [1, 3, 4]], [1, 1, 2, 3, 4, 4]],
  [[[], []], []],
  [[[], [0]], [0]],
  [[[0], []], [0]],
  [[[5], [1, 2, 3]], [1, 2, 3, 5]],
  [[[1, 1, 1], [1, 1]], [1, 1, 1, 1, 1]],
  [[[-3, 0, 9], [-5, -4, 10, 11]], [-5, -4, -3, 0, 9, 10, 11]],
]);
`,
  },

  q97: {
    starter: `// Có sẵn: TreeNode, tree([3, 9, 20, null, null, 15, 7]) để dựng cây theo từng tầng.
/**
 * @param {TreeNode | null} root
 * @return {number}
 */
function maxDepth(root) {

}
`,
    tests: `
cases((arr) => maxDepth(tree(arr)), [
  [[[3, 9, 20, null, null, 15, 7]], 3],
  [[[1, null, 2]], 2],
  [[[]], 0],
  [[[1]], 1],
  [[[1, 2, 3, 4, null, null, 5, 6]], 4],
]);

test("cây lệch 1.000 tầng", () => {
  let root = null;
  for (let i = 0; i < 1000; i++) root = new TreeNode(i, root, null);
  eq(maxDepth(root), 1000);
});
`,
  },

  q98: {
    starter: `// Có sẵn: TreeNode, tree([3, 9, 20, null, null, 15, 7]) để dựng cây theo từng tầng.
/**
 * @param {TreeNode | null} root
 * @return {number[][]}  giá trị các node theo từng tầng
 */
function levelOrder(root) {

}
`,
    tests: `
cases((arr) => levelOrder(tree(arr)), [
  [[[3, 9, 20, null, null, 15, 7]], [[3], [9, 20], [15, 7]]],
  [[[1]], [[1]]],
  [[[]], []],
  [[[1, 2, 3, 4, 5, 6, 7]], [[1], [2, 3], [4, 5, 6, 7]]],
  [[[1, null, 2, null, 3]], [[1], [2], [3]]],
]);
`,
  },

  q99: {
    starter: `// Có sẵn: TreeNode, tree([5, 1, 4, null, null, 3, 6]) để dựng cây theo từng tầng.
/**
 * @param {TreeNode | null} root
 * @return {boolean}
 */
function isValidBST(root) {

}
`,
    tests: `
cases((arr) => isValidBST(tree(arr)), [
  [[[2, 1, 3]], true],
  [[[5, 1, 4, null, null, 3, 6]], false],
  [[[5, 4, 6, null, null, 3, 7]], false],
  [[[1, 1]], false],
  [[[2147483647]], true],
  [[[]], true],
  [[[0, -1]], true],
  [[[3, 1, 5, 0, 2, 4, 6]], true],
  [[[10, 5, 15, null, null, 6, 20]], false],
]);
`,
  },

  /* ---------- Testing & design system ---------- */

  q108: {
    starter: `// mockFn(impl?) trả về một hàm giả, giống jest.fn():
//   fn.mock.calls    mảng các mảng đối số của từng lần gọi
//   fn.mock.results  [{ type: 'return' | 'throw', value }] cho từng lần gọi
//   fn.mockImplementation(f), fn.mockReturnValue(v), fn.mockReturnValueOnce(v)
//                    (trả về chính fn để gọi nối)
//   fn.mockClear()   xóa calls/results nhưng giữ hành vi
function mockFn(impl) {

}
`,
    tests: `
test("ghi lại đối số của từng lần gọi", () => {
  const f = mockFn();
  f(1, 2);
  f("a");
  eq(f.mock.calls, [[1, 2], ["a"]]);
});

test("gọi implementation và trả về kết quả của nó", () => {
  const f = mockFn((a, b) => a + b);
  eq(f(2, 3), 5);
  eq(f.mock.results, [{ type: "return", value: 5 }]);
});

test("không có implementation thì trả về undefined", () => {
  const f = mockFn();
  eq(f(), undefined);
  eq(f.mock.results, [{ type: "return", value: undefined }]);
});

test("ghi lại lỗi và ném lại lỗi đó", () => {
  const f = mockFn(() => { throw new Error("boom"); });
  let err;
  try { f(); } catch (e) { err = e; }
  eq(err && err.message, "boom", "lỗi phải được ném lại cho code đang test");
  eq(f.mock.results.length, 1);
  eq(f.mock.results[0].type, "throw");
  eq(f.mock.results[0].value === err, true);
});

test("mockReturnValue trả về cùng một giá trị cho mọi lần gọi", () => {
  const f = mockFn();
  f.mockReturnValue(42);
  eq([f(), f(), f()], [42, 42, 42]);
});

test("mockImplementation thay đổi hành vi", () => {
  const f = mockFn(() => 1);
  f.mockImplementation((x) => x * 10);
  eq(f(4), 40);
});

test("các hàm mock trả về chính fn để gọi nối", () => {
  const f = mockFn();
  eq(f.mockReturnValue(1) === f, true, "mockReturnValue");
  eq(f.mockImplementation(() => 2) === f, true, "mockImplementation");
  eq(f.mockReturnValueOnce(3) === f, true, "mockReturnValueOnce");
});

test("mockReturnValueOnce được dùng theo thứ tự rồi quay lại mặc định", () => {
  const f = mockFn(() => "default");
  f.mockReturnValueOnce("a").mockReturnValueOnce("b");
  eq([f(), f(), f(), f()], ["a", "b", "default", "default"]);
});

test("mockClear xóa lịch sử nhưng giữ implementation", () => {
  const f = mockFn(() => 1);
  f(1); f(2);
  f.mockClear();
  eq(f.mock.calls, []);
  eq(f.mock.results, []);
  eq(f(), 1);
  eq(f.mock.calls, [[]]);
});

test("giữ đúng this khi dùng làm method", () => {
  const o = { v: 7, m: mockFn(function () { return this.v; }) };
  eq(o.m(), 7);
});
`,
  },

  q128: {
    starter: `// classNames('a', { b: true, c: false }, ['d', ['e']], null) => 'a b d e'
// Bỏ qua mọi giá trị falsy; chuỗi/số thêm trực tiếp; mảng lồng nhau; object lấy các key truthy.
function classNames(...args) {

}
`,
    tests: `
cases(classNames, [
  [["a", "b"], "a b"],
  [[], ""],
  [["a", null, undefined, false, 0, "", "b"], "a b"],
  [[{ a: true, b: false, c: 1, d: 0 }], "a c"],
  [[["a", ["b", "c"]], "d"], "a b c d"],
  [["btn", { "btn-primary": true, "btn-disabled": false }, ["x", ["y"]], null], "btn btn-primary x y"],
  [[1, 2], "1 2"],
  [[[]], ""],
  [[{}], ""],
  [[["", false]], ""],
]);

test("không để dư dấu cách khi có phần rỗng ở giữa", () => {
  eq(classNames("a", [], "", "b"), "a b");
});
`,
  },

  q129: {
    starter: `// resolveTokens({ color: { blue: { 500: '#2563eb' }, primary: '{color.blue.500}' }, border: '1px solid {color.primary}' })
//   => { 'color.blue.500': '#2563eb', 'color.primary': '#2563eb', border: '1px solid #2563eb' }
// Giá trị luôn là chuỗi (số được chuyển thành chuỗi).
// Tham chiếu không tồn tại: throw new Error('Unknown token: <tên>')
// Tham chiếu vòng:         throw new Error('Circular reference: a -> b -> a')
function resolveTokens(tokens) {

}
`,
    tests: `
function msgOf(fn) {
  try { fn(); } catch (e) { return e.message; }
  return null;
}

test("làm phẳng và resolve alias, kể cả alias nằm trong chuỗi dài hơn", () => {
  const tokens = {
    color: { blue: { 500: "#2563eb" }, primary: "{color.blue.500}" },
    border: "1px solid {color.primary}",
  };
  eq(resolveTokens(tokens), {
    "color.blue.500": "#2563eb",
    "color.primary": "#2563eb",
    border: "1px solid #2563eb",
  });
});

test("alias nhiều cấp", () => {
  eq(resolveTokens({ a: "{b}", b: "{c}", c: "x" }), { a: "x", b: "x", c: "x" });
});

test("alias trỏ tới token được khai báo sau nó", () => {
  eq(resolveTokens({ a: "{z}", z: "1" }), { a: "1", z: "1" });
});

test("nhiều alias trong một chuỗi", () => {
  eq(resolveTokens({ a: "1", b: "2", c: "{a}-{b}" }).c, "1-2");
});

test("số được chuyển thành chuỗi", () => {
  eq(resolveTokens({ space: { sm: 8 } }), { "space.sm": "8" });
});

test("không sửa object đầu vào", () => {
  const tokens = { a: "{b}", b: "x", n: { c: "{b}" } };
  const copy = JSON.parse(JSON.stringify(tokens));
  const out = resolveTokens(tokens);
  eq(out.a, "x");
  eq(tokens, copy, "object đầu vào bị sửa");
});

test("tham chiếu không tồn tại", () => {
  eq(msgOf(() => resolveTokens({ a: "{missing}" })), "Unknown token: missing");
});

test("vòng tham chiếu giữa hai token", () => {
  eq(msgOf(() => resolveTokens({ a: "{b}", b: "{a}" })), "Circular reference: a -> b -> a");
});

test("vòng tham chiếu qua ba token", () => {
  eq(msgOf(() => resolveTokens({ a: "{b}", b: "{c}", c: "{a}" })), "Circular reference: a -> b -> c -> a");
});

test("token tự tham chiếu chính nó", () => {
  eq(msgOf(() => resolveTokens({ a: "{a}" })), "Circular reference: a -> a");
});
`,
  },
};
