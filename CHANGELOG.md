# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.3.0 (2024-08-29)

### ⚠ BREAKING CHANGES

- The `(block)` node of the grammar is no longer visible.

- Standardize on lowercase `gap` everywhere. ([70b53e0](https://github.com/gap-system/tree-sitter-gap/commit/70b53e0cf7ac40d8501528d44a90257271179298))

### Features

- Add atomic statements and functions. ([e92c672](https://github.com/gap-system/tree-sitter-gap/commit/e92c6720ca7591382bcb053859979277faa2e3cd))
- Add folds queries ([cc8ede9](https://github.com/gap-system/tree-sitter-gap/commit/cc8ede92227470178fea81dcc388087006739c8f))
- Add highlighting support for newly added constructs ([e7de263](https://github.com/gap-system/tree-sitter-gap/commit/e7de26397c2ee29b94ac3052a342eab843244bef))
- Add more fields to grammar, inline and hide block node ([e2ba306](https://github.com/gap-system/tree-sitter-gap/commit/e2ba3060483f874e169b4e5c9135b14c66364183))
- Add new and improve existing highlight queries, update tests to match. ([c17ad64](https://github.com/gap-system/tree-sitter-gap/commit/c17ad645e2352f2011f99885a477e101d1cd6f9d))
- Add support for conversion markers in floats. ([dfb2a20](https://github.com/gap-system/tree-sitter-gap/commit/dfb2a2003950f8e13d27cef0fbe655deb7f85edd))
- Add support for fail boolean, improve highlighting. ([33c995b](https://github.com/gap-system/tree-sitter-gap/commit/33c995bff56bd202799fa200e4dd11c788ea9e86))
- Add support for leading period floats. ([e357819](https://github.com/gap-system/tree-sitter-gap/commit/e3578197b2bfccabb7c6d47dfe64794264595035))
- Add support for pragmas ([ae89ad9](https://github.com/gap-system/tree-sitter-gap/commit/ae89ad96a36997ad70b6d6c848af12904af36465))
- Add support for record-like constructs. ([1a3e4ac](https://github.com/gap-system/tree-sitter-gap/commit/1a3e4acb4f61c344f8185424eca30c11ee4b9ae0))
- Add tags queries and tests ([5399d5c](https://github.com/gap-system/tree-sitter-gap/commit/5399d5c8eb684e752e6b8dcf51e3ddbce879fafe))
- Add variables and record selectors. ([229bffb](https://github.com/gap-system/tree-sitter-gap/commit/229bffb562b416980b22b0b55f394967b1aeb87f))
- Allow calls immediately after function definition. ([2c1958e](https://github.com/gap-system/tree-sitter-gap/commit/2c1958ea3811fe9e07c7fc403f109e7df27ba1b9))
- Create external scanner stub. ([a535485](https://github.com/gap-system/tree-sitter-gap/commit/a5354856a528548cb1ca10e8b93a88048aabc09a))
- Extend line continuation support, implement booleans. ([592483d](https://github.com/gap-system/tree-sitter-gap/commit/592483d4368fe3bbcf6b30e99cd62a62377b6cb1))
- Implement help statements ([254dd7f](https://github.com/gap-system/tree-sitter-gap/commit/254dd7f77bf2575410573c3c7723d9ddd8a2e468))
- Implement quit statements ([d2c1de6](https://github.com/gap-system/tree-sitter-gap/commit/d2c1de604fd9e81566c868595e311002391eea04))
- Implement string external scanner. ([7b350cd](https://github.com/gap-system/tree-sitter-gap/commit/7b350cd31f4e58488e3d126e0b03de781e34ceaa))
- Improve identifiers, strings and characters. ([fc43939](https://github.com/gap-system/tree-sitter-gap/commit/fc4393991b3ade25edc3eafe09c605b8817db2cf))
- Improve local queries ([d1eb1a7](https://github.com/gap-system/tree-sitter-gap/commit/d1eb1a7c6f269bf045ff45841e881d3f0e1b98d4))
- Improve README and highlighting. ([57aa1e3](https://github.com/gap-system/tree-sitter-gap/commit/57aa1e3a1e7068eb948b04d9dd2f195729b9e9b4))
- Improve selectors and function calls. ([1aa6f87](https://github.com/gap-system/tree-sitter-gap/commit/1aa6f87f25825f78781747907a2fee854931ba6f))
- Initial float and multiline string implementation ([d72bc06](https://github.com/gap-system/tree-sitter-gap/commit/d72bc06f843ab368e98e42df67725332a5b11c36))
- Refactor line continuation regex function. ([9fcb7b4](https://github.com/gap-system/tree-sitter-gap/commit/9fcb7b428b052cd672cd259f1b261740d765c3c4))

### Bug Fixes

- Fix empty perm and function call conflict ([3da543f](https://github.com/gap-system/tree-sitter-gap/commit/3da543f2f614939e17585178b76813525201a7b7))
- Fix erroneous code in keyword highlight test file ([26dbe9f](https://github.com/gap-system/tree-sitter-gap/commit/26dbe9f3161cfda998f43874a2bba97c6fff7d4a))
- Fix errors in locals queries ([b0c1571](https://github.com/gap-system/tree-sitter-gap/commit/b0c15711da090e88f781a1f94459a0727a7c2489))
- Fix some issues with highlighting ([fe82cbe](https://github.com/gap-system/tree-sitter-gap/commit/fe82cbe924b476a858f2148de9eac73774f61a4c))
- Make sure tests compile grammar first ([453069c](https://github.com/gap-system/tree-sitter-gap/commit/453069c0ceff6ad4bdf4e61db61eae1ed53ddac9))
