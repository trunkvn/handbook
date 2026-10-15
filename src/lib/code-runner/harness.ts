// Test harness for the in-page code editor, kept as a plain string so it can run inside a Web Worker
// (and in Node, for verifying the exercises). It has no imports and must stay self-contained.
//
// `__run({ code, tests })` evaluates the user's code and the exercise's test script in one scope,
// so tests can refer to the user's functions and classes by name.
//
// Helpers available to both the user's code and the tests:
//   test(name, fn)          register a test (fn may be async)
//   eq(actual, expected)    deep equality, throws a readable error otherwise
//   same(actual, expected)  like eq, but ignores array order (nested too)
//   cases(fn, rows, how?)   rows of [args, expected]; how = "same" compares unordered
//   wait(ms)                promise that resolves after ms
//   ListNode, list(arr), toArray(head)   linked lists
//   TreeNode, tree(levelOrderArr)        binary trees (LeetCode level-order with nulls)
export const HARNESS = String.raw`
async function __run(input) {
  var logs = [];
  var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  var TEST_TIMEOUT = 2000;

  function show(v, seen) {
    seen = seen || [];
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v === "function") return "[Function " + (v.name || "anonymous") + "]";
    if (typeof v === "bigint") return v + "n";
    if (v === undefined) return "undefined";
    if (typeof v === "symbol") return String(v);
    if (v === null || typeof v !== "object") return Object.is(v, -0) ? "-0" : String(v);
    if (seen.indexOf(v) !== -1) return "[Circular]";
    seen = seen.concat([v]);
    var each = function (x) { return show(x, seen); };
    if (v instanceof Date) return isNaN(v) ? "Invalid Date" : "Date(" + v.toISOString() + ")";
    if (v instanceof RegExp) return String(v);
    if (v instanceof Error) return v.name + ": " + v.message;
    if (v instanceof Map) return "Map(" + v.size + ") {" + Array.from(v).map(function (e) { return each(e[0]) + " => " + each(e[1]); }).join(", ") + "}";
    if (v instanceof Set) return "Set(" + v.size + ") {" + Array.from(v).map(each).join(", ") + "}";
    if (Array.isArray(v)) return "[" + v.map(each).join(", ") + "]";
    var name = v.constructor && v.constructor.name && v.constructor.name !== "Object" ? v.constructor.name + " " : "";
    return name + "{" + Object.keys(v).map(function (k) { return k + ": " + each(v[k]); }).join(", ") + "}";
  }
  function short(v) {
    var s = show(v);
    return s.length > 240 ? s.slice(0, 240) + "…" : s;
  }

  function deepEq(a, b, depth) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number") return a !== a && b !== b;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if ((depth || 0) > 200) throw new Error("Cấu trúc lồng quá sâu hoặc có vòng tham chiếu khi so sánh");
    depth = (depth || 0) + 1;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
    if (a instanceof RegExp || b instanceof RegExp) return String(a) === String(b);
    if (a instanceof Map || b instanceof Map) {
      if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
      return Array.from(a).every(function (e) { return b.has(e[0]) && deepEq(e[1], b.get(e[0]), depth); });
    }
    if (a instanceof Set || b instanceof Set) {
      if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
      return Array.from(a).every(function (x) { return Array.from(b).some(function (y) { return deepEq(x, y, depth); }); });
    }
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return Object.prototype.hasOwnProperty.call(b, k) && deepEq(a[k], b[k], depth); });
  }

  function eq(actual, expected, message) {
    if (!deepEq(actual, expected)) {
      throw new Error((message ? message + "\n" : "") + "Kỳ vọng: " + short(expected) + "\nNhận được: " + short(actual));
    }
  }

  function canon(v) {
    if (!Array.isArray(v)) return v;
    return v.map(canon).sort(function (x, y) {
      var a = JSON.stringify(x), b = JSON.stringify(y);
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }
  function same(actual, expected, message) {
    eq(canon(actual), canon(expected), message);
  }

  var tasks = [];
  function test(name, fn) {
    tasks.push({ name: name, fn: fn });
  }
  function cases(fn, rows, how) {
    rows.forEach(function (row) {
      var args = row[0], expected = row[1];
      var label = (fn && fn.name ? fn.name : "fn") + "(" + args.map(short).join(", ") + ")";
      test(label, function () {
        return Promise.resolve(fn.apply(null, structuredClone(args))).then(function (actual) {
          (how === "same" ? same : eq)(actual, expected);
        });
      });
    });
  }
  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function ListNode(val, next) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
  function list(arr) {
    var head = null;
    for (var i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
    return head;
  }
  function toArray(head) {
    var out = [];
    for (var n = head; n; n = n.next) {
      out.push(n.val);
      if (out.length > 10000) throw new Error("Danh sách có vòng hoặc quá dài");
    }
    return out;
  }
  function TreeNode(val, left, right) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
  function tree(arr) {
    if (!arr.length || arr[0] === null) return null;
    var root = new TreeNode(arr[0]);
    var queue = [root];
    var i = 1;
    while (queue.length && i < arr.length) {
      var node = queue.shift();
      if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
      i++;
      if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
      i++;
    }
    return root;
  }

  function line(level) {
    return function () {
      logs.push({ level: level, text: Array.prototype.map.call(arguments, function (a) { return typeof a === "string" ? a : show(a); }).join(" ") });
    };
  }
  var sandboxConsole = { log: line("log"), info: line("log"), debug: line("log"), warn: line("warn"), error: line("error") };

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error("Quá " + ms + "ms: hàm chạy quá lâu hoặc promise không bao giờ resolve"));
      }, ms);
      promise.then(
        function (v) { clearTimeout(timer); resolve(v); },
        function (e) { clearTimeout(timer); reject(e); }
      );
    });
  }

  var run;
  try {
    run = new AsyncFunction(
      "console", "test", "eq", "same", "cases", "wait", "ListNode", "list", "toArray", "TreeNode", "tree",
      '"use strict";\n{\n' + input.code + "\n;\n" + input.tests + "\n}"
    );
  } catch (e) {
    return { status: "error", phase: "syntax", message: String((e && e.message) || e), logs: logs };
  }
  try {
    await run(sandboxConsole, test, eq, same, cases, wait, ListNode, list, toArray, TreeNode, tree);
  } catch (e) {
    return { status: "error", phase: "runtime", message: e && e.name && e.message ? e.name + ": " + e.message : String(e), logs: logs };
  }

  var results = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var start = Date.now();
    try {
      await withTimeout(Promise.resolve().then(t.fn), TEST_TIMEOUT);
      results.push({ name: t.name, pass: true, ms: Date.now() - start });
    } catch (e) {
      results.push({ name: t.name, pass: false, message: e && e.name && e.name !== "Error" ? e.name + ": " + e.message : String((e && e.message) || e), ms: Date.now() - start });
    }
  }
  return { status: "ok", results: results, logs: logs };
}
`;

export const WORKER_SOURCE =
  HARNESS +
  String.raw`
self.onmessage = function (e) {
  __run(e.data).then(
    function (result) { self.postMessage(result); },
    function (err) { self.postMessage({ status: "error", phase: "runtime", message: String((err && err.message) || err), logs: [] }); }
  );
};
`;
