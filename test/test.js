import path from 'node:path'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {test, expect} from 'vitest'
import posthtml from 'posthtml'
import plugin from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixture = file => readFileSync(path.join(__dirname, 'fixtures', `${file}.html`), 'utf8').trim()
const expected = file => readFileSync(path.join(__dirname, 'expected', `${file}.html`), 'utf8').trim()

const clean = html => html.replace(/[^\S\r\n]+$/gm, '').trim()

const process = (_t, name, options, log = false) => {
  return posthtml([plugin(options)])
    .process(fixture(name))
    .then(result => log ? console.log(result.html) : clean(result.html))
    .then(html => expect(html).toEqual(expected(name)))
}

test('It can use a custom tag name', t => {
  return process(t, 'custom-tag', {tag: 'mso'})
})

test('It targets all Outlook versions by default', t => {
  return process(t, 'default')
})

test('It targets only Outlooks in the `only` attribute', t => {
  return process(t, 'only')
})

test('It targets all Outlooks except the ones in the `not` attribute', t => {
  return process(t, 'not')
})

test('It targets all Outlooks before that in the `lt` attribute', t => {
  return process(t, 'lt')
})

test('It targets all Outlooks before that in the `lte` attribute', t => {
  return process(t, 'lte')
})

test('It targets all Outlooks after that in the `gt` attribute', t => {
  return process(t, 'gt')
})

test('It targets all Outlooks after that in the `gte` attribute', t => {
  return process(t, 'gte')
})

test('It targets all Outlooks between the two specified attributes', t => {
  return process(t, 'between')
})

test('It does not target 2016 and 2019 separately', t => {
  return process(t, '2019')
})

test('It can output content that is ignored by all Outlooks', t => {
  return process(t, 'not-outlook')
})

test('It does not parse nested tags, removing them instead', t => {
  return process(t, 'nested')
})

test('It returns only the content when an unknown Outlook version is specified', t => {
  return process(t, 'unknown-version')
})
