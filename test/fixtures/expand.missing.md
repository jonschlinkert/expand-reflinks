This is random text in a file.

> foo

This is a sentence with a reflink [bar] inside.

**Bar**

__baz_ qux

[foo]
[github]
[foo]: [github]
[assemble]: [github]assemble/
[github]: [bar]
[bar]: [baz]
[qux]: https://github.com/[zzz] "this is a sentence with a [bracket] inside"
[qxx]: https://github.com/[zzz]
[baz]: https://github.com/ "this is a another sentence with a [bracket] inside"