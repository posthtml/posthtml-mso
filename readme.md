<div align="center">
  <img width="150" height="150" title="PostHTML" src="https://posthtml.github.io/posthtml/logo.svg">
  <h1>Outlook Conditionals</h1>
  <p>Makes it easy to write Outlook conditionals in HTML emails</p>

  [![Version][npm-version-shield]][npm]
  [![License][license-shield]][license]
  [![Build][travis-ci-shield]][travis-ci]
  [![Downloads][npm-stats-shield]][npm-stats]
</div>

## Introduction

Writing Outlook conditionals in HTML emails is gross:

```html
<!--[if mso]>
  <div>Show this in all Outlook versions</div>
<![endif]-->
```

It gets even worse when you need to target _specific versions_:

```html
<!--[if (gt mso 11)&(lte mso 15)]>
  <div>Show in 2007, 2010, 2013</div>
<![endif]-->
```

This PostHTML plugin simplifies the way you write Outlook conditional comments:

```html
<outlook>
  <div>Show this in all Outlook versions</div>
</outlook>
```

Like, really simple:

```html
<outlook gt="2003" lte="2013">
  <div>Show in 2007, 2010, 2013</div>
</outlook>
```

## Install

```
$ npm i posthtml-mso
```

## Usage

```js
const posthtml = require('posthtml')
const mso = require('posthtml-mso')
const options = { /* see options below */ }

posthtml([mso(options)])
  .process('<outlook only="2013">Show in Outlook 2013</outlook>')
  .then(result => console.log(result.html))

  // <!--[if mso 15]>Show in Outlook 2013<![endif]-->
```

## Syntax

