Expands this:

```
[abc]: [bar]/abc/[foo]
[fez]: [qux]/fez
[qux]: [baz]/qux
[baz]: [bar]/baz
[bar]: [foo]/bar [foo]: 123
```

To this:

```
[abc]: 123/bar/abc/123
[fez]: 123/bar/baz/qux/fez
[qux]: 123/bar/baz/qux
[baz]: 123/bar/baz
[bar]: 123/bar\n
[foo]: 123
```

## Usage

```js
var expandReflinks = require('expand-reflinks');
console.log(expandReflinks('[bar]: [foo]/bar\n[foo]: 123'));
//=> '[bar]: 123/bar\n[foo]: 123'
```

