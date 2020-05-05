'use strict'

module.exports = (options = {}) => tree => {
  options.tag = options.tag || 'outlook'

  const attributes = ['only', 'not', 'lt', 'lte', 'gt', 'gte']
  const versions = {
    2000: 9,
    2002: 10,
    2003: 11,
    2007: 12,
    2010: 14,
    2013: 15,
    2016: 16,
    2019: 16
  }

  const process = node => {
    // <not-outlook>
    if (node.tag === `not-${options.tag}`) {
      node.tag = false
      node.content = `<!--[if !mso]><!-->${tree.render(node.content)}<!--<![endif]-->`

      return node
    }

    // Uknown tag, skip and return content
    if (node.tag !== options.tag) {
      return node
    }

    node.tag = false

    // Don't parse nested tags, just remove them
    if (Array.isArray(node.content)) {
      node.content.forEach(line => {
        if (line.tag && [options.tag, `not-${options.tag}`].includes(line.tag)) {
          line.tag = false
        }
      })
    }

    // default behavior
    if (!hasAttributes(node.attrs, attributes)) {
      node.content = `<!--[if mso]>${tree.render(node.content)}<![endif]-->`

      return node
    }

    const foundAttrs = intersectAttributes(node.attrs, attributes)
    const firstAttr = foundAttrs[0]
    const secondAttr = foundAttrs[1] || false

    // `only` and `not` attributes
    if (['only', 'not'].includes(firstAttr)) {
      const items = node.attrs[firstAttr].split(',')
      const negation = firstAttr === 'not' ? '!' : ''

      if (items.length > 1) {
        let conditions = []

        items.forEach(item => {
          if (versions[item]) {
            conditions.push(`(mso ${versions[item]})`)
          }
        })

        conditions = [...new Set(conditions)]
        conditions = conditions.length > 1 ? conditions.join('|') : conditions[0].replace(/[()]/g, '')

        if (firstAttr === 'not') {
          // negate entire block: !((..)|(..))
          node.content = `<!--[if ${negation}(${conditions})]>${tree.render(node.content)}<![endif]-->`
        } else {
          node.content = `<!--[if ${conditions}]>${tree.render(node.content)}<![endif]-->`
        }
      } else if (items.length === 1 && versions[items[0]]) {
        node.content = `<!--[if ${negation}mso ${versions[items[0]]}]>${tree.render(node.content)}<![endif]-->`
      }

      return node
    }

    // Between - must come before the others
    if (
      arraysMatch(foundAttrs, ['gt', 'lt']) ||
      arraysMatch(foundAttrs, ['gt', 'lte']) ||
      arraysMatch(foundAttrs, ['gte', 'lte']) ||
      arraysMatch(foundAttrs, ['gte', 'lt']) ||
      arraysMatch(foundAttrs, ['lt', 'gt']) ||
      arraysMatch(foundAttrs, ['lt', 'gte']) ||
      arraysMatch(foundAttrs, ['lte', 'gte']) ||
      arraysMatch(foundAttrs, ['lte', 'gt'])
    ) {
      if (versions[node.attrs[firstAttr]] && versions[node.attrs[secondAttr]]) {
        node.content = `<!--[if (${firstAttr} mso ${versions[node.attrs[firstAttr]]})&(${secondAttr} mso ${versions[node.attrs[secondAttr]]})]>${tree.render(node.content)}<![endif]-->`
      }

      return node
    }

    // `lt` attribute
    if (firstAttr === 'lt' && versions[node.attrs.lt]) {
      node.content = `<!--[if lt mso ${versions[node.attrs.lt]}]>${tree.render(node.content)}<![endif]-->`

      return node
    }

    // `lte` attribute
    if (firstAttr === 'lte' && versions[node.attrs.lte]) {
      node.content = `<!--[if lte mso ${versions[node.attrs.lte]}]>${tree.render(node.content)}<![endif]-->`

      return node
    }

    // `gt` attribute
    if (firstAttr === 'gt' && versions[node.attrs.gt]) {
      node.content = `<!--[if gt mso ${versions[node.attrs.gt]}]>${tree.render(node.content)}<![endif]-->`

      return node
    }

    // `gte` attribute
    if (firstAttr === 'gte' && versions[node.attrs.gte]) {
      node.content = `<!--[if gte mso ${versions[node.attrs.gte]}]>${tree.render(node.content)}<![endif]-->`

      return node
    }

    return node
  }

  return tree.walk(process)
}

const hasAttributes = (o, a) => o ? Object.keys(o).some(r => a.includes(r)) : false
const intersectAttributes = (o, a) => o ? Object.keys(o).filter(r => a.includes(r)) : false

const arraysMatch = (first, second) => {
  if (first.length !== second.length) {
    return false
  }

  for (const [i, element] of first.entries()) {
    if (element !== second[i]) {
      return false
    }
  }

  return true
}