The plugin provides two ([customizable](#options)) tags:

1. `<outlook>`
2. `<not-outlook>`

### `<outlook>`

This will output the content inside it, wrapped in an Outlook conditional comment.

The conditional is created based on the Outlook version(s) you need to target, which you can define inside special attributes ([documented below](#attributes)).

Using the tag with no attributes will target all Outlook versions:

```html
<outlook>
  <div>Show this in all Outlook versions</div>
</outlook>
```

Result:

```html
<!--[if mso]>
  <div>Show this in all Outlook versions</div>
<![endif]-->
```

### `<not-outlook>`

This tag will basically hide content from all Outlook versions:

```html
<not-outlook>
  <div>All Outlooks will ignore this</div>
</not-outlook>
```

Result:

```html
<!--[if !mso]><!-->
  <div>All Outlooks will ignore this</div>
<!--<![endif]-->
```

### Attributes

To define which Outlook versions you are targeting, you can use one of the following attributes:

- `only` - show only in these Outlook versions
- `not` - show in all versions _except_ these
- `lt` - all versions before this (not including it, i.e. _lower than_)
- `lte` - all versions before this (including it, i.e. _lower than or equal to_)
- `gt` - all versions after this (not including it, i.e. _greater than_)
- `gte` - all versions after this (including it, i.e. _greater than or equal to_)

### `only`

Show the content only in this Outlook version:

```html
<outlook only="2013">
  <div>Show only in Outlook 2013</div>
</outlook>
```

Result:

```html
<!--[if mso 15]>
  <div>Show only in Outlook 2013</div>
<![endif]-->
```

It also supports multiple, comma-separated versions:

```html
<outlook only="2013,2016">
  <div>Show only in Outlook 2013 and 2016</div>
</outlook>
```

Result:

```html
<!--[if (mso 15)|(mso 16)]>
  <div>Show only in Outlook 2013 and 2016</div>
<![endif]-->
```

Note: targeting Outlook 2016 will also target Outlook 2019 (see [gotchas](#gotchas)).

### `not`

Show content in all Outlook versions except the ones specified.

```html
<outlook not="2013">
  <div>Don't show in Outlook 2013</div>
</outlook>
```

Result:

```html
<!--[if !mso 15]>
  <div>Don't show in Outlook 2013</div>
<![endif]-->
```

You can also specify a comma-separated list of versions:

```html
<outlook not="2013,2016">
  <div>Don't show in Outlook 2013 and 2016</div>
</outlook>
```

Result:

```html
<!--[if !((mso 15)|(mso 16))]>
  <div>Don't show in Outlook 2013 and 2016</div>
<![endif]-->
```

### `lt`

Show in all versions before this one, excluding it:

```html
<outlook lt="2007">
  <div>Show in all Outlooks before 2007, excluding it</div>
</outlook>
```

Result:

```html
<!--[if lt mso 12]>
  <div>Show in all Outlooks before 2007, excluding it</div>
<![endif]-->
```

### `lte`

Show in all versions before this one, including it:

```html
<outlook lte="2007">
  <div>Show in all Outlooks before 2007, including it</div>
</outlook>
```

Result:

```html
<!--[if lte mso 12]>
  <div>Show in all Outlooks before 2007, including it</div>
<![endif]-->
```

### `gt`

Show in all Outlook versions after this one, excluding it:

```html
<outlook gt="2007">
  <div>Show in Outlook 2010, 2013, 2016, 2019</div>
</outlook>
```

Result:

```html
<!--[if gt mso 12]>
  <div>Show in Outlook 2010, 2013, 2016, 2019</div>
<![endif]-->
```

### `gte`

Show in all Outlook versions after this one, excluding it:

```html
<outlook gte="2007">
  <div>Show in Outlook 2007, 2010, 2013, 2016, 2019</div>
</outlook>
```

Result:

```html
<!--[if gte mso 12]>
  <div>Show in Outlook 2007, 2010, 2013, 2016, 2019</div>
<![endif]-->
```

## Combining Attributes

You can combine the `lt`, `gt`, `lte`, and `gte` attributes if you need to target multiple versions with higher accuracy.

```html
<outlook gt="2003" lte="2013">
  <div>Show in 2007, 2010, 2013</div>
</outlook>
```

Result:

```html
<!--[if (gt mso 11)&(lte mso 15)]>
  <div>Show in 2007, 2010, 2013</div>
<![endif]-->
```

## Gotchas

There are some cases that might not work as you'd expect.

### Outlook 2019

Outlook 2019 uses the same version identifier as Outlook 2016 - `16`.

Because of this, if you target either of them you will be targeting them both. Currently there is no way around this.

### Duplicate Attributes

Consider this example:

```html
<outlook gt="2003" lte="2013" gt="2007">
  <div>Show in 2007, 2010, 2013</div>
</outlook>
```

Since duplicate attributes are discarded when parsing, `gt="2007"` will not be taken into consideration. 

The result will be:

```html
<!--[if (gt mso 11)&(lte mso 15)]>
  <div>Show in 2007, 2010, 2013</div>
<![endif]-->
```

### Unknown Versions

Made a typo like this?

```html
<outlook lt="20007">
  <div>Target Outlooks before 2007</div>
</outlook>
```

If an unknown Outlook version is specified, the plugin will skip the tag and return its contents:

```html
<div>Target Outlooks before 2007</div>
```

Hopefully, we won't need this plugin by then...

## Options

### `tag`

Type: `string`\
Default: `outlook`

The name of the tag you want the plugin to use. Will be used for both available tags.

For example:

```js
const posthtml = require('posthtml')
const mso = require('posthtml-mso')
const html = `
  <mso only="2013">Show in Outlook 2013</mso>
  <not-mso>Hide from Outlook</not-mso>
`

posthtml([mso({ tag: 'mso' })])
  .process(html)
  .then(result => console.log(result.html))

  // <!--[if mso 15]>Show in Outlook 2013<![endif]-->
  // <!--[if !mso]><!-->Hide from Outlook<!--<![endif]-->
```

[npm]: https://www.npmjs.com/package/posthtml-mso
[npm-version-shield]: https://img.shields.io/npm/v/posthtml-mso.svg
[npm-stats]: http://npm-stat.com/charts.html?package=posthtml-mso
[npm-stats-shield]: https://img.shields.io/npm/dt/posthtml-mso.svg
[travis-ci]: https://travis-ci.org/posthtml/posthtml-mso/
[travis-ci-shield]: https://img.shields.io/travis/posthtml/posthtml-mso/master.svg
[license]: ./LICENSE
[license-shield]: https://img.shields.io/npm/l/posthtml-mso.svg
